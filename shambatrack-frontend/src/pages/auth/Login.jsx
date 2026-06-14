import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { toast } from "react-hot-toast"; // 1. Import toast

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic Validation
    if (!form.username || !form.password) {
      toast.error("Please fill in all fields."); // 2. Catch client-side blanks
      return;
    }

    try {
      setLoading(true);

      const res = await api.post("/login", form);
      const { token, user } = res.data;

      // Persist Session Data
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // 3. Trigger a quick success notification
      toast.success(`Welcome back, ${user.username || "User"}!`);

      // Dynamic Role-Based Redirection
      switch (user.role) {
        case "system_admin":
          navigate("/system-admin/dashboard");
          break;
        case "cooperative":
          navigate("/cooperative/dashboard");
          break;
        case "coop_admin":
          navigate("/cooperative-admin/dashboard");
          break;
        case "farmer":
          navigate("/farmer/dashboard");
          break;
        default:
          toast.error("Access denied: Invalid user role configuration.");
          localStorage.clear();
          break;
      }
    } catch (err) {
      // 4. Send API errors directly into a hot-toast notification
      const errMsg =
        err.response?.data?.message || "Invalid username or password";
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-slate-50 to-emerald-50 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100">
        {/* Header/Branding */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-700 to-emerald-600 tracking-tight mb-2">
            ShambaTrack
          </h1>
          <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">
            Cooperative Management System
          </p>
        </div>

        {/* Form Elements */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              disabled={loading}
              className="w-full border border-slate-200 rounded-xl p-3 text-slate-800 placeholder-slate-400 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-200"
              placeholder="Enter your username"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              disabled={loading}
              className="w-full border border-slate-200 rounded-xl p-3 text-slate-800 placeholder-slate-400 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-200"
              placeholder="••••••••"
            />
          </div>

          {/* Action Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium py-3 px-4 rounded-xl hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-60 disabled:cursor-not-allowed shadow-md hover:shadow-lg active:scale-[0.99] transition duration-150 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>Authenticating...</span>
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
