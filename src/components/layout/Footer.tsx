import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, Youtube } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <span className="font-heading text-xl font-bold">
                  Safe<span className="text-primary">Plots</span>
                </span>
              </div>
            </Link>
            <p className="text-sm text-secondary-foreground/70">
              A transparent platform to discover verified plots and homes across India.
            </p>
            <div className="flex gap-3">
              <a href="https://www.facebook.com/profile.php?id=61586764237045"
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="p-2 rounded-lg bg-secondary-foreground/10 hover:bg-primary hover:text-primary-foreground transition-colors">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="https://youtube.com/@safeplots?si=36AN17qrVY1zI0XQ"
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="p-2 rounded-lg bg-secondary-foreground/10 hover:bg-primary hover:text-primary-foreground transition-colors">
                <Youtube className="h-4 w-4" />
              </a>
              <a href="https://www.instagram.com/safeplots.in/?utm_source=ig_web_button_share_sheet"
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="p-2 rounded-lg bg-secondary-foreground/10 hover:bg-primary hover:text-primary-foreground transition-colors">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="https://www.linkedin.com/company/safeplots" 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="p-2 rounded-lg bg-secondary-foreground/10 hover:bg-primary hover:text-primary-foreground transition-colors">
                <Linkedin className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-heading font-semibold text-lg">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/properties" className="text-secondary-foreground/70 hover:text-primary transition-colors">
                  Browse Properties
                </Link>
              </li>
              <li>
                <Link to="/seller/register" className="text-secondary-foreground/70 hover:text-primary transition-colors">
                  Post Property
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-secondary-foreground/70 hover:text-primary transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-secondary-foreground/70 hover:text-primary transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Property Types */}
          <div className="space-y-4">
            <h3 className="font-heading font-semibold text-lg">Property Types</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/properties?type=plot" className="text-secondary-foreground/70 hover:text-primary transition-colors">
                  Plots
                </Link>
              </li>
              <li>
                <Link to="/properties?type=house" className="text-secondary-foreground/70 hover:text-primary transition-colors">
                  Houses
                </Link>
              </li>
              <li>
                <Link to="/properties?type=flat" className="text-secondary-foreground/70 hover:text-primary transition-colors">
                  Flats
                </Link>
              </li>
              <li>
                <Link to="/properties?type=villa" className="text-secondary-foreground/70 hover:text-primary transition-colors">
                  Villas
                </Link>
              </li>
              <li>
                <Link to="/properties?type=farmland" className="text-secondary-foreground/70 hover:text-primary transition-colors">
                  Farmland
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="font-heading font-semibold text-lg">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="text-secondary-foreground/70">
                  CM Technology, Mukkani,<br />Thoothukudi - 628151
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-primary shrink-0" />
                <a href="tel:+91 7530059315" className="text-secondary-foreground/70 hover:text-primary transition-colors">
                  +91 7530059315
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-primary shrink-0" />
                <a href="mailto:contact@safeplots.in" className="text-secondary-foreground/70 hover:text-primary transition-colors">
                  safeplotss@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-secondary-foreground/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-secondary-foreground/60">
              © {new Date().getFullYear()} SafePlots.in. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm">
              <Link to="/privacy" className="text-secondary-foreground/60 hover:text-primary transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-secondary-foreground/60 hover:text-primary transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
          <p className="mt-4 text-xs text-center text-secondary-foreground/40">
            SafePlots.in is a property discovery platform. Buyers are advised to verify legal documents before purchase.
            SafePlots.in does not participate in financial transactions.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
