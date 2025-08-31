import { useState, useEffect } from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { useAuth } from '../contexts/AuthContext';
import axios from '../api/axios';
import { toast } from '../hooks/use-toast';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const ScheduleConsultation = () => {
  const { user } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [date, setDate] = useState<Date | null>(null);
  const [timeFrom, setTimeFrom] = useState('');
  const [timeTo, setTimeTo] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) {
      toast({ title: 'Select Date', description: 'Please select a date', variant: 'destructive' });
      return;
    }
    if (!timeFrom || !timeTo) {
      toast({ title: 'Select Time Slot', description: 'Please enter both From and To times', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    try {
      await axios.post('/api/consultation', {
        name,
        email,
        phone,
        date: date.toISOString(),
        timeFrom,
        timeTo,
      });
      toast({ title: 'Request Sent', description: 'Our team will contact you at the scheduled time.' });
      setPhone('');
      setDate(null);
      setTimeFrom('');
      setTimeTo('');
    } catch (error: any) {
      toast({ title: 'Error', description: error.response?.data?.message || 'Something went wrong', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 px-4 py-12">
      <Card className="max-w-md w-full p-8 bg-white shadow-lg rounded-xl">
        <h2 className="text-2xl font-bold text-amber-900 mb-6 text-center">Schedule a Consultation</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" placeholder="Full Name" required value={name} onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          />
          <input type="email" placeholder="Email" required value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          />
          <input type="tel" placeholder="Phone Number" required value={phone} onChange={(e) => setPhone(e.target.value)}
            className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          />

          {/* Date Picker */}
          <div className="w-full">
            <label className="block text-sm font-medium text-stone-700 mb-1">Select Date</label>
            <DatePicker selected={date} onChange={(d) => setDate(d)} minDate={new Date()} placeholderText="Pick a date"
              className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              dateFormat="dd/MM/yyyy"
            />
          </div>

          {/* Time Inputs */}
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-sm font-medium text-stone-700 mb-1">From</label>
              <input type="time" value={timeFrom} onChange={(e) => setTimeFrom(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-stone-700 mb-1">To</label>
              <input type="time" value={timeTo} onChange={(e) => setTimeTo(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
          </div>

          <Button type="submit" disabled={isLoading} className="w-full bg-amber-600 hover:bg-amber-700 text-white py-2 px-4 rounded-md transition-colors">
            {isLoading ? 'Submitting...' : 'Schedule Consultation'}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default ScheduleConsultation;
