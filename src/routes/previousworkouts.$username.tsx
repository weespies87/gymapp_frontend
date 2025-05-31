import { createFileRoute } from '@tanstack/react-router'
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/auth/AuthContext';
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { Card } from '@/components/ui/card'
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

// Define interfaces for our data types
interface WorkoutExercise {
  id: number;
  user: string;
  activity: string;
  sets: number;
  reps: number;
  weight: number;
  loggedDate: string;
}

interface WorkoutData {
  message: string;
  data: WorkoutExercise[];
  date: string;
}

interface ActivityStats {
  totalSets: number;
  totalExercises: number;
}

interface GroupedExercises {
  [activity: string]: WorkoutExercise[];
}

// Define the component first
function historicalWorkout() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [formattedDate, setFormattedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [workoutData, setWorkoutData] = useState<WorkoutData | null>(null);
  const [allWorkouts, setAllWorkouts] = useState<WorkoutData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all workout routines from API
  const fetchAllWorkoutRoutines = (): void => {
    setLoading(true);
    setError(null);

    // Make the API call to get all workouts
    fetch('/api/AllWorkoutRoutines', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user: user
      })
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data: WorkoutData) => {
        setAllWorkouts(data);
        // After getting all workouts, filter for the selected date
        filterWorkoutsByDate(formattedDate, data);
        setLoading(false);
      })
      .catch((err: Error) => {
        console.error('Fetch error:', err);
        setError("Failed to fetch workout data. Please try again.");
        setLoading(false);
      });
  };

  // Filter workouts by selected date
  const filterWorkoutsByDate = (date: string, workoutsData: WorkoutData | null = allWorkouts): void => {
    if (!workoutsData) return;

    const filteredWorkouts = workoutsData.data.filter(workout =>
      workout.loggedDate === date
    );

    setWorkoutData({
      message: filteredWorkouts.length > 0 ? "Workouts Found" : "No Workouts Found",
      data: filteredWorkouts,
      date: date
    });
  };

  // Handle date change from the calendar
  const handleDateChange = (date: Date | undefined): void => {
    if (!date) return;

    setSelectedDate(date);
    console.log(selectedDate)
    const formattedDate = date.toISOString().split('T')[0];
    setFormattedDate(formattedDate);

    if (allWorkouts) {
      filterWorkoutsByDate(formattedDate);
    }
  };

  // Fetch data once when component mounts
  useEffect(() => {
    fetchAllWorkoutRoutines();
  }, []);

  // Group exercises by activity type
  const groupExercisesByActivity = (exercises: WorkoutExercise[]): GroupedExercises => {
    const grouped: GroupedExercises = {};

    exercises.forEach(exercise => {
      if (!grouped[exercise.activity]) {
        grouped[exercise.activity] = [];
      }
      grouped[exercise.activity].push(exercise);
    });

    return grouped;
  };

  // Calculate workout stats
  const calculateStats = (exercises: WorkoutExercise[]): ActivityStats => {
    if (!exercises || exercises.length === 0) return { totalSets: 0, totalExercises: 0 };

    const totalSets = exercises.reduce((total, ex) => total + ex.sets, 0);
    const uniqueActivities = new Set(exercises.map(ex => ex.activity)).size;

    return {
      totalSets,
      totalExercises: uniqueActivities
    };
  };

  return (
    <div className="bg-gradient-to-r from-[#6D51A5] to-[#E4A7C5] home-container flex flex-col justify-center items-center h-svh bg-gray-100">
        <h1 className="m-4 text-2xl font-bold mb-6">Previous Workouts</h1>
        <div className="m-4 mb-6">
          <div className="flex flex-col">
            <label className="text-sm font-medium text-white mb-2">
              Select Workout Date:
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[240px] pl-3 text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  {selectedDate ? (
                    format(selectedDate, "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateChange}
                  disabled={(date) =>
                    date > new Date() || date < new Date("1900-01-01")
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      <Card className="p-2 w-full max-w-md max-h-[90vh] overflow-y-auto p-2">

        {loading && (
          <div className="text-center py-8">
            <p className="text-gray-600">Loading workout data...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-8">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {workoutData && !loading && workoutData.data.length > 0 && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="m-2 text-m font-bold">Workouts for {workoutData.date}</h2>
              <div className="text-sm text-gray-600 m-2">
                <span className="font-medium">Summary: </span>
                {calculateStats(workoutData.data).totalExercises} exercises,
                {' '}{calculateStats(workoutData.data).totalSets} total sets
              </div>
            </div>

            {Object.entries(groupExercisesByActivity(workoutData.data)).map(([activity, exercises]) => (
              <div key={activity} className="mb-8 border rounded-lg overflow-hidden shadow-sm">
                <div className="bg-gray-100 p-4 border-b">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-lg">{activity}</h3>
                    <span className="text-sm text-gray-600">
                      {exercises.length} sets total
                    </span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <div className="m-2 overflow-x-auto m-2">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Set</TableHead>
                          <TableHead>Reps</TableHead>
                          <TableHead>Weight (kg)</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {exercises.map((exercise) => (
                          <TableRow key={exercise.id}>
                            <TableCell className="font-medium">{exercise.sets}</TableCell>
                            <TableCell>{exercise.reps}</TableCell>
                            <TableCell>{exercise.weight}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {workoutData && workoutData.data.length === 0 && (
          <div className="text-center py-8 border rounded-lg">
            <p className="text-gray-600">No workouts found for {formattedDate}.</p>
          </div>
        )}
      </Card>
    </div>
  );
}

// Then export the Route with the component
export const Route = createFileRoute('/previousworkouts/$username')({
  component: historicalWorkout,
})