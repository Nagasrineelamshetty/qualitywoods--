import { useEffect, useState } from "react";
import axios from "../api/axios";
import { Card } from "../components/ui/card";
import { toast } from "../hooks/use-toast";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../components/ui/select";

type Consultation = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  date: string;
  time?: string;
  timeFrom?: string;
  timeTo?: string;
  contacted: boolean;
  createdAt: string;
};

const AdminConsultations = () => {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConsultations = async () => {
    try {
      const res = await axios.get("/api/admin/consultations");
      setConsultations(res.data);
    } catch {
      toast({
        title: "Error",
        description: "Failed to load consultations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConsultations();
  }, []);

  // ✅ Update status via dropdown
  const updateStatus = async (id: string, contacted: boolean) => {
    try {
      const res = await axios.patch(
        `/api/admin/consultations/${id}/status`,
        { contacted }
      );

      setConsultations((prev) =>
        prev.map((c) => (c._id === id ? res.data : c))
      );

      toast({
        title: "Updated",
        description: `Marked as ${contacted ? "Contacted" : "New"}`,
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="p-6">Loading consultations...</div>;
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold text-amber-900">
        Consultation Requests
      </h1>

      {consultations.length === 0 ? (
        <p className="text-stone-600">No consultation requests yet.</p>
      ) : (
        consultations.map((c) => (
          <Card key={c._id} className="p-4">
            <div className="flex justify-between items-start gap-4">
              {/* Left info */}
              <div>
                <p className="font-semibold text-amber-900">{c.name}</p>
                <p className="text-sm text-stone-600">{c.email}</p>
                <p className="text-sm text-stone-600">{c.phone}</p>
              </div>

              {/* Right info */}
              <div className="flex flex-col items-end gap-1 min-w-[140px]">
                {/* ✅ Status dropdown */}
                <Select
                  value={c.contacted ? "contacted" : "new"}
                  onValueChange={(value) =>
                    updateStatus(c._id, value === "contacted")
                  }
                >
                  <SelectTrigger
                    className={`h-8 text-xs font-medium ${
                      c.contacted
                        ? "bg-green-100 text-green-800 border-green-300"
                        : "bg-red-100 text-red-800 border-red-300"
                    }`}
                  >
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                  </SelectContent>
                </Select>

                <p className="text-xs text-stone-600">
                  {new Date(c.date).toLocaleDateString()}
                </p>

                <p className="text-xs font-medium text-stone-700">
                  {c.time ? c.time : `${c.timeFrom} – ${c.timeTo}`}
                </p>
              </div>
            </div>
          </Card>
        ))
      )}
    </div>
  );
};

export default AdminConsultations;
