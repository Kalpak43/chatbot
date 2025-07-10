import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { signin, signinWithGoogle } from "../features/auth/authThunk";
import { Link, useNavigate } from "react-router"; // Changed import for Link
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button"; // Assuming shadcn button component
import { Input } from "@/components/ui/input"; // Assuming shadcn input component
import { Label } from "@/components/ui/label"; // Assuming shadcn label component
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"; // Assuming shadcn card components

const Loginpage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const { user, loading } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]); // Added navigate to dependency array

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Login attempted with:", { email, password });
    await dispatch(
      signin({
        email,
        password,
      })
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      {" "}
      {/* Added background color */}
      <Card className="w-96">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold font-newsreader">
            Login
          </CardTitle>
          <CardDescription className="text-center">
            Enter your email and password to access your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}{" "}
              {/* Added margin to icon */}
              Log in
            </Button>
          </form>
          <div className="relative my-6">
            {" "}
            {/* Added margin */}
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              dispatch(signinWithGoogle());
            }}
            disabled={loading}
          >
            <svg
              aria-label="Google logo"
              width="16"
              height="16"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 512 512"
              className="mr-2" // Added margin
            >
              <g>
                <path d="m0 0H512V512H0" fill="#fff"></path>
                <path
                  fill="#34a853"
                  d="M153 292c30 82 118 95 171 60h62v48A192 192 0 0190 341"
                ></path>
                <path
                  fill="#4285f4"
                  d="m386 400a140 175 0 0053-179H260v74h102q-7 37-38 57"
                ></path>
                <path
                  fill="#fbbc02"
                  d="m90 341a208 200 0 010-171l63 49q-12 37 0 73"
                ></path>
                <path
                  fill="#ea4335"
                  d="m153 219c22-69 116-109 179-50l55-54c-78-75-230-72-297 55"
                ></path>
              </g>
            </svg>
            Login with Google
          </Button>
        </CardContent>
        <CardFooter className="flex justify-center text-sm text-muted-foreground">
          {" "}
          {/* Added justify-center */}
          Don't have an account?{" "}
          <Link to="/signup" className="underline ml-1">
            {" "}
            {/* Added margin */}
            Sign up here
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Loginpage;
