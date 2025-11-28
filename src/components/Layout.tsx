import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, Plus, MapPin, BarChart3, User, Users } from 'lucide-react';
import logo from '@/assets/ridemate-logo.png';

export default function Layout() {
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', icon: Home, label: 'Home' },
    { path: '/my-rides', icon: MapPin, label: 'My Rides' },
    { path: '/statistics', icon: BarChart3, label: 'Stats' },
    { path: '/social', icon: Users, label: 'Social' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 glass-card border-r">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4 mb-8 gap-3">
              <img src={logo} alt="RideMate" className="h-10 w-10 rounded-full bg-accent/10" />
              <div>
                <h1 className="text-2xl font-bold gradient-text">RideMate</h1>
                <p className="text-xs text-muted-foreground">Motorcycle Companion</p>
              </div>
            </div>
            <nav className="mt-5 flex-1 px-2 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all ${
                      isActive 
                        ? 'bg-accent/10 text-accent border border-accent/20' 
                        : 'text-muted-foreground hover:bg-accent/5 hover:text-accent'
                    }`}
                  >
                    <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <div className="md:pl-64 flex flex-col flex-1 pb-20 md:pb-0">
          <Outlet />
        </div>
      </div>
      
      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass-card border-t">
        <div className="flex justify-around items-center h-16 max-w-lg mx-auto px-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-1 transition-colors ${
                  isActive ? 'text-accent' : 'text-muted-foreground'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
