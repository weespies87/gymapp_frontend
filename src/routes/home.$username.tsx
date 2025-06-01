//region imports
import { createFileRoute, pick, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { useAuth } from "@/auth/AuthContext";
import { toast } from "sonner";
import ProtectedRoute from "@/components/ProtectedRoute";
import CollisionTitle from "../components/animations/cardtitle";
import { motion, AnimatePresence } from "motion/react"
import FloatingHelp from "../components/ui/floatinghelp";

export const Route = createFileRoute("/home/$username")({
  component: App,
});

//region types
type UserWorkout = {
  id: number;
  activity: string;
  sets: string;
  reps: string;
  weight: number;
};

type TodaysWorkouts = {
  data: any;
  id: number;
  activity: string;
  sets: string;
  reps: string;
  weight: number;
};

type AllWorkouts = {
  [K in keyof TodaysWorkouts]: K;
};

type TodaysCardioWorkouts = {
  data: any;
  activity: string;
  user: string;
  distance: number;
  time: any;
  speed: any;
  loggedDate: any;
  id: number;
};

type UserCardio = {
  id: number;
  activity: string;
  distance: number;
  speed: number;
  time: number;
  hour: number;
  minute: number;
  second: number;
};

//region function
function App() {
  // State declarations should be inside the component
  const { user, logout } = useAuth();
  const { username } = Route.useParams();
  const [userCardio, setUserCardio] = useState<UserCardio[]>([]);
  const [showWorkoutForm, setShowWorkoutForm] = useState(false);
  const [showCardioForm, setShowCardioForm] = useState(false);
  const [TodaysWorkouts, setTodaysWorkouts] = useState<TodaysWorkouts[]>([]);
  const [AllWorkouts, setAllWorkouts] = useState<AllWorkouts[]>([]);
  const [activitySuggestions, setActivitySuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [TodaysCardioWorkouts, setTodaysCardioWorkouts] = useState<
    TodaysCardioWorkouts[]
  >([]);
  const [gimmresponse, setGimmResponse] = useState();

  const navigate = useNavigate();

  const formatTime = (totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  const [newWorkout, setNewWorkout] = useState<{
    activity: string;
    sets: string;
    setDetails: Array<{
      reps: string;
      weight: number;
    }>;
  }>({
    activity: "",
    sets: "",
    setDetails: [],
  });

  // Cardio form state
  const [newCardio, setNewCardio] = useState<Omit<UserCardio, "id">>({
    activity: "",
    distance: 0,
    speed: 0,
    time: 0,
    hour: 0,
    minute: 0,
    second: 0,
  });

  const handleAddWorkout = () => {
    PostWorkoutData();

    // TODO add toast notification here

    // Reset form and hide it
    setNewWorkout({
      activity: "",
      sets: "",
      setDetails: [],
    });
    setShowWorkoutForm(false);
  };

  const updateSetInputs = (setsValue: string) => {
    const numSets = parseInt(setsValue);
    if (!isNaN(numSets) && numSets > 0) {
      // Create or resize the array based on number of sets
      const newSetDetails = [...newWorkout.setDetails];

      // If we need more entries, add them
      while (newSetDetails.length < numSets) {
        newSetDetails.push({ reps: "", weight: 0 });
      }

      // If we need fewer entries, remove them
      if (newSetDetails.length > numSets) {
        newSetDetails.length = numSets;
      }

      setNewWorkout({
        ...newWorkout,
        sets: setsValue,
        setDetails: newSetDetails,
      });
    } else {
      // Invalid sets number, clear the details
      setNewWorkout({
        ...newWorkout,
        sets: setsValue,
        setDetails: [],
      });
    }
  };

  // Add workout handler
  const handleAddCardio = () => {
    setUserCardio([
      ...userCardio,
      {
        id: Date.now(),
        ...newCardio,
      },
    ]);
    setNewCardio({
      activity: "",
      distance: 0,
      speed: 0,
      time: 0,
      hour: 0,
      minute: 0,
      second: 0,
    });
    PostCardioWorkouttData();
    setShowCardioForm(false);
  };

  useEffect(() => {
    const fetchAllWorkouts = async () => {
      try {
        const response = await fetch(` /api/AllWorkoutRoutines`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user: user,
          }),
        });
        if (!response.ok) {
          throw new Error("Failed to get workouts");
        }
        const data = await response.json();
        console.log("Set ready status success:", data);
        setAllWorkouts(data.data);
      } catch (error) {
        console.error("Error setting status:", error);
      }
    };
    fetchAllWorkouts();
    return;
  }, [user]);

  useEffect(() => {
    const fetchTodaysWorkoutData = async () => {
      try {
        const response = await fetch(` /api/WorkoutRoutinestoday`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user: user,
          }),
        });
        if (!response.ok) {
          throw new Error("Failed to get workouts");
        }
        const data = await response.json();
        console.log("Set ready status success:", data);
        setTodaysWorkouts(data.data);
      } catch (error) {
        console.error("Error setting status:", error);
      }
    };
    fetchTodaysWorkoutData();
    const intervalId = setInterval(fetchTodaysWorkoutData, 8000);
    return () => clearInterval(intervalId);
  }, [user]);

  useEffect(() => {
    const fetchTodaysCardioData = async () => {
      try {
        const response = await fetch(`/api/CardioRoutine`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user: user,
          }),
        });
        if (!response.ok) {
          throw new Error("Failed to get workouts");
        }
        const data = await response.json();
        console.log("Set ready status success:", data);
        setTodaysCardioWorkouts(data.data);
      } catch (error) {
        console.error("Error setting status:", error);
      }
    };

    fetchTodaysCardioData();
    const intervalId = setInterval(fetchTodaysCardioData, 8000);
    return () => clearInterval(intervalId);
  }, [user]);

  const PostWorkoutData = async () => {
    try {
      const firstSetResponse = await fetch(`/api/addWorkoutRoutine`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user: user,
          activity: newWorkout.activity,
          sets: "1",
          reps: newWorkout.setDetails[0].reps,
          weight: newWorkout.setDetails[0].weight,
          setNumber: 1,
        }),
      });

      if (!firstSetResponse.ok) {
        throw new Error("Failed to add first set");
      }

      const firstSetData = await firstSetResponse.json();
      const aiResponse = firstSetData.aimessage.response;
      setGimmResponse(aiResponse);

      if (newWorkout.setDetails.length > 1) {
        const remainingPromises = newWorkout.setDetails
          .slice(1)
          .map((set, index) => {
            return fetch(`/api/addWorkoutRoutine`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                user: user,
                activity: newWorkout.activity,
                sets: "1",
                reps: set.reps,
                weight: set.weight,
                setNumber: index + 2,
              }),
            });
          });

        await Promise.all(remainingPromises);
      }

      // TODO REMOVE OR MAKE OPTIONAL Display AI response to user
      if (aiResponse) {
        // toast(aiResponse, {
        //   duration: Infinity,
        // });
      }

      // Fetch updated workout data
      const response = await fetch(`/api/WorkoutRoutinestoday`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user: user,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get workouts");
      }

      const data = await response.json();
      setTodaysWorkouts(data.data);
      setShowWorkoutForm(false);

      // Reset form
      setNewWorkout({
        activity: "",
        sets: "",
        setDetails: [],
      });
    } catch (error) {
      console.error("Error setting status:", error);
      toast("Error saving workout");
    }
  };

  const PostCardioWorkouttData = async () => {
    try {
      const totalSeconds: number =
        Number(newCardio.hour) * 3600 +
        Number(newCardio.minute) * 60 +
        Number(newCardio.second);
      const response = await fetch(`/api/addCardioRoutine`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user: user,
          activity: newCardio.activity, //TODO make this a normalised lowercase or uppcase
          time: totalSeconds,
          distance: newCardio.distance,
          speed: newCardio.speed,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to get workouts");
      }
      const data = await response.json();
      console.log("logged Set:", data);
      setTodaysCardioWorkouts(data.data);
      setShowCardioForm(false);
    } catch (error) {
      console.error("Error setting status:", error);
    }
  };

  const logoutclick = async () => {
    await logout();
    navigate({ to: "/" });
  };

  const GoToStatus = () => {
    navigate({
      to: "/savedroutines/$username",
      params: { username: username },
    });
  };

  const GoToProfile = () => {
    navigate({ to: "/stats/$username", params: { username: username } });
  };

  const GoTohistory = () => {
    navigate({
      to: "/previousworkouts/$username",
      params: { username: username },
    });
  };

  return (
    <ProtectedRoute>
      <div className="bg-gradient-to-r from-[#6D51A5] to-[#E4A7C5] home-container flex flex-col items-center min-h-svh bg-gray-100 p-4 overflow-y-auto">
        <Card className="w-[400px]">
          <CardHeader>
            <CollisionTitle username={username} />
          </CardHeader>
          <CardContent>
            <div className="grid items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <motion.div
                  className="flex justify-center w-full"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.982 }}
                >
                  <Button
                    className="flex flex-col space-y-1.5 bg-[#7F96FF] hover:bg-[#320E3B] w-full"
                    onClick={() => setShowWorkoutForm(!showWorkoutForm)}
                  >
                    Add Workout
                  </Button>
                </motion.div>
                <motion.div
                  className="flex justify-center w-full"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    className="flex flex-col space-y-1.5 bg-[#7F96FF] hover:bg-[#320E3B] w-full"
                    onClick={() => setShowCardioForm(!showCardioForm)}
                  >
                    Add Cardio
                  </Button>
                </motion.div>
                <motion.div
                  className="flex justify-center w-full"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.982 }}
                >
                  <Button
                    className="flex flex-col space-y-1.5 bg-[#7F96FF] hover:bg-[#320E3B] w-full"
                    onClick={GoToStatus}
                  >
                    Stats(WIP)
                  </Button>
                </motion.div>
                <motion.div
                  className="flex justify-center w-full"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.982 }}
                >
                  <Button
                    className="flex flex-col space-y-1.5 bg-[#7F96FF] hover:bg-[#320E3B] w-full"
                    onClick={GoToProfile}
                  >
                    Measurements
                  </Button>
                </motion.div>
                <motion.div
                  className="flex justify-center w-full"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.982 }}
                >
                  <Button
                    className="flex flex-col space-y-1.5 bg-[#7F96FF] hover:bg-[#320E3B] w-full"
                    onClick={GoTohistory}
                  >
                    Previous Workouts
                  </Button>
                </motion.div>
              </div>

              {/* Workout Form */}
              <AnimatePresence>
                {showWorkoutForm && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, y: -20 }}
                    animate={{ opacity: 1, height: "auto", y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -20 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="flex flex-col space-y-2 p-2 border rounded">
                      <Label htmlFor="activity">Activity</Label>
                      <div className="relative">
                        <Input
                          id="activity"
                          value={newWorkout.activity}
                          onChange={(e) => {
                            // Your existing onChange logic...
                            setNewWorkout({
                              ...newWorkout,
                              activity: e.target.value,
                            });

                            const input = e.target.value;
                            if (input.length > 0) {
                              const uniqueActivities = new Set<string>();
                              AllWorkouts.forEach((workout) => {
                                if (
                                  workout.activity &&
                                  workout.activity
                                    .toLowerCase()
                                    .includes(input.toLowerCase())
                                ) {
                                  uniqueActivities.add(workout.activity);
                                }
                              });
                              setActivitySuggestions(Array.from(uniqueActivities));
                              setShowSuggestions(true);
                            } else {
                              setActivitySuggestions([]);
                              setShowSuggestions(false);
                            }
                          }}
                          placeholder="e.g., Bench Press"
                          autoComplete="off"
                          onBlur={() => {
                            setTimeout(() => setShowSuggestions(false), 200);
                          }}
                          onFocus={() => {
                            if (newWorkout.activity.length > 0) {
                              setShowSuggestions(true);
                            }
                          }}
                        />

                        {/* Animated Suggestions dropdown */}
                        <AnimatePresence>
                          {showSuggestions && activitySuggestions.length > 0 && (
                            <motion.div
                              initial={{ opacity: 0, y: -10, scale: 0.982 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: -10, scale: 0.982 }}
                              transition={{ duration: 0.2 }}
                              className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto"
                            >
                              <ul className="py-1">
                                {activitySuggestions.map((suggestion, index) => (
                                  <motion.li
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }} // Stagger effect
                                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                                    onClick={() => {
                                      setNewWorkout({
                                        ...newWorkout,
                                        activity: suggestion,
                                      });
                                      setShowSuggestions(false);

                                      const matchingWorkout = AllWorkouts.find(
                                        (w) => w.activity === suggestion
                                      );
                                    }}
                                  >
                                    {suggestion}
                                  </motion.li>
                                ))}
                              </ul>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      <Label htmlFor="sets">Sets</Label>
                      <Input
                        id="sets"
                        value={newWorkout.sets}
                        onChange={(e) => updateSetInputs(e.target.value)}
                        placeholder="e.g., 3"
                        type="number"
                        min="1"
                      />

                      {/* Animated Set Details */}
                      <AnimatePresence>
                        {newWorkout.setDetails.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-4 mt-4 overflow-hidden"
                          >
                            <Label>Set Details</Label>
                            {newWorkout.setDetails.map((set, index) => (
                              <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }} // Stagger each set
                                className="flex space-x-2 p-2 border rounded"
                              >
                                <div className="flex-none w-12 flex items-center justify-center font-bold">
                                  Set {index + 1}
                                </div>
                                <div className="flex-1">
                                  <Label htmlFor={`reps-${index}`} className="text-xs">
                                    Reps
                                  </Label>
                                  <Input
                                    id={`reps-${index}`}
                                    value={set.reps}
                                    onChange={(e) => {
                                      const newSetDetails = [...newWorkout.setDetails];
                                      newSetDetails[index].reps = e.target.value;
                                      setNewWorkout({
                                        ...newWorkout,
                                        setDetails: newSetDetails,
                                      });
                                    }}
                                    placeholder="e.g., 10"
                                  />
                                </div>
                                <div className="flex-1">
                                  <Label htmlFor={`weight-${index}`} className="text-xs">
                                    Weight (Kgs)
                                  </Label>
                                  <Input
                                    id={`weight-${index}`}
                                    value={set.weight}
                                    onChange={(e) => {
                                      const newSetDetails = [...newWorkout.setDetails];
                                      newSetDetails[index].weight = Number(e.target.value);
                                      setNewWorkout({
                                        ...newWorkout,
                                        setDetails: newSetDetails,
                                      });
                                    }}
                                    placeholder="e.g., 135"
                                  />
                                </div>
                              </motion.div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <Button
                        onClick={handleAddWorkout}
                        className="mt-2 bg-[#7F96FF] hover:bg-[#320E3B]"
                      >
                        Save Workout
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Cardio Form */}
              {showCardioForm && (
                <div className="flex flex-col space-y-2 p-2 border rounded">
                  <Label htmlFor="activity">Activity</Label>
                  <Input
                    id="activity"
                    value={newCardio.activity}
                    onChange={(e) =>
                      setNewCardio({ ...newCardio, activity: e.target.value })
                    }
                    placeholder="e.g., Running machine"
                    autoComplete="off"
                  />

                  <Label htmlFor="Time">Time (HH:MM:SS)</Label>
                  <div className="flex items-end gap-4">
                    <div className="space-y-2">
                      <Input
                        id="hour"
                        value={newCardio.hour}
                        onChange={(e) =>
                          setNewCardio({
                            ...newCardio,
                            hour: Number(e.target.value),
                          })
                        }
                        placeholder="e.g., 135"
                      />
                    </div>
                    <div className="space-y-2">
                      <Input
                        id="minute"
                        value={newCardio.minute}
                        onChange={(e) =>
                          setNewCardio({
                            ...newCardio,
                            minute: Number(e.target.value),
                          })
                        }
                        placeholder="e.g., 135"
                      />
                    </div>
                    <div className="space-y-2">
                      <Input
                        id="second"
                        value={newCardio.second}
                        onChange={(e) =>
                          setNewCardio({
                            ...newCardio,
                            second: Number(e.target.value),
                          })
                        }
                        placeholder="e.g., 135"
                      />
                    </div>
                  </div>

                  <Label htmlFor="Distance">Distance (KMs)</Label>
                  <Input
                    id="distance"
                    type="number"
                    step="0.1"
                    min="0"
                    value={newCardio.distance}
                    onChange={(e) =>
                      setNewCardio({
                        ...newCardio,
                        distance: Number(e.target.value),
                      })
                    }
                    placeholder="e.g., 135"
                  />

                  <Label htmlFor="speed">Speed (KPHs)</Label>
                  <Input
                    id="speed"
                    step="0.1"
                    min="0"
                    value={newCardio.speed}
                    onChange={(e) =>
                      setNewCardio({
                        ...newCardio,
                        speed: Number(e.target.value),
                      })
                    }
                    placeholder="e.g., 7.5"
                  />

                  <Button
                    onClick={handleAddCardio}
                    className="mt-2 bg-[#7F96FF] hover:bg-[#320E3B]"
                  >
                    Save Workout
                  </Button>
                </div>
              )}

              <div className="flex flex-col space-y-1.5">
                <Table>
                  <TableBody>
                    {TodaysWorkouts && TodaysWorkouts.length > 0 ? (
                      TodaysWorkouts.map((workout) => (
                        <TableRow key={workout.id}>
                          <TableCell className="text-center">
                            {workout.activity}
                          </TableCell>
                          <TableCell className="text-center">
                            {workout.sets} sets × {workout.reps} reps @{" "}
                            {workout.weight} kgs
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={2} className="text-center">
                          No workouts for today
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              <div className="flex flex-col space-y-1.5">
                <Table>
                  <TableBody>
                    {TodaysCardioWorkouts && TodaysCardioWorkouts.length > 0 ? (
                      TodaysCardioWorkouts.map((workout) => (
                        <TableRow key={workout.id}>
                          <TableCell className="text-center">
                            {workout.activity}
                          </TableCell>
                          <TableCell className="text-center">
                            Time: {formatTime(workout.time)} | Distance:{" "}
                            {workout.distance} kms
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={2} className="text-center">
                          No Cardio Workout for today
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
                {/* TODO this is temp holding for ai prompts */}
                <span className="flex justify-center w-full"> --- </span>
                <span className="flex justify-center w-full">Gim Says</span>
                <span className="flex justify-center w-full">
                  {gimmresponse || "Start Your Workout!"}
                </span>
                <span className="flex justify-center w-full"> --- </span>
                {/* <Textarea placeholder={gimmresponse || "Start Your Workout!"} /> */}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between"></CardFooter>
        </Card>
        <Button className="m-6" variant={"destructive"} onClick={logoutclick}>
          Logout
        </Button>
        < FloatingHelp />
      </div>
    </ProtectedRoute>
  );
}
