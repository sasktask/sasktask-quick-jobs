import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="bg-card border-t border-border mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">
              SaskTask
            </h3>
            <p className="text-muted-foreground">
              Connect task givers with task doers for quick, reliable short-term jobs.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">For Task Givers</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li><Link to="/post-task" className="hover:text-primary transition-colors">Post a Task</Link></li>
              <li><Link to="/pricing" className="hover:text-primary transition-colors">Pricing</Link></li>
              <li><Link to="/how-it-works" className="hover:text-primary transition-colors">How It Works</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">For Task Doers</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li><Link to="/browse" className="hover:text-primary transition-colors">Browse Tasks</Link></li>
              <li><Link to="/become-doer" className="hover:text-primary transition-colors">Become a Doer</Link></li>
              <li><Link to="/earnings" className="hover:text-primary transition-colors">Earnings</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li><Link to="/about" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
              <li><Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-border text-center text-muted-foreground">
          <p>&copy; 2025 SaskTask. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
