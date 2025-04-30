import { useState, useEffect, useRef } from "react";
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
import { MessageCircle, Send, RefreshCw } from "lucide-react";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export default function Chat() {
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [models, setModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState("");
  const [modelError, setModelError] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

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

  // Handle sending a message
  async function sendMessage() {
    if (!inputText.trim() || !selectedModel || isLoading) return;
    
    // Add user message to chat
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputText,
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    
    // Create placeholder for assistant response
    const assistantMessageId = (Date.now() + 1).toString();
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: "assistant",
      content: "",
    };
    
    setMessages((prev) => [...prev, assistantMessage]);
    setInputText(""); // Clear input field
    
    let unlisten: (() => void) | null = null;
    
    try {
      // Set up event listener for streaming
      unlisten = await listen<string>(
        "humanize-text-chunk",
        (event) => {
          if (event.payload === "__COMPLETE__") {
            setIsLoading(false);
            if (unlisten) unlisten();
          } else {
            // Update the assistant's message with new content
            setMessages((prevMessages) =>
              prevMessages.map((msg) =>
                msg.id === assistantMessageId
                  ? { ...msg, content: msg.content + event.payload }
                  : msg
              )
            );
          }
        }
      );
      
      // Invoke the streaming command
      await invoke("humanize_text", {
        window: undefined,
        model: selectedModel,
        text: inputText,
      });
    } catch (error) {
      setIsLoading(false);
      
      // Update the assistant message with the error
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === assistantMessageId
            ? { ...msg, content: `Error: ${error}` }
            : msg
        )
      );
      
      console.error("Error during humanization:", error);
      if (unlisten) unlisten();
    }
  }

  // Clear chat messages
  function clearChat() {
    setMessages([]);
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl h-[calc(100vh-7rem)]">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Chat Interface</h1>
        <p className="text-gray-500 dark:text-gray-400">
          For humanizing longer texts through conversational interaction
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
          <div className="flex justify-between items-center">
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
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={clearChat}
              disabled={messages.length === 0}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Clear Chat
            </Button>
          </div>
        )}
      </div>
      
      <div className="flex flex-col h-[calc(100vh-20rem)]">
        {/* Chat messages container */}
        <div className="flex-1 overflow-y-auto border rounded-t-md dark:border-gray-700 p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-400">
              <div className="text-center">
                <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Send a message to start humanizing text...</p>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-4 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  <div className="prose dark:prose-invert prose-sm max-w-none">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeRaw, rehypeSanitize]}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Input area */}
        <div className="border-t-0 border rounded-b-md dark:border-gray-700 p-2">
          <div className="flex gap-2">
            <Textarea
              placeholder="Enter text to humanize..."
              className="resize-none min-h-[5rem]"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.shiftKey === false) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
            />
            <Button
              onClick={sendMessage}
              disabled={!inputText.trim() || !selectedModel || isLoading || models.length === 0}
              className="self-end"
            >
              {isLoading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          <div className="mt-1 text-xs text-gray-500">
            Press Shift+Enter for a new line, Enter to send
          </div>
        </div>
      </div>
    </main>
  );
}