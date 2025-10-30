import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-card border-t py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="font-bold text-xl mb-4 bg-gradient-hero bg-clip-text text-transparent">
              HUSON
            </h3>
            <p className="text-muted-foreground">
              Turning surplus into social impact through intelligent resource optimization
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Platform</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li><Link to="/auth" className="hover:text-primary transition-smooth">Donate</Link></li>
              <li><Link to="/auth" className="hover:text-primary transition-smooth">Request</Link></li>
              <li><Link to="/auth" className="hover:text-primary transition-smooth">Volunteer</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">About</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li><a href="#mission" className="hover:text-primary transition-smooth">Our Mission</a></li>
              <li><a href="#impact" className="hover:text-primary transition-smooth">Impact Report</a></li>
              <li><a href="#sustainability" className="hover:text-primary transition-smooth">Sustainability</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li><a href="#help" className="hover:text-primary transition-smooth">Help Center</a></li>
              <li><a href="#contact" className="hover:text-primary transition-smooth">Contact Us</a></li>
              <li><a href="#privacy" className="hover:text-primary transition-smooth">Privacy Policy</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t pt-8 text-center text-muted-foreground">
          <p>&copy; 2025 HUSON. Building a more equitable future through technology.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;