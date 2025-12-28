import { useState, useEffect } from "react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { useAuth } from "../contexts/AuthContext";
import axios from "../api/axios";
import { toast } from "../hooks/use-toast";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const ScheduleConsultation = () => {
  const { user } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState<Date | null>(null);
  const [time, setTime] = useState("");
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
      toast({
        title: "Select Date",
        description: "Please select a preferred date",
        variant: "destructive",
      });
      return;
    }

    if (!time) {
      toast({
        title: "Select Time",
        description: "Please select a preferred time",
        variant: "destructive",
      });
      return;
    }


    setIsLoading(true);
    try {
      await axios.post("/api/consultation", {
        name,
        email,
        phone,
        date: date.toISOString(),
        time,
      });

      toast({
        title: "Request Sent",
        description: "Our team will contact you at the scheduled time.",
      });

      setPhone("");
      setDate(null);
      setTime("");  
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-lg p-8 bg-white shadow-xl rounded-xl">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-amber-900">
            Schedule a Consultation
          </h2>
          <p className="text-stone-600 mt-1">
            Book a free consultation with our furniture experts
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Preferred Date
            </label>
            <DatePicker
              selected={date}
              onChange={(d :Date | null) => setDate(d)}
              minDate={new Date()}
              placeholderText="Select a date"
              dateFormat="dd/MM/yyyy"
              wrapperClassName="w-full"
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>

          {/* Time Slot */}
          <label className="block text-sm font-medium text-stone-700 mb-1">
            Preferred Time
          </label>

          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          />

          <p className="text-xs text-stone-500 mt-1">
            Please choose a time between <b>10:00 AM – 6:00 PM</b>
          </p>


          {/* Submit */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white py-2 rounded-md"
          >
            {isLoading ? "Submitting..." : "Schedule Consultation"}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default ScheduleConsultation;
