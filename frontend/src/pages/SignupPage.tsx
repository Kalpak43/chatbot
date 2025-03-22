import { useState, ChangeEvent, FormEvent } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { signup } from "../features/auth/authThunk";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router";
import { useToast } from "../hooks/useToast";

type FormData = {
  email: string;
  password: string;
  confirmPassword: string;
};

function SignupPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { loading } = useAppSelector((state) => state.auth);
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
      alert("Passwords do not match!");
      return;
    }

    await dispatch(
      signup({
        email: formData.email,
        password: formData.password,
      })
    );

    showToast("Signed up Successfully", "success");
    navigate("/login");
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="card w-96 shadow-xl p-6">
        <h2 className="text-2xl font-bold text-center mb-4">Sign Up</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text">Email</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className="input input-bordered"
              required
            />
          </div>

          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text">Password</span>
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className="input input-bordered"
              required
            />
          </div>

          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text">Confirm Password</span>
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              className="input input-bordered"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary w-full mt-2">
            {loading ? <Loader2 className="animate-spin" /> : "Sign up"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default SignupPage;
