"use client";

import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
} from "recharts";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { toast } from "sonner";

interface WeightLog {
  id: string;
  weight: number;
  date: string;
  notes?: string | null;
}

export default function BodyWeightChart() {
  const [logs, setLogs] = useState<WeightLog[]>([]);
  const [newWeight, setNewWeight] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

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

  const handleAddWeight = async () => {
    if (!newWeight || isNaN(Number(newWeight))) {
      toast.error("Please enter a valid weight");
      return;
    }

    setAdding(true);
    try {
      const res = await fetch("/api/bodyweight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weight: parseFloat(newWeight),
          date: new Date().toISOString(),
        }),
      });

      if (res.ok) {
        toast.success(`Weight logged: ${newWeight} kg`);
        setNewWeight("");
        await fetchLogs();
      } else {
        toast.error("Failed to save weight");
      }
    } catch (error) {
      toast.error("Failed to save weight");
    } finally {
      setAdding(false);
    }
  };

  // Format data for recharts
  const chartData = logs.map((log) => {
    let dateObj: Date;
    if (log.date instanceof Date) {
      dateObj = log.date;
    } else if (typeof log.date === 'string') {
      dateObj = new Date(log.date);
    } else {
      dateObj = new Date();
    }
    return {
      date: format(dateObj, "MMM dd"),
      weight: log.weight,
      fullDate: format(dateObj, "yyyy-MM-dd"),
    };
  });

  // Calculate stats
  const latestWeight = logs.length > 0 ? logs[logs.length - 1].weight : 0;
  const prevWeight = logs.length > 1 ? logs[logs.length - 2].weight : latestWeight;
  const weightChange = latestWeight - prevWeight;
  const minWeight = logs.length > 0 ? Math.min(...logs.map((l) => l.weight)) : 0;
  const maxWeight = logs.length > 0 ? Math.max(...logs.map((l) => l.weight)) : 0;
  const avgWeight = logs.length > 0
    ? logs.reduce((sum, l) => sum + l.weight, 0) / logs.length
    : 0;

  // Format date for x-axis
  const formatDateForAxis = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const diffDays = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `May ${date.getDate()}`;
    return `${date.toLocaleString('default', { month: 'short' })} ${date.getDate()}`;
  };

  return (
    <Card className="bg-[#0a0a0a] border-[#1a1a24] rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
      {/* Header */}
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-white">
          Body Weight Tracker
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Current Weight & Trend */}
        <div className="flex items-baseline gap-3">
          <span className="text-4xl font-bold text-white tracking-tight">
            {latestWeight.toFixed(1)} kg
          </span>
          {weightChange !== 0 && (
            <span
              className={`flex items-center gap-1 text-sm font-semibold ${
                weightChange > 0
                  ? "text-[#ef4444]"
                  : weightChange < 0
                  ? "text-[#22c55e]"
                  : "text-[#5a5a6a]"
              }`}
            >
              {weightChange > 0 ? (
                <TrendingUp className="w-4 h-4" />
              ) : weightChange < 0 ? (
                <TrendingDown className="w-4 h-4" />
              ) : (
                <Minus className="w-4 h-4" />
              )}
              {Math.abs(weightChange).toFixed(1)} kg this month
            </span>
          )}
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3">
          {/* Min */}
          <div className="bg-[#1a1a24] rounded-xl p-4 text-center border border-[#2a2a3a] hover:border-[#7c3aed]/50 transition-colors">
            <p className="text-[10px] text-[#b0b0b8] uppercase tracking-widest font-semibold mb-1">
              Min
            </p>
            <p className="text-xl font-bold text-white tracking-tight">
              {minWeight.toFixed(1)}
            </p>
          </div>

          {/* Avg */}
          <div className="bg-[#1a1a24] rounded-xl p-4 text-center border border-[#2a2a3a] hover:border-[#7c3aed]/50 transition-colors">
            <p className="text-[10px] text-[#b0b0b8] uppercase tracking-widest font-semibold mb-1">
              Avg
            </p>
            <p className="text-xl font-bold text-white tracking-tight">
              {avgWeight.toFixed(1)}
            </p>
          </div>

          {/* Max */}
          <div className="bg-[#1a1a24] rounded-xl p-4 text-center border border-[#2a2a3a] hover:border-[#7c3aed]/50 transition-colors">
            <p className="text-[10px] text-[#b0b0b8] uppercase tracking-widest font-semibold mb-1">
              Max
            </p>
            <p className="text-xl font-bold text-white tracking-tight">
              {maxWeight.toFixed(1)}
            </p>
          </div>
        </div>

        {/* Chart */}
        <div className="h-[280px] bg-[#050505] rounded-xl border border-[#1a1a24] p-4">
          {loading ? (
            <div className="h-full w-full flex items-center justify-center">
              <div className="text-[#5a5a6a] text-sm">Loading...</div>
            </div>
          ) : chartData.length === 0 ? (
            <div className="h-full w-full flex items-center justify-center">
              <div className="text-[#5a5a6a] text-sm">No weight data yet</div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
              >
                {/* Grid Lines */}
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#1a1a24"
                  vertical={false}
                />

                {/* Y Axis */}
                <YAxis
                  domain={['auto', 'auto']}
                  orientation="right"
                  tick={{ fill: "#5a5a6a", fontSize: 11, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => value.toFixed(0)}
                />

                {/* X Axis */}
                <XAxis
                  dataKey="fullDate"
                  tick={{ fill: "#5a5a6a", fontSize: 11, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={formatDateForAxis}
                  minTickGap={60}
                />

                {/* Area Fill */}
                <Area
                  type="monotone"
                  dataKey="weight"
                  stroke="transparent"
                  fill="#7c3aed"
                  fillOpacity={0.15}
                />

                {/* Line */}
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="#7c3aed"
                  strokeWidth={3}
                  dot={{
                    r: 5,
                    fill: "#7c3aed",
                    strokeWidth: 2,
                    stroke: "#0a0a0a",
                    fillOpacity: 1,
                  }}
                  activeDot={{
                    r: 7,
                    fill: "#7c3aed",
                    strokeWidth: 2,
                    stroke: "#0a0a0a",
                    fillOpacity: 1,
                  }}
                />

                {/* Custom Tooltip */}
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a1a24',
                    border: '1px solid #3a3a4a',
                    borderRadius: '12px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                  }}
                  itemStyle={{ color: '#fafafa', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}
                  labelStyle={{ color: '#b0b0b8', fontSize: '12px' }}
                  formatter={(value: any) => value ? [value.toFixed(1), 'kg'] : ['-', '']}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <div className="flex-1">
            <Label htmlFor="weight" className="text-xs text-[#b0b0b8] mb-1 block uppercase tracking-wider font-semibold">
              Today&apos;s Weight (kg)
            </Label>
            <Input
              id="weight"
              type="number"
              step="0.1"
              placeholder="e.g., 75.5"
              value={newWeight}
              onChange={(e) => setNewWeight(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddWeight()}
              className="bg-[#050505] border-[#1a1a24] text-white placeholder-[#5a5a6a] focus:ring-[#7c3aed] font-mono h-11"
            />
          </div>
          <div className="flex items-end">
            <Button
              onClick={handleAddWeight}
              disabled={adding || !newWeight}
              className="bg-gradient-to-r from-[#7c3aed] to-[#5b21b6] hover:from-[#7c3aed] hover:to-[#5b21b6] text-white px-6 h-11 rounded-xl font-semibold shadow-[0_4px_12px_rgba(124,58,237,0.3)] hover:shadow-[0_6px_16px_rgba(124,58,237,0.4)] transition-all"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
