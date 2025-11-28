import { useNavigate } from 'react-router-dom';
import { Plus, MapPin, Navigation, Calendar, Clock, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useRides, Ride } from '@/contexts/RideContext';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { toast } from 'sonner';

export default function MyRides() {
  const navigate = useNavigate();
  const { rides, updateRide, deleteRide } = useRides();
  const { useMetric } = useAuth();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingRide, setEditingRide] = useState<Ride | null>(null);
  const [editForm, setEditForm] = useState({
    startLocation: '',
    destination: '',
    distance: '',
    duration: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  })

  const convertDistance = (km: number) => {
    return useMetric ? km : km * 0.621371;
  };

    const handleEditRide = (ride: Ride) => {
    setEditingRide(ride);
    setEditForm({
      startLocation: ride.startLocation,
      destination: ride.destination,
      distance: ride.distance.toString(),
      duration: ride.duration.toString(),
      date: new Date(ride.date).toISOString().split('T')[0],
      notes: ride.notes || '',
    });
    setEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editingRide) return;
    
    if (!editForm.startLocation || !editForm.destination || !editForm.distance || !editForm.duration || !editForm.date) {
      toast.error('Please fill in all required fields');
      return;
    }

    updateRide(editingRide.id, {
      startLocation: editForm.startLocation,
      destination: editForm.destination,
      distance: parseFloat(editForm.distance),
      duration: parseFloat(editForm.duration),
      date: new Date(editForm.date).toISOString(),
      notes: editForm.notes,
    });

    toast.success('Ride updated successfully');
    setEditDialogOpen(false);
    setEditingRide(null);
  };

  const handleDeleteRide = (id: string) => {
    if (window.confirm('Are you sure you want to delete this ride?')) {
      deleteRide(id);
      toast.success('Ride deleted');
    }
  };

  const distanceUnit = useMetric ? 'km' : 'mi';

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 glass-card border-b p-3 sm:p-4">
        <div className="container max-w-4xl mx-auto flex items-center justify-between gap-2">
          <h1 className="text-xl sm:text-2xl font-bold">My Rides</h1>
          <Button variant="accent" size="sm" onClick={() => navigate('/create-ride')}>
            <Plus className="h-4 w-4 mr-2" />
            New Ride
          </Button>
        </div>
      </div>

      <div className="container max-w-4xl mx-auto p-3 sm:p-4">
        {rides.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="max-w-md mx-auto space-y-4">
              <div className="p-4 rounded-full bg-accent/10 w-20 h-20 mx-auto flex items-center justify-center">
                <MapPin className="h-10 w-10 text-accent" />
              </div>
              <h2 className="text-xl font-bold">No rides yet</h2>
              <p className="text-muted-foreground">
                Start tracking your motorcycle adventures and build your riding history!
              </p>
              <Button variant="accent" onClick={() => navigate('/create-ride')}>
                Create Your First Ride
              </Button>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {rides.slice().reverse().map((ride) => (
              <Card key={ride.id} className="p-4 sm:p-6 hover:shadow-glow transition-shadow">
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-0">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span className="text-sm">{ride.startLocation}</span>
                      </div>
                      <div className="flex items-center gap-2 text-accent font-medium">
                        <Navigation className="h-4 w-4" />
                        <span>{ride.destination}</span>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
                      <div className="text-left sm:text-right">
                        <div className="text-2xl font-bold bg-clip-text">
                          {convertDistance(ride.distance).toFixed(1)} {distanceUnit}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {ride.duration} h
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteRide(ride.id)}
                          className="h-8 w-8 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground pt-3 sm:pt-4 border-t">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(ride.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {new Date(ride.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>

                  {ride.notes && (
                    <div className="text-sm text-muted-foreground pt-2">
                      {ride.notes}
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
      {/* Edit Ride Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Ride</DialogTitle>
            <DialogDescription>
              Update your ride details
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-start">Start Location</Label>
              <Input
                id="edit-start"
                value={editForm.startLocation}
                onChange={(e) => setEditForm({ ...editForm, startLocation: e.target.value })}
                placeholder="Enter start location"
                className="border-2"
              />
            </div>
            <div>
              <Label htmlFor="edit-destination">Destination</Label>
              <Input
                id="edit-destination"
                value={editForm.destination}
                onChange={(e) => setEditForm({ ...editForm, destination: e.target.value })}
                placeholder="Enter destination"
                className="border-2"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-distance">Distance ({distanceUnit})</Label>
                <Input
                  id="edit-distance"
                  type="number"
                  value={editForm.distance}
                  onChange={(e) => setEditForm({ ...editForm, distance: e.target.value })}
                  placeholder={useMetric ? "50" : "31"}
                  className="border-2"
                />
              </div>
              <div>
                <Label htmlFor="edit-duration">Duration (hours)</Label>
                <Input
                  id="edit-duration"
                  type="number"
                  value={editForm.duration}
                  onChange={(e) => setEditForm({ ...editForm, duration: e.target.value })}
                  placeholder="90"
                  className="border-2"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-notes">Notes (Optional)</Label>
              <Textarea
                id="edit-notes"
                value={editForm.notes}
                onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                placeholder="Add any notes about your ride..."
                className="min-h-[80px] resize-none border-2"
              />
            </div>
            <div>
              <Label htmlFor="edit-date">Date</Label>
              <Input
                id="edit-date"
                type="date"
                value={editForm.date}
                onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                className="border-2"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
