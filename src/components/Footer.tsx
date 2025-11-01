import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Linkedin, Globe } from "lucide-react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Footer = () => {
  const [language, setLanguage] = useState("English");
  
  const languages = [
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "fr", name: "Français", flag: "🇫🇷" },
    { code: "es", name: "Español", flag: "🇪🇸" },
    { code: "de", name: "Deutsch", flag: "🇩🇪" },
  ];

  return (
    <footer className="bg-card/50 backdrop-blur-sm border-t border-border/50 mt-20">
      <div className="container mx-auto px-4 py-10">
        {/* Main Footer Content */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
          {/* Become a Tasker */}
          <div>
            <h4 className="font-semibold text-foreground mb-3 text-sm">Become a Tasker</h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li><Link to="/signup-tasker" className="hover:text-primary transition-colors">Sign Up as Tasker</Link></li>
              <li><Link to="/tasker-benefits" className="hover:text-primary transition-colors">Tasker Benefits</Link></li>
              <li><Link to="/how-to-earn" className="hover:text-primary transition-colors">How to Earn</Link></li>
              <li><Link to="/tasker-faq" className="hover:text-primary transition-colors">Tasker FAQs</Link></li>
            </ul>
          </div>

          {/* Services By City */}
          <div>
            <h4 className="font-semibold text-foreground mb-3 text-sm">Services By City</h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li><Link to="/saskatoon" className="hover:text-primary transition-colors">Saskatoon</Link></li>
              <li><Link to="/regina" className="hover:text-primary transition-colors">Regina</Link></li>
              <li><Link to="/prince-albert" className="hover:text-primary transition-colors">Prince Albert</Link></li>
              <li><Link to="/moose-jaw" className="hover:text-primary transition-colors">Moose Jaw</Link></li>
              <li><Link to="/all-cities" className="hover:text-primary transition-colors">View All Cities</Link></li>
            </ul>
          </div>

          {/* All Services */}
          <div>
            <h4 className="font-semibold text-foreground mb-3 text-sm">All Services</h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li><Link to="/browse?category=assembly" className="hover:text-primary transition-colors">Assembly</Link></li>
              <li><Link to="/browse?category=mounting" className="hover:text-primary transition-colors">Mounting</Link></li>
              <li><Link to="/browse?category=moving" className="hover:text-primary transition-colors">Moving</Link></li>
              <li><Link to="/browse?category=cleaning" className="hover:text-primary transition-colors">Cleaning</Link></li>
              <li><Link to="/browse?category=outdoor" className="hover:text-primary transition-colors">Outdoor Help</Link></li>
              <li><Link to="/browse" className="hover:text-primary transition-colors">See All Services</Link></li>
            </ul>
          </div>

          {/* Elite Taskers */}
          <div>
            <h4 className="font-semibold text-foreground mb-3 text-sm">Elite Taskers</h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li><Link to="/elite-program" className="hover:text-primary transition-colors">Elite Program</Link></li>
              <li><Link to="/top-taskers" className="hover:text-primary transition-colors">Top Taskers</Link></li>
              <li><Link to="/elite-benefits" className="hover:text-primary transition-colors">Elite Benefits</Link></li>
              <li><Link to="/become-elite" className="hover:text-primary transition-colors">Become Elite</Link></li>
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="font-semibold text-foreground mb-3 text-sm">Help</h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li><Link to="/help-center" className="hover:text-primary transition-colors">Help Center</Link></li>
              <li><Link to="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
              <li><Link to="/safety" className="hover:text-primary transition-colors">Safety</Link></li>
              <li><Link to="/faq" className="hover:text-primary transition-colors">FAQs</Link></li>
              <li><Link to="/support" className="hover:text-primary transition-colors">Support</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-foreground mb-3 text-sm">Company</h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li><Link to="/about" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link to="/careers" className="hover:text-primary transition-colors">Careers</Link></li>
              <li><Link to="/press" className="hover:text-primary transition-colors">Press</Link></li>
              <li><Link to="/social-impact" className="hover:text-primary transition-colors">SaskTask for Good</Link></li>
              <li><Link to="/blog" className="hover:text-primary transition-colors">Blog</Link></li>
            </ul>
          </div>
        </div>

        {/* Social Media & Bottom Links */}
        <div className="border-t border-border/50 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Social Media Icons */}
            <div className="flex items-center gap-3">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="h-8 w-8 rounded-full bg-muted/50 hover:bg-primary/20 flex items-center justify-center transition-all group">
                <Facebook className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="h-8 w-8 rounded-full bg-muted/50 hover:bg-primary/20 flex items-center justify-center transition-all group">
                <Twitter className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="h-8 w-8 rounded-full bg-muted/50 hover:bg-primary/20 flex items-center justify-center transition-all group">
                <Instagram className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="h-8 w-8 rounded-full bg-muted/50 hover:bg-primary/20 flex items-center justify-center transition-all group">
                <Linkedin className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </a>
            </div>

            {/* Legal Links */}
            <div className="flex flex-wrap justify-center gap-3 text-xs text-muted-foreground">
              <Link to="/terms" className="hover:text-primary transition-colors">Terms & Privacy</Link>
              <span>•</span>
              <Link to="/ads" className="hover:text-primary transition-colors">About our Ads</Link>
              <span>•</span>
              <Link to="/legal" className="hover:text-primary transition-colors">Legal</Link>
            </div>
          </div>

          {/* Copyright & Language Selector */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-3 mt-4">
            <div className="text-center md:text-left text-xs text-muted-foreground/70 font-light">
              <p>&copy; 2025 SaskTask. All rights reserved.</p>
            </div>
            
            {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card hover:bg-muted/80 transition-colors text-sm text-foreground border border-border/50 shadow-sm hover:shadow-md">
                <Globe className="h-4 w-4 text-primary" />
                <span className="font-medium">{language}</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44 bg-card border-border/50 shadow-lg">
                {languages.map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => setLanguage(lang.name)}
                    className="flex items-center gap-2.5 text-sm cursor-pointer py-2.5 hover:bg-muted"
                  >
                    <span className="text-lg">{lang.flag}</span>
                    <span className="font-medium">{lang.name}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </footer>
  );
};
