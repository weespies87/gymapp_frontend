import { createFileRoute } from '@tanstack/react-router'
import ProtectedRoute from '@/components/ProtectedRoute';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from '@/components/ui/button';
import { useState, useEffect } from "react";
import { TrendingUp } from "lucide-react"
import {
  CartesianGrid,
  LabelList,
  Line,
  LineChart,
  XAxis,
  YAxis,
  Legend,
  Tooltip,
  ResponsiveContainer
} from "recharts"; import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
} from "@/components/ui/chart"

export const Route = createFileRoute('/stats/$username')({
  component: UserStats,
})

const WeightData = [
  { date: "2025-05-01", weight: 98.8, weightgoal: 90 },
  { date: "2025-05-03", weight: 99, weightgoal: 90 },
  { date: "2025-05-12", weight: 98, weightgoal: 90 },
  { date: "2025-05-17", weight: 100, weightgoal: 90 },
]

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "hsl(var(--chart-1))",
  },
  mobile: {
    label: "Mobile",
    color: "hsl(var(--chart-2))",
  },
}

type UserMeasurements = {
  data: any
  id: number,
  height: number,
  weights: number,
  measurearms: number,
  measurethighs: number,
  measurewaist: number,
  measurehips: number,
  created_at: string
}


function UserStats() {
  const { username } = Route.useParams();
  const [userMeasurements, setUserMeasurements] = useState<UserMeasurements[]>([]);


  useEffect(() => {
    const featchUserMeasurements = async () => {
      try {
        const response = await fetch(`/api/UserMeasurements`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user: username,
          }),
        });
        if (!response.ok) {
          throw new Error("Failed to get UserMeasurements");
        }
        const data = await response.json();
        console.log("Set ready status success:", data);
        setUserMeasurements(data.data);
      } catch (error) {
        console.error("Error setting status:", error);
      }
    };

    featchUserMeasurements();
    return
  }, []);

  return (
    <ProtectedRoute>
      <div className="bg-gradient-to-r from-[#6D51A5] to-[#E4A7C5] home-container flex flex-col items-center min-h-svh bg-gray-100 p-4 overflow-y-auto">
          {/* First card with inputs */}
          <Card className="w-full max-w-lg mb-4">
            <CardHeader>
              <CardTitle className="flex justify-center">Hello {username}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid w-full items-center gap-4">
                <Label htmlFor="weight">Weight (Kgs)</Label>
                <Input
                  id="weight"
                  placeholder="kgs"
                />
                <Label htmlFor="Height">Height (CMs)</Label>
                <Input
                  id="Height"
                  placeholder="191"
                />
                <Label htmlFor="Measurements">Measurements (CMs)</Label>
                <Input
                  id="Measurements"
                  placeholder="e.g., 12.5"
                />
                <div className="flex flex-col space-y-1.5">
                  <Button
                    className="flex flex-col space-y-1.5 bg-[#7F96FF] hover:bg-[#320E3B]"
                  >
                    Submit
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Second card with chart */}
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle>Weight Chart</CardTitle>
              <CardDescription>Tracking Weight Change</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={WeightData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 10,
                      bottom: 100
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickLine={false}
                      angle={30}
                      tickMargin={30}
                      height={30}
                      interval={0}
                    />
                    <Legend verticalAlign="top" height={36} />
                    <Tooltip />

                    <Line
                      name="Current Weight"
                      dataKey="weight"
                      stroke="#FF6B6B"
                      strokeWidth={3}
                      dot={{ fill: "#FF6B6B", r: 5 }}
                    />

                    <Line
                      name="Weight Goal"
                      dataKey="weightgoal"
                      stroke="#A6CFD5"
                      strokeWidth={1}
                      // strokeDasharray="5 5"
                      dot={{ fill: "#A6CFD5", r: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
            <CardFooter className="flex-col items-start gap-2 text-sm">
              <div className="leading-none text-muted-foreground">
                Track your progress toward your weight goal
              </div>
            </CardFooter>
          </Card>
        </div>
    </ProtectedRoute>
  )
}
