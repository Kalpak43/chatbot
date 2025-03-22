import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { signin } from "../features/auth/authThunk";
import { Link, useNavigate } from "react-router";
import { Loader2 } from "lucide-react";
// import { GoogleLogin, GoogleLoginResponse } from "react-google-login";

const API_URL = import.meta.env.VITE_API_URL;

const Loginpage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const { user, loading } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (user) navigate("/");
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Login attempted with:", { email, password });
    // Add your authentication logic here
    await dispatch(
      signin({
        email,
        password,
      })
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="card w-96 bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl font-bold text-center">Login</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Email</span>
              </label>
              <input
                type="email"
                placeholder="admin@example.com"
                className="input input-bordered w-full"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Password</span>
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="input input-bordered w-full"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-control mt-6">
              <button
                type="submit"
                className="btn btn-primary w-full"
                disabled={loading}
              >
                {loading ? <Loader2 className="animate-spin" /> : "Log in"}
              </button>
            </div>
          </form>
          <div className="divider">OR</div>
          <button
            className="btn bg-white text-black border-[#e5e5e5]"
            onClick={() => {
              window.location.href = `${API_URL}/api/auth/google?redirect=${
                window.location.origin + "/"
              }`;
            }}
            disabled={loading}
          >
            <svg
              aria-label="Google logo"
              width="16"
              height="16"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 512 512"
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
          </button>
          {/* <div className="text-center mt-4">
            <a href="#" className="text-sm text-primary hover:underline">
              Forgot password?
            </a>
          </div> */}
          <div className="text-center mt-4">
            <span className="text-sm">Don't have an account? </span>
            <Link to="/signup" className="text-sm text-primary hover:underline">
              Sign up here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Loginpage;
