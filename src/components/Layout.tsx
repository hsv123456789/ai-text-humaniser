import { Link, Outlet, useLocation } from "react-router-dom";
import { Home, MessageCircle, Settings as SettingsIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Layout() {
  const location = useLocation();
  
  return (
    <div className="min-h-screen flex flex-col">
      <nav className="border-b dark:border-gray-800 p-4">
        <div className="container mx-auto flex justify-between items-center max-w-4xl">
          <h1 className="font-bold text-xl">AI Text Humanizer</h1>
          <div className="flex gap-2">
            <Link to="/">
              <Button 
                variant={location.pathname === "/" ? "default" : "ghost"}
                size="sm"
              >
                <Home className="h-4 w-4 mr-2" />
                Home
              </Button>
            </Link>
            <Link to="/chat">
              <Button 
                variant={location.pathname === "/chat" ? "default" : "ghost"}
                size="sm"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Chat
              </Button>
            </Link>
            <Link to="/settings">
              <Button 
                variant={location.pathname === "/settings" ? "default" : "ghost"}
                size="sm"
              >
                <SettingsIcon className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </Link>
          </div>
        </div>
      </nav>
      
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
}