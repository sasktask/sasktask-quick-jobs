import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-card border-t border-border/50 mt-20 pb-24 lg:pb-8">
      <div className="container mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Logo & Copyright */}
          <div className="text-center md:text-left">
            <Link to="/" className="text-xl font-bold text-gradient-hero">
              SaskTask
            </Link>
            <p className="text-sm text-muted-foreground mt-1">
              © 2025 SaskTask. All rights reserved.
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            <Link to="/how-it-works" className="hover:text-primary transition-colors">How It Works</Link>
            <Link to="/browse" className="hover:text-primary transition-colors">Browse Tasks</Link>
            <Link to="/contact" className="hover:text-primary transition-colors">Contact</Link>
            <Link to="/terms" className="hover:text-primary transition-colors">Terms</Link>
            <Link to="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
          </div>

          {/* Social */}
          <div className="flex items-center gap-2">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" 
               className="h-9 w-9 rounded-full bg-muted/50 hover:bg-primary/10 flex items-center justify-center transition-colors">
              <Facebook className="h-4 w-4 text-muted-foreground hover:text-primary" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"
               className="h-9 w-9 rounded-full bg-muted/50 hover:bg-primary/10 flex items-center justify-center transition-colors">
              <Twitter className="h-4 w-4 text-muted-foreground hover:text-primary" />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"
               className="h-9 w-9 rounded-full bg-muted/50 hover:bg-primary/10 flex items-center justify-center transition-colors">
              <Instagram className="h-4 w-4 text-muted-foreground hover:text-primary" />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"
               className="h-9 w-9 rounded-full bg-muted/50 hover:bg-primary/10 flex items-center justify-center transition-colors">
              <Linkedin className="h-4 w-4 text-muted-foreground hover:text-primary" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};