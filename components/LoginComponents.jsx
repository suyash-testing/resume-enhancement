import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import LoadingComponent from "./LoadingComponent";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        setLoading(false);
        const { error } = await response.json();
        throw new Error(error);
      }

      const { token } = await response.json();
      localStorage.setItem("token", token);
      setError(null);
      setLoading(false);
      router.push("/resume-rewrite");
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-10 rounded-2xl shadow-2xl w-full max-w-lg">
      <p className="text-center text-xl font-semibold mb-6">
        Please log in to your account
      </p>
      <form onSubmit={handleLogin} className="space-y-6">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-semibold text-gray-700"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent sm:text-base"
          />
        </div>
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-semibold text-gray-700"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent sm:text-base"
          />
        </div>
        {error && (
          <div className="text-red-500 text-center text-sm">{error}</div>
        )}
        <Button
          type="submit"
          disabled={loading}
          className={`w-full py-3 mt-4 text-lg font-bold rounded-full transition duration-300 ${
            loading
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-700 text-white"
          } shadow-lg transform hover:scale-105`}
        >
          {loading ? <LoadingComponent /> : "Sign In"}
        </Button>
      </form>
    </div>
  );
}
