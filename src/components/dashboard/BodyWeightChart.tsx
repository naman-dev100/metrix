"use client";

import { useState } from "react";
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

interface BodyWeightChartProps {
  logs?: WeightLog[];
  loading?: boolean;
  showInput?: boolean;
  chartHeight?: number;
  showTitle?: boolean;
  onWeightAdded?: () => void;
}

export default function BodyWeightChart({ 
  logs = [],
  loading = false,
  showInput = true, 
  chartHeight = 280,
  onWeightAdded,
}: BodyWeightChartProps) {
  const [newWeight, setNewWeight] = useState("");
  const [adding, setAdding] = useState(false);

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
        onWeightAdded?.();
      } else {
        toast.error("Failed to save weight");
      }
    } catch (error) {
      toast.error("Failed to save weight");
    } finally {
      setAdding(false);
    }
  };

  const chartData = logs.map((log) => {
    let dateObj: Date;
    if (typeof log.date === 'string') {
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

  const latestWeight = logs.length > 0 ? logs[logs.length - 1].weight : 0;
  const prevWeight = logs.length > 1 ? logs[logs.length - 2].weight : latestWeight;
  const weightChange = latestWeight - prevWeight;

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
    <div className="space-y-6">
      {/* Current Weight & Trend */}
      <div className="flex items-baseline gap-3">
        <span className="text-4xl tabular-nums font-semibold text-foreground tracking-tight">
          {latestWeight.toFixed(1)} kg
        </span>
        {weightChange !== 0 && (
          <span
            className={`flex items-center gap-1 text-sm font-medium ${
              weightChange > 0
                ? "text-destructive"
                : weightChange < 0
                ? "text-green-500" /* Good trend for most */
                : "text-muted-foreground"
            }`}
          >
            {weightChange > 0 ? (
              <TrendingUp className="w-3.5 h-3.5" />
            ) : weightChange < 0 ? (
              <TrendingDown className="w-3.5 h-3.5" />
            ) : (
              <Minus className="w-3.5 h-3.5" />
            )}
            {Math.abs(weightChange).toFixed(1)} kg
          </span>
        )}
      </div>

      {/* Chart Area */}
      {chartHeight > 0 && (
        <div style={{ height: chartHeight + 'px' }} className="w-full">
          {loading ? (
            <div className="h-full w-full flex items-center justify-center">
              <div className="text-muted-foreground text-sm">Loading...</div>
            </div>
          ) : chartData.length === 0 ? (
            <div className="h-full w-full flex items-center justify-center">
              <div className="text-muted-foreground text-sm">No weight data yet</div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 5, right: 0, bottom: 5, left: -20 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--border)"
                  vertical={false}
                />
                <YAxis
                  domain={['auto', 'auto']}
                  orientation="right"
                  tick={{ fill: "var(--muted-foreground)", fontSize: 11, fontFamily: 'var(--font-space)' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => value.toFixed(0)}
                />
                <XAxis
                  dataKey="fullDate"
                  tick={{ fill: "var(--muted-foreground)", fontSize: 11, fontFamily: 'var(--font-space)' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={formatDateForAxis}
                  minTickGap={60}
                />
                <Area
                  type="monotone"
                  dataKey="weight"
                  stroke="transparent"
                  fill="var(--primary)"
                  fillOpacity={0.05}
                />
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="var(--primary)"
                  strokeWidth={2}
                  dot={{
                    r: 4,
                    fill: "var(--primary)",
                    strokeWidth: 2,
                    stroke: "var(--background)",
                  }}
                  activeDot={{
                    r: 6,
                    fill: "var(--primary)",
                    strokeWidth: 0,
                  }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--popover)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                  }}
                  itemStyle={{ color: 'var(--foreground)', fontFamily: 'var(--font-space)' }}
                  labelStyle={{ color: 'var(--muted-foreground)', fontSize: '12px' }}
                  formatter={(value: any) => value ? [value.toFixed(1), 'kg'] : ['-', '']}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      )}

      {/* Input Field */}
      {showInput && (
        <div className="flex gap-3">
          <div className="flex-1">
            <Label htmlFor="weight" className="sr-only">
              Log Today&apos;s Weight
            </Label>
            <Input
              id="weight"
              type="number"
              step="0.1"
              placeholder="Log today's weight (e.g., 75.5)"
              value={newWeight}
              onChange={(e) => setNewWeight(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddWeight()}
              className="bg-background border-border text-foreground placeholder:text-muted-foreground font-mono"
            />
          </div>
          <Button
            onClick={handleAddWeight}
            loading={adding}
            disabled={!newWeight}
            variant="default"
          >
            Log
          </Button>
        </div>
      )}
    </div>
  );
}
