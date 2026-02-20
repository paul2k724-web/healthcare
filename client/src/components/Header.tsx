import { Link, useLocation } from 'wouter';
import { RoleSwitcher } from './RoleSwitcher';
import { useAuth } from '@/hooks/use-auth';
import { motion } from 'framer-motion';
import { HeartPulse, LayoutDashboard, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Header() {
  const [location] = useLocation();
  const { isCustomer } = useAuth();

  const navItems = [
    { label: 'Home', href: '/', show: isCustomer },
    { label: 'Services', href: '/services', show: isCustomer },
    { label: 'Dashboard', href: '/dashboard', show: true },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/60 bg-white/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/">
          <div className="flex items-center gap-2 cursor-pointer group">
            <div className="bg-primary/10 p-2 rounded-lg group-hover:bg-primary/20 transition-colors">
              <HeartPulse className="w-6 h-6 text-primary" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight text-slate-900">
              Care<span className="text-primary">Connect</span>
            </span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navItems.filter(item => item.show).map((item) => (
            <Link key={item.href} href={item.href}>
              <div 
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer",
                  location === item.href 
                    ? "bg-primary text-white shadow-md shadow-primary/25" 
                    : "text-slate-600 hover:text-primary hover:bg-slate-50"
                )}
              >
                {item.label}
              </div>
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <RoleSwitcher />
          {isCustomer && (
             <Link href="/services">
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="hidden md:block bg-slate-900 text-white px-5 py-2 rounded-full text-sm font-semibold shadow-lg shadow-slate-900/20 hover:shadow-xl transition-all"
              >
                Book Now
              </motion.button>
             </Link>
          )}
        </div>
      </div>
    </header>
  );
}
