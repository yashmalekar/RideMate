import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { v4 as uuid4 } from 'uuid';
import { useAuth } from '@/contexts/AuthContext';

export interface Ride {
  id: string;
  startLocation: string;
  destination: string;
  distance: number;
  date: string;
  duration: number;
  notes?: string;
  userId?: string;
}

export interface Expense {
  id: string;
  type: 'fuel' | 'food' | 'maintenance' | 'upgrades' | 'other';
  amount: number;
  date: string;
  description: string;
  userId?: string;
}

interface RideContextType {
  rides: Ride[];
  userRides: Ride[];
  expenses: Expense[];
  addRide: (ride: Omit<Ride, 'id'>) => void;
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  updateRide: (id: string, ride: Partial<Omit<Ride, 'id'>>) => void;
  deleteRide: (id: string) => void;
  updateExpense: (id: string, expense: Expense) => void;
  deleteExpense: (id: string) => void;
  totalDistance: number;
  weeklyDistance: number;
}

const RideContext = createContext<RideContextType | undefined>(undefined);

export function RideProvider({ children }: { children: ReactNode }) {
  const [rides, setRides] = useState<Ride[]>([]);
  const [userRides, setUserRides] = useState<Ride[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const { user } = useAuth(); 
  const expense_url = import.meta.env.VITE_EXPENSE_API;
  const ride_url = import.meta.env.VITE_RIDE_API;

  useEffect(() => {
    if(user?.id)
      getRides();
      getRides1();
    // const storedRides = localStorage.getItem('ridemate_rides');
    // const storedExpenses = localStorage.getItem('ridemate_expenses');
    
    // if (storedRides) setRides(JSON.parse(storedRides));
    // if (storedExpenses) setExpenses(JSON.parse(storedExpenses));
  }, [user]);

  useEffect(() => {
    if(user?.id)
      getExpenses();
  }, [user])
  

  const getExpenses = async ()=>{
      const data = await fetch(`${expense_url}/getExpense`).then(res => res.json());
      const expenses = data.filter((expense: Expense) => expense.userId === user?.id);
      setExpenses(expenses);
  }

  const getRides1 = async ()=>{
    const data = await fetch(`${ride_url}/getRide`).then(res => res.json());
    setUserRides(data);
  }

  const getRides = async ()=>{
    const data = await fetch(`${ride_url}/getRide`).then(res => res.json());
    const rides = data.filter((ride: Ride) => ride.userId === user?.id);
    setRides(rides);
  }

  const addRide = async (ride: Omit<Ride, 'id'>) => {
    const newRide = { ...ride, id: uuid4(), userId: user.id };
    const updatedRides = [...rides, newRide];
    setRides(updatedRides);
    await fetch(`${ride_url}/addRide`,{
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newRide),
    });
    // localStorage.setItem('ridemate_rides', JSON.stringify(updatedRides));
  };

  const addExpense = async (expense: Omit<Expense, 'id'>) => {
    const newExpense = { ...expense, id: uuid4() , userId: user.id };
    const updatedExpenses = [...expenses, newExpense];
    setExpenses(updatedExpenses);
    // localStorage.setItem('ridemate_expenses', JSON.stringify(updatedExpenses));
    await fetch(`${expense_url}/addExpense`,{
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newExpense),
    });
  };

  const updateRide = async (id: string, ride: Omit<Ride, 'id'>) => {
    const updatedRides = rides.map(r => r.id === id ? { ...r, ...ride } : r);
    setRides(updatedRides);
    await fetch(`${ride_url}/updateRide`,{
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({id, ...ride}),
    });
    // localStorage.setItem('ridemate_rides', JSON.stringify(updatedRides));
  };

  const deleteRide = async (id: string) => {
    const updatedRides = rides.filter(r => r.id !== id);
    setRides(updatedRides);
    await fetch(`${ride_url}/deleteRide`,{
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({id}),
    });
    // localStorage.setItem('ridemate_rides', JSON.stringify(updatedRides));
  };

  const updateExpense = async (id: string, expense: Expense) => {
    const updatedExpenses = expenses.map(e => e.id === id ? { ...e, ...expense } : e);
    setExpenses(updatedExpenses);
    await fetch(`${expense_url}/updateExpense`,{
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(expense),
    });
    // localStorage.setItem('ridemate_expenses', JSON.stringify(updatedExpenses));
  };

  const deleteExpense = async (id: string) => {
    const updatedExpenses = expenses.filter(e => e.id !== id);
    setExpenses(updatedExpenses);
      await fetch(`${expense_url}/deleteExpense`,{
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({id}),
    });
    // localStorage.setItem('ridemate_expenses', JSON.stringify(updatedExpenses));
  };

  const totalDistance = rides.reduce((sum, ride) => sum + ride.distance, 0);
  
  const weeklyDistance = rides
    .filter(ride => {
      const rideDate = new Date(ride.date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return rideDate >= weekAgo;
    })
    .reduce((sum, ride) => sum + ride.distance, 0);

  return (
    <RideContext.Provider value={{ rides, userRides, expenses, addRide, addExpense, updateRide, deleteRide, updateExpense, deleteExpense, totalDistance, weeklyDistance }}>
      {children}
    </RideContext.Provider>
  );
}

export function useRides() {
  const context = useContext(RideContext);
  if (context === undefined) {
    throw new Error('useRides must be used within a RideProvider');
  }
  return context;
}
