import { Clock, Mail, MapPin, Phone } from "lucide-react";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="bg-gradient-dark text-white relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 bg-pink-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-orange-500/20 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 max-w-6xl mx-auto">
          {/* About */}
          <div className="space-y-3">
            <h3 className="text-xl font-bold mb-3 text-primary font-heading tracking-tight">
              Flamingo
            </h3>
            <p className="text-sm text-white/80 leading-relaxed">
              Experience exceptional dining in Piliyandala. Casual elegance meets delicious cuisine
              with our BYOB policy.
            </p>
            <div className="h-px w-12 bg-gradient-to-r from-primary via-primary/50 to-transparent" />
          </div>

          {/* Contact Info */}
          <div className="space-y-3">
            <h3 className="text-xl font-bold mb-3 text-primary font-heading tracking-tight">
              Contact
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-2.5 group">
                <div className="p-1.5 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <MapPin size={16} className="text-primary flex-shrink-0" />
                </div>
                <span className="text-sm text-white/80 pt-0.5">Piliyandala, Sri Lanka</span>
              </li>
              <li className="flex items-start space-x-2.5 group">
                <div className="p-1.5 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Phone size={16} className="text-primary flex-shrink-0" />
                </div>
                <span className="text-sm text-white/80 pt-0.5">+94 77 123 4567</span>
              </li>
              <li className="flex items-start space-x-2.5 group">
                <div className="p-1.5 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Mail size={16} className="text-primary flex-shrink-0" />
                </div>
                <span className="text-sm text-white/80 pt-0.5">info@flamingo.lk</span>
              </li>
            </ul>
          </div>

          {/* Hours */}
          <div className="space-y-3">
            <h3 className="text-xl font-bold mb-3 text-primary font-heading tracking-tight">
              Opening Hours
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-2.5 group">
                <div className="p-1.5 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Clock size={16} className="text-primary flex-shrink-0" />
                </div>
                <div className="text-sm pt-0.5">
                  <p className="font-semibold text-white">Mon - Fri</p>
                  <p className="text-white/80">11:00 AM - 10:00 PM</p>
                </div>
              </li>
              <li className="flex items-start space-x-2.5 group">
                <div className="p-1.5 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Clock size={16} className="text-primary flex-shrink-0" />
                </div>
                <div className="text-sm pt-0.5">
                  <p className="font-semibold text-white">Sat - Sun</p>
                  <p className="text-white/80">10:00 AM - 11:00 PM</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom section */}
        <div className="mt-8 pt-6 border-t border-white/10">
          <div className="text-center">
            <p className="text-sm text-white/70">
              © {new Date().getFullYear()} Flamingo Restaurant. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
