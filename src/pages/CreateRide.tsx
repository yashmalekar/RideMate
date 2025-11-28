import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useRides } from '@/contexts/RideContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function CreateRide() {
  const navigate = useNavigate();
  const { addRide } = useRides();
  
  const [formData, setFormData] = useState({
    startLocation: '',
    destination: '',
    distance: '',
    duration: '',
    notes: '',
    date: new Date().toISOString().split('T')[0],
  });

  const { useMetric } = useAuth();
  const distanceUnit = useMetric ? 'km' : 'mi';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.startLocation || !formData.destination || !formData.distance) {
      toast.error('Please fill in all required fields');
      return;
    }

    addRide({
      startLocation: formData.startLocation,
      destination: formData.destination,
      distance: parseFloat(formData.distance),
      duration: parseFloat(formData.duration) || 0,
      date: new Date(formData.date).toISOString(),
      notes: formData.notes,
    });

    toast.success('Ride saved successfully!');
    navigate('/my-rides');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 glass-card border-b p-3 sm:p-4">
        <div className="container max-w-2xl mx-auto flex items-center gap-2 sm:gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl sm:text-2xl font-bold">New Ride</h1>
        </div>
      </div>

      <div className="container max-w-2xl mx-auto p-3 sm:p-4">
        <Card className="p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div className="space-y-2">
              <Label htmlFor="start">Start Location *</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  id="start"
                  placeholder="Where are you starting from?"
                  value={formData.startLocation}
                  onChange={(e) => setFormData({ ...formData, startLocation: e.target.value })}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="destination">Destination *</Label>
              <div className="relative">
                <Navigation className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  id="destination"
                  placeholder="Where are you heading?"
                  value={formData.destination}
                  onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="distance">Distance ({distanceUnit}) *</Label>
                <Input
                  id="distance"
                  type="number"
                  step="0.1"
                  placeholder={useMetric ? "50": '31'}
                  value={formData.distance}
                  onChange={(e) => setFormData({ ...formData, distance: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Duration (hours)</Label>
                <Input
                  id="duration"
                  type="number"
                  step="0.1"
                  placeholder="1.5"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any notes about this ride..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={4}
              />
            </div>

            <div className="flex gap-3">
              <Button type="button" variant="outline" className="flex-1" onClick={() => navigate(-1)}>
                Cancel
              </Button>
              <Button type="submit" variant="accent" className="flex-1">
                Save Ride
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
