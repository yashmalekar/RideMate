import { useEffect, useState } from 'react';
import { TrendingUp, IndianRupee, Fuel, Wrench, Plus, MapPin, Users, Clock, Edit, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useRides } from '@/contexts/RideContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import StatCard from '@/components/StatCard';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export default function Statistics() {
  const { rides, expenses, totalDistance, addRide, addExpense, updateRide, deleteRide, updateExpense, deleteExpense } = useRides();
  const { useMetric } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);
  

  const convertDistance = (km: number) => {
    return useMetric ? km : km * 0.621371;
  };

  const distanceUnit = useMetric ? 'km' : 'mi';
  const [showAllExpenses, setShowAllExpenses] = useState(false);
  const [editingRide, setEditingRide] = useState<string | null>(null);
  const [editingExpense, setEditingExpense] = useState<string | null>(null);

  // Ride form state
  const [rideForm, setRideForm] = useState({
    startLocation: '',
    destination: '',
    distance: '',
    duration: '',
    notes: '',
    date: new Date().toISOString().split('T')[0],
  });

  const [showRideDialog, setShowRideDialog] = useState(false);
  const [showExpenseDialog, setShowExpenseDialog] = useState(false);

  // Expense form state
  const [expenseForm, setExpenseForm] = useState({
    type: 'fuel' as 'fuel' | 'food' | 'maintenance' | 'upgrades' | 'other',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    userId: '',
  });

  const [expenseFilter, setExpenseFilter] = useState<string>('all');
  const [monthlyExpenseTypeFilter, setMonthlyExpenseTypeFilter] = useState<string>('all');

  const handleEditRide = (ride: any) => {
    setEditingRide(ride.id);
    setRideForm({
      startLocation: ride.startLocation,
      destination: ride.destination,
      distance: ride.distance.toString(),
      duration: ride.duration.toString(),
      notes: ride.notes || '',
      date: new Date(ride.date).toISOString().split('T')[0],
    });
    setShowRideDialog(true);
  };

  const handleEditExpense = (expense: any) => {
    setEditingExpense(expense.id);
    setExpenseForm({
      type: expense.type,
      amount: expense.amount.toString(),
      description: expense.description,
      date: new Date(expense.date).toISOString().split('T')[0],
      userId: expense.userId,
    });
    setShowExpenseDialog(true);
  };

  const handleDeleteRide = (id: string) => {
    if (window.confirm('Are you sure you want to delete this ride?')) {
      deleteRide(id);
      toast({ title: 'Ride deleted successfully!' });
    }
  };

  const handleDeleteExpense = (id: string) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      deleteExpense(id);
      toast({ title: 'Expense deleted successfully!' });
    }
  };

  const handleAddRide = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rideForm.startLocation || !rideForm.destination || !rideForm.distance || !rideForm.duration) {
      toast({ title: 'Please fill in all required fields', variant: 'destructive' });
      return;
    }

    if (editingRide) {
      updateRide(editingRide, {
        startLocation: rideForm.startLocation,
        destination: rideForm.destination,
        distance: parseFloat(rideForm.distance),
        duration: parseFloat(rideForm.duration),
        date: new Date(rideForm.date).toISOString(),
        notes: rideForm.notes,
      });
      toast({ title: 'Ride updated successfully!' });
      setEditingRide(null);
    } else {
      addRide({
        startLocation: rideForm.startLocation,
        destination: rideForm.destination,
        distance: parseFloat(rideForm.distance),
        duration: parseFloat(rideForm.duration),
        date: new Date(rideForm.date).toISOString(),
        notes: rideForm.notes,
      });
      toast({ title: 'Ride added successfully!' });
    }

    setRideForm({ startLocation: '', destination: '', distance: '', duration: '', notes: '', date: new Date().toISOString().split('T')[0] });
    setShowRideDialog(false);
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseForm.amount || !expenseForm.description) {
      toast({ title: 'Please fill in all required fields', variant: 'destructive' });
      return;
    }

    if (editingExpense) {
      updateExpense(editingExpense, {
        id: editingExpense,
        userId: expenseForm.userId,
        type: expenseForm.type,
        amount: parseFloat(expenseForm.amount),
        description: expenseForm.description,
        date: new Date(expenseForm.date).toISOString(),
      });
      toast({ title: 'Expense updated successfully!' });
      setEditingExpense(null);
    } else {
      addExpense({
        type: expenseForm.type,
        amount: parseFloat(expenseForm.amount),
        description: expenseForm.description,
        date: new Date(expenseForm.date).toISOString(),
      });
      toast({ title: 'Expense added successfully!' });
    }

    setExpenseForm({ type: 'fuel', amount: '', description: '', userId: '', date: new Date().toISOString().split('T')[0] });
    setShowExpenseDialog(false);
  };

  // Calculate ride stats
  const totalRides = rides.length;
  const avgDuration = totalRides > 0 ? rides.reduce((sum, r) => sum + r.duration, 0) / totalRides : 0;

  // Calculate monthly distance data (last 6 months)
  const monthlyDistanceData = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - i));
    const monthName = date.toLocaleDateString('en-US', { month: 'short' });
    
    const monthRides = rides.filter(ride => {
      const rideDate = new Date(ride.date);
      return rideDate.getMonth() === date.getMonth() && rideDate.getFullYear() === date.getFullYear();
    });

    const distance = monthRides.reduce((sum, ride) => sum + ride.distance, 0);
    return { month: monthName, distance: Math.round(convertDistance(distance)) };
  });

  // Calculate rides by day of week
  const ridesByDay = Array.from({ length: 7 }, (_, i) => {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayRides = rides.filter(ride => new Date(ride.date).getDay() === i);
    return { day: dayNames[i], rides: dayRides.length };
  });

  // Calculate expense stats
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  
  // Current month expenses for pie chart
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const currentMonthExpenses = expenses.filter(exp => {
    const expDate = new Date(exp.date);
    return expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear;
  });

  const currentMonthByType = currentMonthExpenses.reduce((acc, exp) => {
    acc[exp.type] = (acc[exp.type] || 0) + exp.amount;
    return acc;
  }, {} as Record<string, number>);

  const pieData = [
    { name: 'Fuel', value: currentMonthByType.fuel || 0, color: 'hsl(var(--chart-1))' },
    { name: 'Food', value: currentMonthByType.food || 0, color: 'hsl(var(--chart-2))' },
    { name: 'Maintenance', value: currentMonthByType.maintenance || 0, color: 'hsl(var(--chart-3))' },
    { name: 'Upgrades', value: currentMonthByType.upgrades || 0, color: 'hsl(var(--chart-4))' },
    { name: 'Other', value: currentMonthByType.other || 0, color: 'hsl(var(--chart-5))' },
  ].filter(item => item.value > 0);

  // Monthly total expenses (last 6 months) with type filter
  const monthlyExpensesData = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - i));
    const monthName = date.toLocaleDateString('en-US', { month: 'short' });
    
    const monthExpenses = expenses.filter(exp => {
      const expDate = new Date(exp.date);
      const monthMatch = expDate.getMonth() === date.getMonth() && expDate.getFullYear() === date.getFullYear();
      const typeMatch = monthlyExpenseTypeFilter === 'all' || exp.type === monthlyExpenseTypeFilter;
      return monthMatch && typeMatch;
    });

    const total = monthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    return { month: monthName, total: Math.round(total) };
  });

  // Daily expenses for line chart (last 30 days)
  const dailyExpensesData = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    const dayLabel = date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
    
    const dayExpenses = expenses.filter(exp => {
      const expDate = new Date(exp.date);
      const dateMatch = expDate.toDateString() === date.toDateString();
      const typeMatch = expenseFilter === 'all' || exp.type === expenseFilter;
      return dateMatch && typeMatch;
    });

    const total = dayExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    return { day: dayLabel, amount: Math.round(total) };
  });

  return (
    <>
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 glass-card border-b p-3 sm:p-4">
        <div className="container max-w-6xl mx-auto">
          <h1 className="text-xl sm:text-2xl font-bold">Statistics & Expenses</h1>
        </div>
      </div>

      <div className="container max-w-6xl mx-auto p-2 sm:p-4 space-y-4 sm:space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
          <StatCard
            title="Total Distance"
            value={`${convertDistance(totalDistance).toFixed(0)} ${distanceUnit}`}
            icon={TrendingUp}
            gradient
            trend={`${totalRides} total rides`}
          />
          <StatCard
            title="Total Expenses"
            value={`₹${totalExpenses.toFixed(0)}`}
            icon={IndianRupee}
          />
          <StatCard
            title="Avg per Ride"
            value={rides.length > 0 ? `${convertDistance(totalDistance / rides.length).toFixed(1)} ${distanceUnit}` : `0 ${distanceUnit}`}
            icon={TrendingUp}
          />
        </div>

        {/* Tabs for Rides and Expenses */}
        <Tabs defaultValue="rides" className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="rides">Ride Statistics</TabsTrigger>
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
          </TabsList>

          {/* Rides Tab */}
          <TabsContent value="rides" className="space-y-4 sm:space-y-6">
            {/* Ride Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Rides</p>
                    <p className="text-2xl font-bold">{totalRides}</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Duration</p>
                    <p className="text-2xl font-bold">{avgDuration.toFixed(1)}h</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <Button 
                  onClick={() => {
                    setEditingRide(null);
                    setRideForm({ startLocation: '', destination: '', distance: '', duration: '', notes: '', date: new Date().toISOString().split('T')[0] });
                    setShowRideDialog(true);
                  }} 
                  className="w-full h-full" 
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Ride
                </Button>
              </Card>
            </div>

            <Card className="p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-bold mb-4">Monthly Distance ({distanceUnit})</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyDistanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="month" 
                      stroke="hsl(var(--foreground))"
                      style={{ fontSize: '12px' }}
                    />
                    <YAxis 
                      stroke="hsl(var(--foreground))"
                      style={{ fontSize: '12px' }}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        color: 'hsl(var(--foreground))',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      }}
                    />
                    <Bar dataKey="distance" fill="hsl(var(--accent))" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-bold mb-4">Rides by Day of Week</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ridesByDay}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="day" 
                      stroke="hsl(var(--foreground))"
                      style={{ fontSize: '12px' }}
                    />
                    <YAxis 
                      stroke="hsl(var(--foreground))"
                      style={{ fontSize: '12px' }}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        color: 'hsl(var(--foreground))',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      }}
                    />
                    <Bar dataKey="rides" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Recent Rides */}
            <Card className="p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-bold mb-4">Recent Rides</h3>
              <ScrollArea className="h-64">
                <div className="space-y-3">
                  {rides.slice().reverse().slice(0, 10).map((ride) => (
                    <div key={ride.id} className="flex items-start justify-between gap-2 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{ride.startLocation} → {ride.destination}</p>
                        <p className="text-sm text-muted-foreground">
                          {convertDistance(ride.distance).toFixed(1)} {distanceUnit} • {new Date(ride.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => handleEditRide(ride)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDeleteRide(ride.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </Card>
          </TabsContent>

          {/* Expenses Tab */}
          <TabsContent value="expenses" className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
              <h2 className="text-lg sm:text-xl font-bold">Expenses Overview</h2>
              <Button onClick={() => {
                setEditingExpense(null);
                setExpenseForm({ type: 'fuel', amount: '', description: '',userId: '', date: new Date().toISOString().split('T')[0] });
                setShowExpenseDialog(true);
              }} size="sm">
              <Plus className='h-4 w-4 mr-2' />
              Add Expense
              </Button>
              </div>

            <Card className="p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-bold mb-4">Current Month Expenses</h3>
              {pieData.length === 0 ? (
                <div className="h-80 flex items-center justify-center text-muted-foreground">
                  <div className="text-center space-y-2">
                    <IndianRupee className="h-12 w-12 mx-auto opacity-50" />
                    <p>No expenses this month</p>
                  </div>
                </div>
              ) : (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'hsl(var(--background))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          color: 'hsl(var(--foreground))',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        }}
                        formatter={(value: any) => [`₹${value}`, 'Amount']}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Card>

            <Card className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                <h3 className="text-lg sm:text-xl font-bold">Monthly Total Expenses</h3>
                <Select value={monthlyExpenseTypeFilter} onValueChange={setMonthlyExpenseTypeFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="fuel">Fuel</SelectItem>
                    <SelectItem value="food">Food</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="upgrades">Upgrades</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyExpensesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="month" 
                      stroke="hsl(var(--foreground))"
                      style={{ fontSize: '12px' }}
                    />
                    <YAxis 
                      stroke="hsl(var(--foreground))"
                      style={{ fontSize: '12px' }}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        color: 'hsl(var(--foreground))',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      }}
                      formatter={(value: any) => [`₹${value}`, 'Total']}
                    />
                    <Bar dataKey="total" fill="hsl(var(--chart-2))" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                <h3 className="text-lg sm:text-xl font-bold">Daily Expenses (Last 30 Days)</h3>
                <Select value={expenseFilter} onValueChange={setExpenseFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="fuel">Fuel</SelectItem>
                    <SelectItem value="food">Food</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="upgrades">Upgrades</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailyExpensesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="day" 
                      stroke="hsl(var(--foreground))"
                      style={{ fontSize: '10px' }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis 
                      stroke="hsl(var(--foreground))"
                      style={{ fontSize: '12px' }}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        color: 'hsl(var(--foreground))',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      }}
                      formatter={(value: any) => [`₹${value}`, 'Amount']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="amount" 
                      stroke="hsl(var(--chart-3))" 
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--chart-3))' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Recent Expenses */}
            <Card className="p-4 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg sm:text-xl font-bold">Recent Expenses</h3>
                <Button variant="outline" size="sm" onClick={() => setShowAllExpenses(true)}>
                  View All
                </Button>
              </div>
              <div className="space-y-3">
                {expenses.slice().reverse().slice(0, 5).map((expense) => (
                  <div key={expense.id} className="flex items-start justify-between gap-2 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary capitalize">
                          {expense.type}
                        </span>
                        <span className="font-bold">₹{expense.amount}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 truncate">{expense.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">{new Date(expense.date).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => handleEditExpense(expense)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDeleteExpense(expense.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>

    {/* Add Ride Dialog */}
    <Dialog open={showRideDialog} onOpenChange={setShowRideDialog}>
      <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[95vh] sm:max-h-[90vh] p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">{editingRide ? 'Edit Ride' : 'Add New Ride'}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[calc(95vh-8rem)] sm:max-h-[70vh] pr-2 sm:pr-4">
          <form onSubmit={handleAddRide} className="space-y-3 sm:space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <Label htmlFor="startLocation" className='text-sm'>Start Location *</Label>
                <Input
                  id="startLocation"
                  value={rideForm.startLocation}
                  onChange={(e) => setRideForm({ ...rideForm, startLocation: e.target.value })}
                  placeholder="Enter start location"
                  className='h-10 border-2'
                />
              </div>
              <div>
                <Label htmlFor="destination" className='text-sm'>Destination *</Label>
                <Input
                  id="destination"
                  value={rideForm.destination}
                  onChange={(e) => setRideForm({ ...rideForm, destination: e.target.value })}
                  placeholder="Enter destination"
                  className='h-10'
                />
              </div>
              <div>
                <Label htmlFor="distance" className='text-sm'>Distance ({distanceUnit}) *</Label>
                <Input
                  id="distance"
                  type="number"
                  step="0.1"
                  value={rideForm.distance}
                  onChange={(e) => setRideForm({ ...rideForm, distance: e.target.value })}
                  placeholder={useMetric ? "50" : "31"}
                  className='h-10'
                />
              </div>
              <div>
                <Label htmlFor="duration" className='text-sm'>Duration (hours) *</Label>
                <Input
                  id="duration"
                  type="number"
                  step="0.1"
                  value={rideForm.duration}
                  onChange={(e) => setRideForm({ ...rideForm, duration: e.target.value })}
                  placeholder="1.5"
                  className='h-10'
                />
              </div>
            </div>
            <div>
              <Label htmlFor="notes" className='text-sm'>Notes</Label>
              <Textarea
                id="notes"
                value={rideForm.notes}
                onChange={(e) => setRideForm({ ...rideForm, notes: e.target.value })}
                placeholder="Add any notes about your ride..."
                className='h-10 resize-none'
              />
            </div>
            <div>
              <Label htmlFor="rideDate" className='text-sm'>Date *</Label>
              <Input
                id="rideDate"
                type="date"
                value={rideForm.date}
                onChange={(e) => setRideForm({ ...rideForm, date: e.target.value })}
                className='h-10'
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2 pt-2 sm:pt-4">
              <Button type="submit" className="w-full sm:w-auto">{editingRide ? 'Update Ride' : 'Save Ride'}</Button>
              <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={() => {
                setShowRideDialog(false);
                setEditingRide(null);
              }}>
                Cancel
              </Button>
            </div>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>

    {/* Add Expense Dialog */}
    <Dialog open={showExpenseDialog} onOpenChange={setShowExpenseDialog}>
      <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[95vh] sm:max-h-[90vh] p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">{editingExpense ? 'Edit Expense' : 'Add New Expense'}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[calc(95vh-8rem)] sm:max-h-[70vh] pr-2 sm:pr-4">
          <form onSubmit={handleAddExpense} className="space-y-3 sm:space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <Label htmlFor="type" className='text-sm'>Type *</Label>
                <Select
                  value={expenseForm.type}
                  onValueChange={(value: any) => setExpenseForm({ ...expenseForm, type: value })}
                >
                  <SelectTrigger className='h-10'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fuel">Fuel</SelectItem>
                    <SelectItem value="food">Food</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="upgrades">Upgrades</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="amount" className='text-sm'>Amount (₹) *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={expenseForm.amount}
                  onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                  placeholder="500"
                  className='h-10'
                />
              </div>
            </div>
            <div>
              <Label htmlFor="description" className='text-sm'>Description *</Label>
              <Textarea
                id="description"
                value={expenseForm.description}
                onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                placeholder="Describe the expense..."
                className='h-10'
              />
            </div>
            <div>
              <Label htmlFor="expenseDate" className='text-sm'>Date *</Label>
              <Input
                id="expenseDate"
                type="date"
                value={expenseForm.date}
                onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                className='h-10'
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2 pt-2 sm:pt-4">
              <Button type="submit" className="w-full sm:w-auto">{editingExpense ? 'Update Expense' : 'Save Expense'}</Button>
              <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={() => {
                setShowExpenseDialog(false);
                setEditingExpense(null);
              }}>
                Cancel
              </Button>
            </div>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>

    {/* View All Expenses Dialog */}
    <Dialog open={showAllExpenses} onOpenChange={setShowAllExpenses}>
      <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[95vh] sm:max-h-[80vh] p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">All Expenses</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[calc(95vh-8rem)] sm:h-[60vh] pr-2 sm:pr-4">
          <div className="space-y-2 sm:space-y-3">
            {expenses.slice().reverse().map((expense) => (
              <div key={expense.id} className="flex items-start justify-between gap-2 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary capitalize">
                      {expense.type}
                    </span>
                    <span className="font-bold text-sm sm:text-base">₹{expense.amount}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 break-words">{expense.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">{new Date(expense.date).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => {
                    handleEditExpense(expense);
                    setShowAllExpenses(false);
                  }}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => handleDeleteExpense(expense.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
    </>
  );
}
