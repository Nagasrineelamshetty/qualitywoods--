import { useEffect, useState } from "react";
import axios from "../api/axios";
import { Card } from "../components/ui/card";
import { toast } from "../hooks/use-toast";

type Consultation = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  date: string;
  time?: string;
  timeFrom?: string;
  timeTo?: string;
  contacted: boolean; // ✅ REQUIRED
  createdAt: string;
};

const AdminConsultations = () => {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

    fetchConsultations();
  }, []);

  // ✅ Mark consultation as contacted
  const markAsContacted = async (id: string) => {
    try {
      const res = await axios.patch(
        `/api/admin/consultations/${id}/contacted`
      );

      setConsultations((prev) =>
        prev.map((c) => (c._id === id ? res.data : c))
      );

      toast({
        title: "Updated",
        description: "Marked as contacted",
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
            <div className="flex justify-between items-start">
              {/* Left info */}
              <div>
                <p className="font-semibold text-amber-900">{c.name}</p>
                <p className="text-sm text-stone-600">{c.email}</p>
                <p className="text-sm text-stone-600">{c.phone}</p>
              </div>

              {/* Right info */}
              <div className="text-right space-y-1">
                {/* Status badge */}
                <span
                  className={`inline-block px-2 py-1 text-xs rounded-full font-medium ${
                    c.contacted
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {c.contacted ? "Contacted" : "New"}
                </span>

                {/* Action button */}
                {!c.contacted && (
                  <button
                    onClick={() => markAsContacted(c._id)}
                    className="block mt-2 text-xs px-3 py-1 rounded bg-amber-600 text-white hover:bg-amber-700"
                  >
                    Mark as Contacted
                  </button>
                )}

                <p className="text-sm text-stone-700">
                  {new Date(c.date).toLocaleDateString()}
                </p>

                <p className="text-sm font-medium text-stone-700">
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
