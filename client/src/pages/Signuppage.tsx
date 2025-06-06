import { useState, ChangeEvent, FormEvent } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { signup } from "../features/auth/authThunk";
import { Loader2 } from "lucide-react";
import { useNavigate, Link } from "react-router"; // Import Link from react-router-dom

// Shadcn UI components
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

type FormData = {
  email: string;
  password: string;
  confirmPassword: string;
};

function Signuppage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const loading = useAppSelector((state) => state.auth.loading);
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    const resultAction = await dispatch(
      signup({
        email: formData.email,
        password: formData.password,
      })
    );

    // Check if the signup was successful based on the thunk's return value
    if (signup.fulfilled.match(resultAction)) {
      toast.success("Signed up successfully");
      navigate("/login");
    } else {
      // Handle potential errors from the thunk (if your thunk rejects with an error)
      // You might need to adjust this based on how your signup thunk handles errors
      toast.error("Signup failed. Please try again.");
      console.error("Signup error:", resultAction.error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl text-center font-newsreader">
            Sign Up
          </CardTitle>
          <CardDescription className="text-center">
            Enter your details to create an account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="m@example.com"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Sign up
              </Button>
            </div>
          </form>
          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link to="/login" className="underline">
              Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default Signuppage;
