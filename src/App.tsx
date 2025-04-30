import { useState, useEffect } from "react";
import "./App.css";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";


function App() {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [models, setModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState("");
  const [modelError, setModelError] = useState("");

  // Fetch available models on component mount
  useEffect(() => {
    async function fetchModels() {
      try {
        const availableModels = await invoke<string[]>("fetch_ollama_models");
        setModels(availableModels);
        if (availableModels.length > 0) {
          setSelectedModel(availableModels[0]);
        }
      } catch (error) {
        console.error("Failed to fetch models:", error);
        setModelError("Failed to connect to Ollama. Is Ollama running?");
      }
    }
    fetchModels();
  }, []);

  // Handle humanizing text with streaming
  async function humanizeText() {
    if (!inputText.trim() || !selectedModel) return;
    setIsLoading(true);
    setOutputText(""); // Clear previous output
    let unlisten: (() => void) | null = null;
    try {
      // Set up a single event listener for streaming
      unlisten = await listen<string>(
        "humanize-text-chunk",
        (event) => {
          if (event.payload === "__COMPLETE__") {
            setIsLoading(false);
            if (unlisten) unlisten();
          } else {
            setOutputText((prev) => prev + event.payload);
          }
        }
      );
      // Invoke the streaming command
      await invoke("humanize_text", {
        window: undefined, // Tauri injects window automatically
        model: selectedModel,
        text: inputText,
      });
    } catch (error) {
      setIsLoading(false);
      setOutputText(`Error: ${error}`);
      console.error("Error during humanization:", error);
      if (unlisten) unlisten();
    }
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Text Humanizer</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Transform machine-generated text into natural-sounding human writing
        </p>
      </header>
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">
          Select AI Model
        </label>
        {modelError ? (
          <div className="p-3 mb-4 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 rounded-md">
            {modelError}
          </div>
        ) : models.length === 0 ? (
          <div className="p-3 mb-4 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-md">
            Loading models...
          </div>
        ) : (
          <Select value={selectedModel} onValueChange={setSelectedModel}>
            <SelectTrigger className="w-full md:w-[250px]">
              <SelectValue placeholder="Select a model" />
            </SelectTrigger>
            <SelectContent>
              {models.map((model) => (
                <SelectItem key={model} value={model}>
                  {model}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <h2 className="text-lg font-medium">Input Text</h2>
          <Textarea
            placeholder="Enter AI-generated text here..."
            className="min-h-[240px] resize-none"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
        </div>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium">Humanized Output</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
              disabled={!outputText}
            >
              {isEditing ? "Preview" : "Edit"}
            </Button>
          </div>
          <div className="border rounded-md dark:border-gray-700 min-h-[240px] overflow-auto">
            {isEditing ? (
              <Textarea
                placeholder="Edit humanized text here..."
                className="min-h-[240px] resize-none border-none focus-visible:ring-0"
                value={outputText}
                onChange={(e) => setOutputText(e.target.value)}
              />
            ) : (
              <div className="p-3 prose dark:prose-invert prose-sm max-w-none overflow-auto">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw, rehypeSanitize]}
                >
                  {outputText || "Humanized text will appear here..."}
                </ReactMarkdown>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="mt-6 flex justify-center">
        <Button
          onClick={humanizeText}
          disabled={!inputText.trim() || !selectedModel || isLoading || models.length === 0}
          className="px-8"
        >
          {isLoading ? "Processing..." : "Humanize Text"}
        </Button>
      </div>
    </main>
  );
}

export default App;