import { useState } from "react";
import { useAuth } from "./AuthContext";
import { useNavigate, useLocation, Link } from "react-router-dom";
import Loader from "../../components/Loader";

export default function Login() {
  const { login, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginMethod, setLoginMethod] = useState<"email" | "username">("email");
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || "/";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const credentials = loginMethod === "email"
        ? { email, password }
        : { username, password };
      await login(credentials);
      navigate(from, { replace: true });
    } catch { }
  };

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6">Login</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex gap-2 mb-2">
          <button
            type="button"
            onClick={() => setLoginMethod("email")}
            className={`px-3 py-1 rounded text-sm ${loginMethod === "email"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700"
              }`}
          >
            Email
          </button>
          <button
            type="button"
            onClick={() => setLoginMethod("username")}
            className={`px-3 py-1 rounded text-sm ${loginMethod === "username"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700"
              }`}
          >
            Username
          </button>
        </div>

        {loginMethod === "email" ? (
          <input
            className="border rounded px-3 py-2"
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        ) : (
          <input
            className="border rounded px-3 py-2"
            placeholder="Username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        )}

        <input
          className="border rounded px-3 py-2"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
          disabled={loading}
        >
          {loading ? <Loader /> : "Login"}
        </button>
        <Link to="/forgot-password" className="text-blue-600 text-sm">
          Forgot password?
        </Link>
        <Link to="/register" className="text-blue-600 text-sm">
          Don't have an account? Register
        </Link>
      </form>
    </div>
  );
}