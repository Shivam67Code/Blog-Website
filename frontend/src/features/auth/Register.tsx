import { useState } from "react";
import { useAuth } from "./AuthContext";
import { useNavigate, Link } from "react-router-dom";
import Loader from "../../components/Loader";

export default function Register() {
  const { register, loading } = useAuth();
  const [fullName, setFullName] = useState(""); // <-- changed
  const [username, setUsername] = useState(""); // <-- added
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [avatar, setAvatar] = useState<File | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("fullName", fullName); // <-- changed
    formData.append("username", username); // <-- added
    formData.append("email", email);
    formData.append("password", password);
    if (avatar) formData.append("avatar", avatar);

    try {
      await register(formData);
      navigate("/");
    } catch {}
  };

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6">Register</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" encType="multipart/form-data">
        <input
          className="border rounded px-3 py-2"
          placeholder="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
        <input
          className="border rounded px-3 py-2"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          className="border rounded px-3 py-2"
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="border rounded px-3 py-2"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          type="file"
          accept="image/*"
          onChange={e => setAvatar(e.target.files?.[0] || null)}
          className="border rounded px-3 py-2"
          required
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
          disabled={loading}
        >
          {loading ? <Loader /> : "Register"}
        </button>
        <Link to="/login" className="text-blue-600 text-sm">
          Already have an account? Login
        </Link>
      </form>
    </div>
  );
}
