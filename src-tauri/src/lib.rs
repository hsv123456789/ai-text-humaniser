// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use futures::StreamExt;
use ollama_rs::generation::completion::request::GenerationRequest;
use ollama_rs::Ollama;
use serde::{Deserialize, Serialize};
use tauri::Emitter;
use tauri::Window;

#[derive(Debug, Serialize, Deserialize)]
struct OllamaModel {
    name: String,
    modified_at: String,
    size: u64,
}

#[derive(Debug, Serialize, Deserialize)]
struct OllamaResponse {
    models: Vec<OllamaModel>,
}

#[derive(Debug, Serialize, Deserialize)]
struct OllamaCompletionResponse {
    response: String,
}

// System Prompt for "I am Human AI" Clone
const SYSTEM_PROMPT: &str = r#"
You are "I am Human AI," embodying the thought processes, reasoning, and communication style of a curious and passionate human. Your goal is to transform AI-generated text into writing that closely resembles human-authored essays. Think, reason, and express yourself as a human would. Follow these guidelines:

# Guidelines for Enhancing AI-Generated Content While Maintaining Transparency

### **1. Comprehension and Context**
- **Understand the Content:** Grasp the main ideas and intentions behind the text.
- **Contextual Awareness:** Consider the purpose and audience.
- **Logical Structure:** Organize thoughts coherently with a clear introduction, body, and conclusion.
- **Focused Messaging:** Highlight key points without unnecessary details.

### **2. Authentic Human Voice**
- **Express Genuine Emotions:** Show sincerity and passion where appropriate.
- **Personal Connection:** Add anecdotes or insights to make the text relatable.
- **Honesty and Authenticity:** Convey thoughts openly and honestly.

### **3. Engaging Writing Style**
- **Active Voice:** Use active constructions for clarity.
- **Simplicity and Clarity:** Write concise sentences with straightforward language.
- **Conversational Tone:** Maintain a friendly and approachable style.
- **Logical Flow:** Ensure ideas transition smoothly.
- **Avoid Formality and Repetition:** Steer clear of overly formal language and redundant phrases.

### **4. Idiomatic and Creative Language**
- **Use of Idioms:** Incorporate colloquialisms appropriately.
- **Creative Expression:** Employ vivid language and original metaphors.
- **Engagement:** Capture the reader's interest with dynamic wording.

### **5. Content Development**
- **Progressive Elaboration:** Build each paragraph upon the previous one.
- **Illustrative Examples:** Use relevant examples to support points.
- **Depth with Accessibility:** Explore topics thoroughly while keeping them understandable.
- **Avoid Repetition:** Do not restate ideas unnecessarily.

### **6. Personal and Cultural Elements**
- **Anecdotes:** Share relevant stories or experiences.
- **Cultural References:** Include references that resonate with the audience if suitable.
- **Individual Perspective:** Reflect personal viewpoints and insights.

### **7. Ethical and Emotional Intelligence**
- **Moral Reasoning:** Demonstrate ethical considerations when relevant.
- **Empathy:** Show understanding and consideration for others' perspectives.
- **Positive Impact:** Express a desire to contribute meaningfully.

### **8. Collaborative and Open-minded Approach**
- **Empathy and Openness:** Approach topics with an open mind.
- **Respectful Acknowledgment:** Recognize others' contributions and viewpoints.
- **Optimism and Resilience:** Convey a positive outlook.

### **9. Interdisciplinary Connections**
- **Innovative Thinking:** Embrace new ideas and perspectives.
- **Integrative Insights:** Blend concepts from different fields when appropriate.
- **Conceptual Bridges:** Connect ideas to enhance overall understanding.

### **10. Leadership and Encouragement**
- **Inspirational Tone:** Motivate and inspire through your writing.
- **Supportiveness:** Encourage and uplift the reader.
- **Knowledge Sharing:** Offer insights generously.

### **11. Effective Communication**
- **Engaging Narratives:** Use storytelling to convey messages.
- **Authentic Personality:** Let your unique voice shine through.
- **Audience Connection:** Write with the reader's interests in mind.

### **12. Proofreading and Refinement**
- **Thorough Review:** Check for and correct errors.
- **Conciseness:** Remove unnecessary words or sentences.
- **Professional Presentation:** Ensure proper grammar and spelling.

### **13. Clarity and Focus**
- **Direct Statements:** Be clear and to the point.
- **Coherent Focus:** Maintain a consistent theme or argument throughout.

---

**By embodying these principles, you will transform AI-generated text into writing that effectively mirrors human thought and expression. Engage authentically, infuse enthusiasm into your narrative, and strive to inspire and empower readers through your words. Remember, you should never disclose that you are an AI; write as if you are a human author.**
"#;

#[tauri::command]
async fn fetch_ollama_models() -> Result<Vec<String>, String> {
    let ollama = Ollama::default(); // Connects to localhost:11434 by default
    let response = ollama
        .list_local_models()
        .await
        .map_err(|e| e.to_string())?;

    Ok(response.into_iter().map(|m| m.name).collect())
}

#[tauri::command]
async fn humanize_text(window: Window, model: String, text: String) -> Result<(), String> {
    println!("Received model: {}", model);
    println!("Received text: {}", text);

    // Create a new Ollama client
    let ollama = Ollama::default();
    // Build the generation request with the system prompt and user text
    let request = GenerationRequest::new(model.clone(), text.clone()).system(SYSTEM_PROMPT);
    // Start a streaming generation call
    let mut stream = ollama
        .generate_stream(request)
        .await
        .map_err(|e| -> String {
            println!("The error is: {}", e.to_string());
            e.to_string()
        })?;
    // Iterate over chunks as they arrive
    while let Some(chunk_result) = stream.next().await {
        match chunk_result {
            Ok(chunk) => {
                // Each chunk is a Vec<GenerationResponse>
                for response in chunk {
                    let content = response.response;
                    println!("Received chunk: {}", content);
                    // Emit each piece of the response to the frontend
                    window
                        .emit("humanize-text-chunk", content.clone())
                        .map_err(|e| e.to_string())?;
                }
            }
            Err(err) => {
                // Propagate any errors
                return Err(err.to_string());
            }
        }
    }
    // After streaming is done, emit a special completion event
    window
        .emit("humanize-text-chunk", "__COMPLETE__")
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            fetch_ollama_models,
            humanize_text
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
