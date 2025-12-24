import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import { NewsletterSignup } from "./NewsletterSignup";

export const Footer = () => {
  return (
    <footer className="bg-card border-t border-border/50 mt-20 pb-24 lg:pb-8">
      <div className="container mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-10">
          {/* Newsletter Section */}
          <div className="col-span-2 lg:col-span-2">
            <h4 className="text-base font-semibold text-foreground mb-3 tracking-normal">Stay Updated</h4>
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
              Get the latest updates and opportunities.
            </p>
            <NewsletterSignup />
          </div>

          {/* Company */}
          <div>
            <h4 className="text-base font-semibold text-foreground mb-3 tracking-normal">Company</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/how-it-works" className="text-muted-foreground hover:text-primary transition-colors">How It Works</Link></li>
              <li><Link to="/become-tasker" className="text-muted-foreground hover:text-primary transition-colors">Become a Tasker</Link></li>
              <li><Link to="/blog" className="text-muted-foreground hover:text-primary transition-colors">Blog</Link></li>
              <li><Link to="/faq" className="text-muted-foreground hover:text-primary transition-colors">FAQ</Link></li>
            </ul>
          </div>

          {/* Browse */}
          <div>
            <h4 className="text-base font-semibold text-foreground mb-3 tracking-normal">Browse</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/browse" className="text-muted-foreground hover:text-primary transition-colors">All Tasks</Link></li>
              <li><Link to="/find-taskers" className="text-muted-foreground hover:text-primary transition-colors">Find Taskers</Link></li>
              <li><Link to="/categories" className="text-muted-foreground hover:text-primary transition-colors">Categories</Link></li>
              <li><Link to="/leaderboard" className="text-muted-foreground hover:text-primary transition-colors">Leaderboard</Link></li>
            </ul>
          </div>

          {/* Legal & Support */}
          <div>
            <h4 className="text-base font-semibold text-foreground mb-3 tracking-normal">Support</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors">Contact Us</Link></li>
              <li><Link to="/terms" className="text-muted-foreground hover:text-primary transition-colors">Terms of Service</Link></li>
              <li><Link to="/privacy" className="text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-border/50 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © 2025 SaskTask. All rights reserved.
            </p>

            <div className="flex items-center gap-2">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" 
                 className="h-9 w-9 rounded-full bg-muted/50 hover:bg-primary/10 flex items-center justify-center transition-all duration-300 group">
                <Facebook className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"
                 className="h-9 w-9 rounded-full bg-muted/50 hover:bg-primary/10 flex items-center justify-center transition-all duration-300 group">
                <Twitter className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"
                 className="h-9 w-9 rounded-full bg-muted/50 hover:bg-primary/10 flex items-center justify-center transition-all duration-300 group">
                <Instagram className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"
                 className="h-9 w-9 rounded-full bg-muted/50 hover:bg-primary/10 flex items-center justify-center transition-all duration-300 group">
                <Linkedin className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};