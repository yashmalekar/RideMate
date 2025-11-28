import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, TrendingUp, Trophy, Users, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import StatCard from '@/components/StatCard';
import { useAuth } from '@/contexts/AuthContext';
import { useRides } from '@/contexts/RideContext';
import { toast } from 'sonner';
import heroImage from '@/assets/hero-ride.jpg';

const kmToMiles = (km: number) => km * 0.621371;

export default function Dashboard() {
  const { user, useMetric } = useAuth();
  const { rides, totalDistance, weeklyDistance } = useRides();
  const navigate = useNavigate();
  const [sosActive, setSosActive] = useState(false);

  const convertDistance = (km: number) => {
    return useMetric ? km : kmToMiles(km);
  };

  const distanceUnit = useMetric ? 'km' : 'mi';

  const handleSOS = () => {
    setSosActive(true);
    toast.error('SOS Alert Sent! Emergency contacts notified.', {
      duration: 5000,
    });
    
    setTimeout(() => setSosActive(false), 3000);
  };

  const achievements = [
    { name: 'First Ride', unlocked: rides.length >= 1 },
    { name: '100km Club', unlocked: totalDistance >= 100 },
    { name: '500km Hero', unlocked: totalDistance >= 500 },
    { name: 'Weekend Warrior', unlocked: weeklyDistance >= 50 },
  ];

  const unlockedAchievements = achievements.filter(a => a.unlocked).length;

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative h-64 overflow-hidden">
        <img 
          src={heroImage} 
          alt="Motorcycle ride" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-background" />
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h1 className="text-3xl font-bold text-white drop-shadow-lg mb-2">
            Welcome back, {user?.name.split(' ')[0]}!
          </h1>
          <p className="text-white drop-shadow-md">Ready for your next adventure?</p>
        </div>
      </div>

      <div className="container max-w-6xl mx-auto p-3 sm:p-4 space-y-4 sm:space-y-6">
        {/* Emergency SOS Button */}
        {/* <Card className="p-4 sm:p-6 md:hidden gradient-accent shadow-glow border-none relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12" />
          <div className="relative flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <h2 className="text-2xl font-bold text-white mb-2">Emergency SOS</h2>
              <p className="text-white/90">Instantly alert your emergency contacts</p>
            </div>
            <Button
              variant="emergency"
              size="lg"
              onClick={handleSOS}
              disabled={sosActive}
              className={`h-20 w-20 rounded-full shadow-xl ${sosActive ? 'animate-pulse' : 'hover:scale-110'} transition-all`}
            >
              <AlertCircle className="h-10 w-10" />
            </Button>
          </div>
        </Card> */}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
          <StatCard
            title="Total Rides"
            value={rides.length}
            icon={TrendingUp}
          />
          <StatCard
            title="Total Distance"
            value={`${convertDistance(totalDistance).toFixed(0)} ${distanceUnit}`}
            icon={TrendingUp}
            gradient
          />
          <StatCard
            title="This Week"
            value={`${convertDistance(weeklyDistance).toFixed(0)} ${distanceUnit}`}
            icon={TrendingUp}
          />
          <StatCard
            title="Achievements"
            value={`${unlockedAchievements}/${achievements.length}`}
            icon={Trophy}
          />
        </div>

        {/* Quick Actions */}
        <Card className="p-4 sm:p-6 cursor-pointer hover:shadow-glow transition-shadow" onClick={() => navigate('/create-ride')}>
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-3 rounded-xl bg-accent text-accent-foreground">
              <Plus className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold">New Ride</h3>
              <p className="text-sm text-muted-foreground">Start tracking a new journey</p>
            </div>
          </div>
        </Card>

        {/* Recent Rides */}
        <Card className="p-4 sm:p-6">
          <h2 className="text-xl font-bold mb-4">Recent Rides</h2>
          {rides.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No rides yet. Start your first adventure!</p>
              <Button 
                variant="accent" 
                className="mt-4"
                onClick={() => navigate('/create-ride')}
              >
                Create Your First Ride
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {rides.slice(-3).reverse().map((ride) => (
                <div
                  key={ride.id}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/5 transition-colors"
                >
                  <div>
                    <p className="font-medium">{ride.startLocation} → {ride.destination}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(ride.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-accent">{convertDistance(ride.distance).toFixed(1)} {distanceUnit}</p>
                    <p className="text-sm text-muted-foreground">{ride.duration} min</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Achievements */}
        <Card className="p-4 sm:p-6">
          <h2 className="text-xl font-bold mb-4">Achievements</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {achievements.map((achievement) => (
              <div
                key={achievement.name}
                className={`p-4 rounded-lg border text-center transition-all ${
                  achievement.unlocked
                    ? 'gradient-primary text-white shadow-glow'
                    : 'bg-muted/30 opacity-50'
                }`}
              >
                <Trophy className={`h-8 w-8 mx-auto mb-2 ${achievement.unlocked ? 'text-yellow-300' : ''}`} />
                <p className="text-sm font-medium">{achievement.name}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
