import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-card border-t border-border mt-20">
      <div className="container mx-auto px-4 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mb-12">
          {/* Become a Tasker */}
          <div>
            <h4 className="font-bold text-foreground mb-4">Become a Tasker</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link to="/signup-tasker" className="hover:text-primary transition-colors">Sign Up as Tasker</Link></li>
              <li><Link to="/tasker-benefits" className="hover:text-primary transition-colors">Tasker Benefits</Link></li>
              <li><Link to="/how-to-earn" className="hover:text-primary transition-colors">How to Earn</Link></li>
              <li><Link to="/tasker-faq" className="hover:text-primary transition-colors">Tasker FAQs</Link></li>
            </ul>
          </div>

          {/* Services By City */}
          <div>
            <h4 className="font-bold text-foreground mb-4">Services By City</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link to="/saskatoon" className="hover:text-primary transition-colors">Saskatoon</Link></li>
              <li><Link to="/regina" className="hover:text-primary transition-colors">Regina</Link></li>
              <li><Link to="/prince-albert" className="hover:text-primary transition-colors">Prince Albert</Link></li>
              <li><Link to="/moose-jaw" className="hover:text-primary transition-colors">Moose Jaw</Link></li>
              <li><Link to="/all-cities" className="hover:text-primary transition-colors">View All Cities</Link></li>
            </ul>
          </div>

          {/* All Services */}
          <div>
            <h4 className="font-bold text-foreground mb-4">All Services</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
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
            <h4 className="font-bold text-foreground mb-4">Elite Taskers</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link to="/elite-program" className="hover:text-primary transition-colors">Elite Program</Link></li>
              <li><Link to="/top-taskers" className="hover:text-primary transition-colors">Top Taskers</Link></li>
              <li><Link to="/elite-benefits" className="hover:text-primary transition-colors">Elite Benefits</Link></li>
              <li><Link to="/become-elite" className="hover:text-primary transition-colors">Become Elite</Link></li>
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="font-bold text-foreground mb-4">Help</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link to="/help-center" className="hover:text-primary transition-colors">Help Center</Link></li>
              <li><Link to="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
              <li><Link to="/safety" className="hover:text-primary transition-colors">Safety</Link></li>
              <li><Link to="/faq" className="hover:text-primary transition-colors">FAQs</Link></li>
              <li><Link to="/support" className="hover:text-primary transition-colors">Support</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-bold text-foreground mb-4">Company</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link to="/about" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link to="/careers" className="hover:text-primary transition-colors">Careers</Link></li>
              <li><Link to="/press" className="hover:text-primary transition-colors">Press</Link></li>
              <li><Link to="/social-impact" className="hover:text-primary transition-colors">SaskTask for Good</Link></li>
              <li><Link to="/blog" className="hover:text-primary transition-colors">Blog</Link></li>
            </ul>
          </div>
        </div>

        {/* Social Media & Bottom Links */}
        <div className="border-t border-border pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            {/* Social Media Icons */}
            <div className="flex items-center gap-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="h-10 w-10 rounded-full bg-muted hover:bg-primary/10 flex items-center justify-center transition-colors group">
                <Facebook className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="h-10 w-10 rounded-full bg-muted hover:bg-primary/10 flex items-center justify-center transition-colors group">
                <Twitter className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="h-10 w-10 rounded-full bg-muted hover:bg-primary/10 flex items-center justify-center transition-colors group">
                <Instagram className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="h-10 w-10 rounded-full bg-muted hover:bg-primary/10 flex items-center justify-center transition-colors group">
                <Linkedin className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </a>
            </div>

            {/* Legal Links */}
            <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
              <Link to="/terms" className="hover:text-primary transition-colors">Terms & Privacy</Link>
              <span>•</span>
              <Link to="/ads" className="hover:text-primary transition-colors">About our Ads</Link>
              <span>•</span>
              <Link to="/legal" className="hover:text-primary transition-colors">Legal</Link>
            </div>
          </div>

          {/* Copyright */}
          <div className="text-center mt-8 text-sm text-muted-foreground">
            <p>&copy; 2025 SaskTask. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};
