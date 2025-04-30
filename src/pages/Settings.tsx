import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ThemeSwitch } from "@/components/ui/theme-switch";
import { Textarea } from "@/components/ui/textarea";
import { Download, CheckCircle2, XCircle } from "lucide-react";

export default function Settings() {
  const [modelUrl, setModelUrl] = useState("");
  const [modelName, setModelName] = useState("");
  const [isInstalling, setIsInstalling] = useState(false);
  const [installStatus, setInstallStatus] = useState<"idle" | "success" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState("");

  const handleModelInstall = async () => {
    if (!modelUrl.trim() || !modelName.trim()) return;
    
    setIsInstalling(true);
    setInstallStatus("idle");
    setStatusMessage("");
    
    try {
      // This will be connected to Ollama API later
      // For now, we're just setting up the UI
      // Example: await invoke("install_model", { url: modelUrl, name: modelName });
      
      // Simulate installation process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setInstallStatus("success");
      setStatusMessage(`Model "${modelName}" installed successfully!`);
      setModelUrl("");
      setModelName("");
    } catch (error) {
      console.error(error);
      setInstallStatus("error");
      setStatusMessage(`Failed to install model: ${error}`);
    } finally {
      setIsInstalling(false);
    }
  };

  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Configure your AI Text Humanizer preferences
        </p>
      </header>

      <div className="space-y-8">
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Theme</h2>
          <div className="p-4 border rounded-lg dark:border-gray-800">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium">Appearance</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Choose your preferred theme
                </p>
              </div>
              <ThemeSwitch />
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Install Model</h2>
          <div className="p-4 border rounded-lg dark:border-gray-800 space-y-4">
            <div className="space-y-2">
              <label htmlFor="model-name" className="block font-medium">
                Model Name
              </label>
              <input
                id="model-name"
                type="text"
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                placeholder="Enter model name (e.g. llama2-7b)"
                className="w-full px-3 py-2 border rounded-md dark:bg-input/30 dark:border-gray-700"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="model-url" className="block font-medium">
                Model URL or Path
              </label>
              <Textarea
                id="model-url"
                value={modelUrl}
                onChange={(e) => setModelUrl(e.target.value)}
                placeholder="Enter model URL or local path"
                className="resize-none"
              />
            </div>
            
            <Button
              onClick={handleModelInstall}
              disabled={!modelUrl.trim() || !modelName.trim() || isInstalling}
              className="w-full"
            >
              {isInstalling ? (
                "Installing..."
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" /> Install Model
                </>
              )}
            </Button>
            
            {installStatus !== "idle" && (
              <div className={`p-3 rounded-md flex items-center gap-2 ${
                installStatus === "success" 
                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
              }`}>
                {installStatus === "success" ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  <XCircle className="h-5 w-5" />
                )}
                <p>{statusMessage}</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}