import Link from "next/link";
import { Clock, Mail, MapPin, Phone } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gradient-dark text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-xl font-semibold mb-4 text-primary">Flamingo</h3>
            <p className="text-sm text-white/70 leading-relaxed">
              Experience exceptional dining in Piliyandala. Casual elegance meets delicious cuisine with our BYOB policy.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-semibold mb-4 text-primary">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/menu" className="text-white/70 hover:text-primary transition-colors">
                  Menu
                </Link>
              </li>
              <li>
                <Link href="/reservations" className="text-white/70 hover:text-primary transition-colors">
                  Reservations
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="text-white/70 hover:text-primary transition-colors">
                  Gallery
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-white/70 hover:text-primary transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-xl font-semibold mb-4 text-primary">Contact</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start space-x-2">
                <MapPin size={16} className="text-primary mt-1 flex-shrink-0" />
                <span className="text-white/70">Piliyandala, Sri Lanka</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone size={16} className="text-primary flex-shrink-0" />
                <span className="text-white/70">+94 77 123 4567</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail size={16} className="text-primary flex-shrink-0" />
                <span className="text-white/70">info@flamingo.lk</span>
              </li>
            </ul>
          </div>

          {/* Hours */}
          <div>
            <h3 className="text-xl font-semibold mb-4 text-primary">Opening Hours</h3>
            <ul className="space-y-2 text-sm text-white/70">
              <li className="flex items-start space-x-2">
                <Clock size={16} className="text-primary mt-1 flex-shrink-0" />
                <div>
                  <p className="font-medium text-white">Mon - Fri</p>
                  <p>11:00 AM - 10:00 PM</p>
                </div>
              </li>
              <li className="flex items-start space-x-2">
                <Clock size={16} className="text-primary mt-1 flex-shrink-0" />
                <div>
                  <p className="font-medium text-white">Sat - Sun</p>
                  <p>10:00 AM - 11:00 PM</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-8 text-center">
          <p className="text-sm text-white/60">© {new Date().getFullYear()} Flamingo Restaurant.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
