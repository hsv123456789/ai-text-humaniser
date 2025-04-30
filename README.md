# AI Text Humanizer

![AI Text Humanizer Logo](public/vite.svg)

A desktop application that transforms AI-generated text into natural-sounding human writing. Built with Tauri, React, and Ollama.

## 📋 Overview

AI Text Humanizer helps you refine and improve machine-generated content to sound more natural, engaging, and human-like. The application connects to locally running AI models via Ollama to transform text while maintaining the original meaning.

## ✨ Features

- **Text Humanization**: Transform AI-generated content into natural-sounding writing
- **Chat Interface**: Have conversational interactions for humanizing longer texts
- **Model Selection**: Choose from any AI model available in your local Ollama installation
- **Theme Support**: Light, dark, and system themes available
- **Markdown Support**: Rendered output supports Markdown formatting
- **Streaming Responses**: Real-time text generation with streaming

## 🔧 Prerequisites

Before using AI Text Humanizer, ensure you have the following installed:

- [Ollama](https://ollama.ai/download) - For running local AI models
- At least one language model installed in Ollama (e.g., llama2, mistral, etc.)

## 🚀 Installation

### Download Pre-built Binaries

Download the latest release for your platform from the [Releases](https://github.com/yourusername/ai-text-humanizer/releases) page.

### Build from Source

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/ai-text-humanizer.git
   cd ai-text-humanizer
   ```

2. Install dependencies:
   ```bash
   bun install
   # or
   npm install
   ```

3. Build the application:
   ```bash
   bun run tauri build
   # or
   npm run tauri build
   ```

## 🖥️ Usage

1. Start the Ollama service on your system
2. Launch AI Text Humanizer
3. Select an AI model from the dropdown menu
4. Enter or paste AI-generated text in the input area
5. Click "Humanize Text" to transform the content
6. View, edit, and copy the humanized results

### Main Interface

The application features a simple two-panel interface:
- Left panel: Input your AI-generated text
- Right panel: View and edit the humanized output

### Chat Interface

For more interactive humanization:
- Navigate to the Chat tab
- Enter your text or prompts
- Engage in a conversation to refine your content

### Settings

Configure application preferences:
- Theme settings (light/dark/system)
- Model installation (coming soon)

## 🧰 Technical Stack

- **Frontend**: React, TypeScript, TailwindCSS
- **Backend**: Rust, Tauri
- **AI Integration**: Ollama API
- **UI Components**: Shadcn UI inspired components

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Contact

Project Link: [https://github.com/yourusername/ai-text-humanizer](https://github.com/yourusername/ai-text-humanizer)
