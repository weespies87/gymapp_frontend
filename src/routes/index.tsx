import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dumbbell } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/auth/AuthContext";

export const Route = createFileRoute("/")({
  component: App,
});

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState("");

  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    resetError,
  } = useAuth();
  const navigate = useNavigate();

  // Redirect authenticated users to home page
  useEffect(() => {
    if (isAuthenticated && !isLoading && user) {
      // Add user check
      navigate({
        to: "/home/$username",
        params: {
          username: user.username || "user", // Add fallback
        },
      });
    }
  }, [isAuthenticated, isLoading, navigate, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isRegistering) {
      await register(email, password, name);
    } else {
      await login(email, password);
    }
  };

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    resetError();
  };

  if (isLoading) {
    return (
      <div className="bg-gradient-to-r from-[#6D51A5] to-[#E4A7C5] flex justify-center items-center h-svh">
        <Card className="w-[350px] text-center p-6">
          <CardContent>
            <p>Loading...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-[#6D51A5] to-[#E4A7C5] home-container flex flex-col justify-center items-center h-svh bg-gray-100">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle className="flex justify-center">
            {isRegistering ? "Create an Account" : "Welcome to the Gym"}{" "}
            <Dumbbell className="ml-2" />
          </CardTitle>
          {error && (
            <CardDescription className="text-red-500 mt-2">
              {error}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit}
            className="grid w-full items-center gap-4"
          >
            {isRegistering && (
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="name">Name</Label>
                <Input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                />
              </div>
            )}

            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
              />
            </div>

            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
              />
            </div>

            <Button
              type="submit"
              className="bg-[#7F96FF] hover:bg-[#320E3B]"
              disabled={isLoading}
            >
              {isLoading ? "Loading..." : isRegistering ? "Sign Up" : "Login"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          {/* <Button variant="link" onClick={toggleMode} className="text-sm">
            {isRegistering
              ? "Already have an account? Login"
              : "Don't have an account? Sign Up"}
          </Button> */}
        </CardFooter>
      </Card>
    </div>
  );
}
