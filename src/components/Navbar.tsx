import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { Menu } from "lucide-react";

interface NavbarProps {
  onMenuClick?: () => void;
}

export const Navbar = ({ onMenuClick }: NavbarProps) => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <div className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              SaskTask
            </div>
          </Link>
          
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/browse" className="text-foreground hover:text-primary transition-colors">
              Browse Tasks
            </Link>
            <Link to="/how-it-works" className="text-foreground hover:text-primary transition-colors">
              How It Works
            </Link>
            <Link to="/auth" className="text-foreground hover:text-primary transition-colors">
              Sign In
            </Link>
            <Link to="/auth">
              <Button variant="hero" size="default">Get Started</Button>
            </Link>
          </div>

          <button onClick={onMenuClick} className="md:hidden">
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>
    </nav>
  );
};
