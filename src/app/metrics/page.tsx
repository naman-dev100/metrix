"use client";

import { useState, useEffect } from "react";
import BodyWeightChart from "@/components/dashboard/BodyWeightChart";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import ConfirmDeleteDialog from "@/components/ConfirmDeleteDialog";

interface WeightLog {
  id: string;
  weight: number;
  date: string;
  notes?: string | null;
}

export default function MetricsPage() {
  const [logs, setLogs] = useState<WeightLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/bodyweight");
      const data = await res.json();
      setLogs(data);
    } catch (error) {
      console.error("Failed to fetch bodyweight logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/bodyweight/${deleteId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Weight log deleted");
        await fetchLogs();
      } else {
        toast.error("Failed to delete weight log");
      }
    } catch (error) {
      toast.error("Failed to delete weight log");
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  const handleCancelDelete = () => {
    if (!isDeleting) {
      setDeleteId(null);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Metrics</h1>
        <p className="text-gray-500 mt-1">Track your body weight progress</p>
      </div>

      {/* BodyWeightChart with logs passed as prop */}
      <div className="max-w-4xl">
        <BodyWeightChart 
          logs={logs}
          loading={loading}
          showInput={true} 
          chartHeight={220} 
          showTitle={false}
          onWeightAdded={fetchLogs}
        />
      </div>

      {/* Past Weight Logs */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Past Weight Logs</h2>
        
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="bg-[#0a0a0a] border border-[#1a1a24] rounded-2xl h-20 animate-pulse"
              />
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="bg-[#111118] border border-[#1e1e2a] rounded-xl p-8 text-center">
            <p className="text-[#a3a3aa]">No weight logs yet. Add your first weight above!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => (
              <div
                key={log.id}
                className="bg-[#0a0a0a] border border-[#1a1a24] rounded-2xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.5)] hover:border-[#7c3aed]/30 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-baseline gap-3">
                    <span className="text-2xl font-bold text-white">
                      {log.weight.toFixed(1)} kg
                    </span>
                    <span className="text-sm text-[#a3a3aa]">
                      {formatDate(log.date)}
                    </span>
                  </div>                    
                  {/* Delete button - shows on hover */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteClick(log.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-[#5a5a6a] hover:text-red-500 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirm Delete Dialog */}
      <ConfirmDeleteDialog
        isOpen={deleteId !== null}
        title="Delete Weight Log"
        description="Are you sure you want to delete this weight log? This action cannot be undone."
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}
