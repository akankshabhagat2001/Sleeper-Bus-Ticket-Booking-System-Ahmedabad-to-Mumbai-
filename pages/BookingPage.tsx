
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { 
  CheckCircle, Utensils, IndianRupee, User, BrainCircuit, 
  MapPin, AlertCircle, ShoppingCart, ArrowLeft, ArrowRight, 
  Bed, Clock, Timer, Check, ChevronLeft, ChevronRight, RefreshCw, X,
  Coffee, Salad, Soup, LayoutDashboard, Printer, Download, QrCode
} from 'lucide-react';
import { busService } from '../services/busService';
import { predictConfirmationProbability } from '../services/mlService';
import { Seat, BerthType, SeatStatus, Meal, Station, SeatMealSelection } from '../types';

const BookingPage: React.FC = () => {
  const { from, to } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const bookingDate = searchParams.get('date') || new Date().toISOString().split('T')[0];

  const [seats, setSeats] = useState<Seat[]>([]);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [seatMeals, setSeatMeals] = useState<Record<string, Meal>>({});
  const [passengerName, setPassengerName] = useState('');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [bookedInfo, setBookedInfo] = useState<any>(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      busService.getSeats(), 
      busService.getMeals(),
      busService.getStations()
    ]).then(([s, m, st]) => {
      setSeats(s);
      setMeals(m);
      setStations(st);
      setLoading(false);
    });
  }, []);

  const fromStation = stations.find(s => s.id === from);
  const toStation = stations.find(s => s.id === to);

  const journeyTimings = useMemo(() => {
    if (!fromStation || !toStation) return null;
    const departureBase = new Date(`${bookingDate}T21:00:00`);
    const departureTime = new Date(departureBase.getTime() + fromStation.timeOffset * 60000);
    const arrivalTime = new Date(departureBase.getTime() + toStation.timeOffset * 60000);
    const durationMins = toStation.timeOffset - fromStation.timeOffset;
    return {
      departure: departureTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      arrival: arrivalTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      duration: `${Math.