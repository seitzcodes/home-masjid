"use client";

import { useState } from "react";
import { AlertTriangle, Check, X, MapPin, Clock } from "lucide-react";
import { approveJanazah, rejectJanazah } from "./janazah-actions";
import { toast } from "sonner";

export default function PendingJanazahs({ pendingList }: { pendingList: any[] }) {
  const [processing, setProcessing] = useState<string | null>(null);

  if (!pendingList || pendingList.length === 0) {
    return null; // Don't render if there are none
  }

  const handleApprove = async (id: string) => {
    setProcessing(id);
    const res = await approveJanazah(id);
    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success("Janazah approved and broadcasted.");
    }
    setProcessing(null);
  };

  const handleReject = async (id: string) => {
    setProcessing(id);
    const res = await rejectJanazah(id);
    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success("Notice rejected.");
    }
    setProcessing(null);
  };

  return (
    <div className="mt-8 mb-8 border-l-4 border-amber-500 bg-amber-50/50 p-5 rounded-r-xl shadow-sm">
      <div className="flex items-center gap-2 text-amber-800 mb-4">
        <AlertTriangle className="w-5 h-5" />
        <h3 className="font-bold text-lg">Pending Community Submissions</h3>
        <span className="bg-amber-100 text-amber-800 text-xs px-2 py-0.5 rounded-full font-medium ml-2">
          {pendingList.length} Action Required
        </span>
      </div>
      
      <p className="text-amber-700/80 text-sm mb-4">
        The following Janazah notices were submitted by community members. Approve them to immediately broadcast an urgent alert to your followers.
      </p>

      <div className="space-y-4">
        {pendingList.map((janazah) => (
          <div key={janazah.id} className="bg-white p-4 rounded-lg shadow-sm border border-amber-100">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div>
                <h4 className="font-bold text-slate-900 text-lg">{janazah.deceased_name}</h4>
                <div className="mt-2 space-y-1 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span>{janazah.janazah_time} • {new Date(janazah.date_of_passing).toLocaleDateString()}</span>
                  </div>
                  {janazah.burial_location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <span>{janazah.burial_location}</span>
                    </div>
                  )}
                </div>
                {janazah.notes && (
                  <p className="mt-3 text-sm text-slate-500 bg-slate-50 p-2 rounded">
                    "{janazah.notes}"
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleReject(janazah.id)}
                  disabled={processing === janazah.id}
                  className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors disabled:opacity-50"
                >
                  <X className="w-4 h-4" /> Reject
                </button>
                <button
                  onClick={() => handleApprove(janazah.id)}
                  disabled={processing === janazah.id}
                  className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-md transition-colors shadow-sm disabled:opacity-50"
                >
                  <Check className="w-4 h-4" /> Approve & Broadcast
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
