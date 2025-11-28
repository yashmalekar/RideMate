import { useState, useEffect } from 'react';
import { Moon, Sun, User, LogOut, Plus, Trash2, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';

export default function Settings() {
  const { user, logout, accentColor, setAccentColor, useMetric, setUseMetric } = useAuth();
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);

  const accentColors = [
    { name: 'Orange', value: '#ff6b35' },
    { name: 'Blue', value: '#556ee6' },
    { name: 'Teal', value: '#4ecdc4' },
    { name: 'Purple', value: '#6c5ce7' },
    { name: 'Pink', value: '#ef476f' },
    { name: 'Amber', value: '#f7931e' },
  ];

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setDarkMode(isDark);
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 glass-card border-b p-3 sm:p-4">
        <div className="container max-w-2xl mx-auto">
          <h1 className="text-xl sm:text-2xl font-bold">Settings</h1>
        </div>
      </div>

      <div className="container max-w-2xl mx-auto p-3 sm:p-4 space-y-4 sm:space-y-6">
        {/* Profile Card */}
        <Card className="p-4 sm:p-6">
          <h2 className="text-lg font-semibold mb-4">Profile</h2>
          <div className="flex items-center gap-4 mb-4">
            {user?.avatar ? (
              <img 
                src={user.avatar} 
                alt={user.name}
                className="h-16 w-16 rounded-full"
              />
            ) : (
              <div className="h-16 w-16 rounded-full bg-accent/10 flex items-center justify-center">
                <User className="h-8 w-8 text-accent" />
              </div>
            )}
            <div>
              <p className="font-semibold">{user?.name}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <Link to="/edit-profile">
            <Button variant="outline" className="w-full">
              <User className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          </Link>
        </Card>

        {/* Appearance */}
        <Card className="p-4 sm:p-6">
          <h2 className="text-lg font-semibold mb-4">Appearance</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {darkMode ? (
                  <Moon className="h-5 w-5 text-accent" />
                ) : (
                  <Sun className="h-5 w-5 text-accent" />
                )}
                <div>
                  <Label htmlFor="dark-mode" className="font-medium">
                    Dark Mode
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Toggle dark theme
                  </p>
                </div>
              </div>
              <Switch
                id="dark-mode"
                checked={darkMode}
                onCheckedChange={toggleDarkMode}
              />
            </div>

            <div className="pt-4 border-t">
              <Label className="font-medium mb-2 block">Accent Color</Label>
              <div className="grid grid-cols-6 gap-3">
                {accentColors.map((color) => (
                  <button
                    key={color.value}
                    className={`w-10 h-10 rounded-full border-2 hover:scale-110 transition-transform ${
                      accentColor === color.value ? 'border-foreground ring-2 ring-offset-2 ring-foreground' : 'border-border'
                    }`}
                    style={{ backgroundColor: color.value }}
                    onClick={() => {
                      setAccentColor(color.value);
                      toast.success(`Accent color changed to ${color.name}`);
                    }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Units */}
        <Card className="p-4 sm:p-6">
          <h2 className="text-lg font-semibold mb-4">Units</h2>
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Distance Unit</Label>
              <p className="text-sm text-muted-foreground">
                Kilometers or Miles
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant={useMetric ? "default" : "outline"} 
                size="sm"
                onClick={() => {
                  setUseMetric(true);
                  toast.success('Using Kilometers');
                }}
              >
                KM
              </Button>
              <Button 
                variant={!useMetric ? "default" : "outline"} 
                size="sm"
                onClick={() => {
                  setUseMetric(false);
                  toast.success('Using Miles');
                }}
              >
                MI
              </Button>
            </div>
          </div>
        </Card>

        {/* Account Actions */}
        <Card className="p-4 sm:p-6">
          <h2 className="text-lg font-semibold mb-4">Account</h2>
          <Button 
            variant="destructive" 
            className="w-full"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Log Out
          </Button>
        </Card>
      </div>
    </div>
  );
}
