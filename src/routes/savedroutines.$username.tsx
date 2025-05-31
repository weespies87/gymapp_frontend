import { createFileRoute } from "@tanstack/react-router";
import { TrendingUp } from "lucide-react";
import {
  CartesianGrid,
  LabelList,
  Line,
  LineChart,
  XAxis,
  YAxis,
  BarChart,
  Bar,
  Legend,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { useState, useEffect } from "react";
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/auth/AuthContext';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { SelectGroup, SelectLabel } from "@radix-ui/react-select";

// Updated type based on the actual API response
interface UserData {
  id: number;
  username: string;
  email: string;
}

interface TodaysWorkout {
  id: number;
  user: string; // This is a stringified JSON
  activity: string;
  sets: number;
  reps: number;
  weight: number;
  loggedDate: string;
}

interface ApiResponse {
  message: string;
  data: TodaysWorkout[];
  date: string;
}

interface ChartDataPoint {
  month: string;
  workouts: number;
}

// New interface for the stacked chart
interface ExerciseBreakdown {
  category: string;
  [key: string]: number | string; // For exercise types and their counts
}

type TimeRangeOption = "7d" | "30d" | "90d";

type ChartConfigType = {
  [key: string]: {
    label: string;
    color: string;
  };
};

function RouteComponent(): React.ReactElement {
  const { user, logout } = useAuth();
  const [todaysWorkouts, setTodaysWorkouts] = useState<TodaysWorkout[]>([]);
  const [workoutDate, setWorkoutDate] = useState<string>("");
  const [timeRange, setTimeRange] = useState<TimeRangeOption>("90d");
  const [activeView, setActiveView] = useState<'progress' | 'breakdown'>('progress');


  // Chart data for line chart
  const [chartData, setChartData] = useState<ChartDataPoint[]>([
    { month: "January", workouts: 0 },
    { month: "February", workouts: 0 },
    { month: "March", workouts: 0 },
    { month: "April", workouts: 0 },
    { month: "May", workouts: 0 },
    { month: "June", workouts: 0 },
  ]);

  // Chart data for stacked breakdown chart
  const [breakdownData, setBreakdownData] = useState<ExerciseBreakdown[]>([]);

  // Colors for different exercise types in stacked chart
  const exerciseColors = {
    "Legs": "#8884d8",
    "Arms": "#82ca9d",
    "Chest": "#ffc658",
    "Back": "#ff8042",
    "Core": "#0088fe",
    // "Cardio": "#ff005d",
    "Other": "#00C49F"
  };

  // Map exercise to category
  const categorizeExercise = (exercise: string): string => {
    const lowerCaseExercise = exercise.toLowerCase();

    if (lowerCaseExercise.includes('leg') ||
      lowerCaseExercise.includes('squat') ||
      lowerCaseExercise.includes('lunge') ||
      lowerCaseExercise.includes('adductor') ||
      lowerCaseExercise.includes('raise') ||
      lowerCaseExercise.includes('abductor')) {
      return "Legs";
    } else if (lowerCaseExercise.includes('arm') ||
      lowerCaseExercise.includes('bicep') ||
      lowerCaseExercise.includes('tricep') ||
      lowerCaseExercise.includes('curl')) {
      return "Arms";
    } else if (lowerCaseExercise.includes('chest') ||
      lowerCaseExercise.includes('bench') ||
      lowerCaseExercise.includes('press') && !lowerCaseExercise.includes('leg')) {
      return "Chest";
    } else if (lowerCaseExercise.includes('back') ||
      lowerCaseExercise.includes('lat') ||
      lowerCaseExercise.includes('row') ||
      lowerCaseExercise.includes('pull')) {
      return "Back";
    } else if (lowerCaseExercise.includes('ab') ||
      lowerCaseExercise.includes('core') ||
      lowerCaseExercise.includes('plank')) {
      return "Core";
    } else if (lowerCaseExercise.includes('cardio') ||
      lowerCaseExercise.includes('run') ||
      lowerCaseExercise.includes('bike') ||
      lowerCaseExercise.includes('treadmill')) {
      return "Cardio";
    } else {
      return "Other";
    }
  };

  const chartConfig: ChartConfigType = {
    workouts: {
      label: "Workouts",
      color: "hsl(var(--chart-1))",
    }
  };

  useEffect(() => {
    const fetchTodaysWorkoutData = async (): Promise<void> => {
      try {
        const response = await fetch(`/api/AllWorkoutRoutines`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user: user,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to get workouts");
        }

        const responseData: ApiResponse = await response.json();
        console.log("Fetched workout data:", responseData);

        setTodaysWorkouts(responseData.data);
        setWorkoutDate(responseData.date);

        processWorkoutsForChart(responseData.data);
        processWorkoutsForBreakdown(responseData.data);
      } catch (error) {
        console.error("Error fetching workouts:", error);
      }
    };

    fetchTodaysWorkoutData();
    const intervalId = setInterval(fetchTodaysWorkoutData, 8000);
    return () => clearInterval(intervalId);
  }, [user]);

  // Function to process workout data into chart format
  const processWorkoutsForChart = (workouts: TodaysWorkout[]): void => {
    // Group workouts by month
    const workoutsByMonth: Record<string, number> = {};

    // Create an array of the last 6 months
    const months = [];
    const today = new Date();

    for (let i = 5; i >= 0; i--) {
      const month = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthName = month.toLocaleString('default', { month: 'long' });
      months.push({
        name: monthName,
        date: new Date(month)
      });
      workoutsByMonth[monthName] = 0;
    }

    // Count workouts by month
    workouts.forEach(workout => {
      const workoutDate = new Date(workout.loggedDate);
      const monthName = workoutDate.toLocaleString('default', { month: 'long' });

      if (workoutsByMonth[monthName] !== undefined) {
        workoutsByMonth[monthName]++;
      }
    });

    // Convert to chart data format
    const newChartData: ChartDataPoint[] = months.map(month => ({
      month: month.name,
      workouts: workoutsByMonth[month.name]
    }));

    setChartData(newChartData);
  };

  const filterTodaysWorkouts = (workouts: TodaysWorkout[]): TodaysWorkout[] => {
    const today = new Date();
    const todayString = today.toISOString().split('T')[0]; // YYYY-MM-DD format

    return workouts.filter(workout => {
      const workoutDate = new Date(workout.loggedDate);
      const workoutDateString = workoutDate.toISOString().split('T')[0];

      return workoutDateString === todayString;
    });
  };

  const onlyTodaysWorkouts = filterTodaysWorkouts(todaysWorkouts);


  const processWorkoutsForBreakdown = (workouts: TodaysWorkout[]): void => {
    // Group by date (last 7 days)
    const breakdownByDate: Record<string, Record<string, number>> = {};

    // Create entries for last 7 days
    const days = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const day = new Date(today);
      day.setDate(today.getDate() - i);

      const dateStr = day.toISOString().split('T')[0]; // YYYY-MM-DD format
      const displayDate = day.toLocaleDateString('en-US', { weekday: 'short' }); // e.g., "Mon"

      days.push({
        date: dateStr,
        display: displayDate
      });

      // Initialize all exercise types with zero count for this day
      breakdownByDate[dateStr] = {
        "Legs": 0,
        "Arms": 0,
        "Chest": 0,
        "Back": 0,
        "Core": 0,
        "Other": 0
      };
    }

    // Count workouts by exercise type for each day
    workouts.forEach(workout => {
      const workoutDate = new Date(workout.loggedDate);
      const dateStr = workoutDate.toISOString().split('T')[0];

      if (breakdownByDate[dateStr]) {
        const category = categorizeExercise(workout.activity);
        breakdownByDate[dateStr][category]++;
      }
    });

    // Convert to chart data format
    const newBreakdownData: ExerciseBreakdown[] = days.map(day => {
      const categories = breakdownByDate[day.date] || {};
      return {
        category: day.display,
        ...categories
      };
    });

    setBreakdownData(newBreakdownData);
  };

  // Function to filter data based on time range
  const getFilteredData = (): ChartDataPoint[] => {
    const now = new Date();

    // Calculate cutoff dates based on time range
    let cutoffDate: Date;
    if (timeRange === "7d") {
      cutoffDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
    } else if (timeRange === "30d") {
      cutoffDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    } else { // "90d"
      cutoffDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
    }

    // If 90 days is selected, return all data
    if (timeRange === "90d") {
      return chartData;
    }

    // For other ranges, filter based on the month's index in our chart data
    const currentMonthIndex = now.getMonth();
    const filterStartIndex = Math.max(0, 6 - (currentMonthIndex - cutoffDate.getMonth()));

    return chartData.slice(filterStartIndex);
  };

  const filteredChartData: ChartDataPoint[] = getFilteredData();

  // Calculate trend percentage for display
  const calculateTrend = (): string => {
    if (filteredChartData.length < 2) {
      return "0.0"; // Not enough data to calculate trend
    }

    const lastMonth = filteredChartData[filteredChartData.length - 1].workouts || 0;
    const previousMonth = filteredChartData[filteredChartData.length - 2].workouts || 1; // Avoid division by zero

    if (previousMonth === 0) return "0.0"; // Avoid division by zero

    const percentChange = ((lastMonth - previousMonth) / previousMonth) * 100;
    return percentChange.toFixed(1);
  };

  const trendPercentage: string = calculateTrend();
  const isTrendingUp: boolean = parseFloat(trendPercentage) >= 0;

  // Function to parse user data from stringified JSON
  const parseUserData = (userJson: string): UserData | null => {
    try {
      return JSON.parse(userJson) as UserData;
    } catch (error) {
      console.error("Error parsing user data:", error);
      return null;
    }
  };

  //   const handleActivityInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const input = e.target.value;

  //   // Update workout form state
  //   setNewWorkout({ ...newWorkout, activity: input });

  //   if (input.length > 0) {
  //     // Create a Set to avoid duplicate suggestions
  //     const uniqueActivities = new Set<string>();

  //     // Filter AllWorkouts that match the input
  //     AllWorkouts.forEach(workout => {
  //       if (workout.activity &&
  //         workout.activity.toLowerCase().includes(input.toLowerCase())) {
  //         uniqueActivities.add(workout.activity);
  //       }
  //     });

  //     // Convert Set back to array and update suggestions
  //     setActivitySuggestions(Array.from(uniqueActivities));
  //     setShowSuggestions(true);
  //   } else {
  //     // Clear suggestions if input is empty
  //     setActivitySuggestions([]);
  //     setShowSuggestions(false);
  //   }
  // };

  // // Function to handle suggestion selection
  // const selectSuggestion = (suggestion: string) => {
  //   setNewWorkout({ ...newWorkout, activity: suggestion });
  //   setShowSuggestions(false);
  // };

  return (
    <ProtectedRoute>
      <div className="bg-gradient-to-r from-[#6D51A5] to-[#E4A7C5] home-container flex flex-col items-center min-h-svh bg-gray-100 p-4 overflow-y-auto">        {/* Time range selector and view toggle */}
        <div className="mb-4 w-full max-w-md flex justify-between items-center">
          <div className="flex space-x-2">
            <button
              className={`px-3 py-1 rounded ${activeView === 'progress' ? 'bg-[#6D51A5] text-white' : 'bg-gray-200'}`}
              onClick={() => setActiveView('progress')}
            >
              Progress
            </button>
            <button
              className={`px-3 py-1 rounded ${activeView === 'breakdown' ? 'bg-[#6D51A5] text-white' : 'bg-gray-200'}`}
              onClick={() => setActiveView('breakdown')}
            >
              Gains
            </button>
          </div>
        </div>
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Workout Breakdown</CardTitle>
            <CardDescription>Last 7 Days</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={breakdownData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 0,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Legend />
                {Object.keys(exerciseColors).map((key) => (
                  <Bar
                    key={key}
                    dataKey={key}
                    stackId="a"
                    fill={exerciseColors[key as keyof typeof exerciseColors]}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
          <CardFooter className="flex-col items-start gap-2 text-sm">
            <div className="leading-none text-muted-foreground">
              Showing exercise type distribution by day
            </div>
          </CardFooter>
        </Card>

        {activeView === 'breakdown' && (
          <Card className="w-full max-w-md mt-4">
            <CardHeader>
              <CardTitle>Breakdown</CardTitle>
              <CardContent>
                <Select>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Choose Workout" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Workout</SelectLabel>
                      {/* {historicalWorkout.setDetails.map((set, index)
                    )} */}
                    </SelectGroup>
                  </SelectContent>

                </Select>
              </CardContent>
            </CardHeader>
          </Card>
        )}

        {/* Today's workouts table */}
        <Card className="w-full max-w-md mt-4">
          <CardHeader>
            <CardTitle>Today's Workouts</CardTitle>
            {workoutDate && (
              <CardDescription>
                {new Date(workoutDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            {onlyTodaysWorkouts.length > 0 ? (
              <Table>
                <TableBody>
                  {onlyTodaysWorkouts.map((workout: TodaysWorkout) => (
                    <TableRow key={workout.id}>
                      <TableCell className="font-medium">{workout.activity}</TableCell>
                      <TableCell>{workout.sets} sets</TableCell>
                      <TableCell>{workout.reps} reps</TableCell>
                      <TableCell>{workout.weight} lbs</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                No workouts scheduled for today
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}

export const Route = createFileRoute('/savedroutines/$username')({
  component: RouteComponent,
});