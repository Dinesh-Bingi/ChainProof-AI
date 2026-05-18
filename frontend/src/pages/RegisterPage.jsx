import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import AuthDivider from "../components/AuthDivider.jsx";
import GoogleSignInButton from "../components/GoogleSignInButton.jsx";
import Button from "../components/ui/Button.jsx";
import Input from "../components/ui/Input.jsx";
import { getAuthErrorMessage } from "../utils/authError.js";

export default function RegisterPage() {
  const { register, loginWithGoogle, firebaseEnabled } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      navigate("/dashboard");
    } catch (err) {
      setError(getAuthErrorMessage(err, "Registration failed"));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError("");
    setGoogleLoading(true);
    try {
      await loginWithGoogle(form.name || undefined);
      navigate("/dashboard");
    } catch (err) {
      setError(getAuthErrorMessage(err, "Google sign-up failed"));
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold gradient-text font-[family-name:var(--font-display)]">Create account</h2>
      <p className="mt-1 text-slate-400 text-sm">Start protecting your intellectual property</p>

      {firebaseEnabled && (
        <>
          <div className="mt-8">
            <GoogleSignInButton onClick={handleGoogle} loading={googleLoading} label="Sign up with Google" />
          </div>
          <AuthDivider />
        </>
      )}

      <form onSubmit={handleSubmit} className={firebaseEnabled ? "space-y-4" : "mt-8 space-y-4"}>
        <Input
          label="Full name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <Input
          label="Email"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <Input
          label="Password"
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          minLength={8}
          required
        />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <Button type="submit" className="w-full" loading={loading}>
          Create account
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-400">
        Already have an account?{" "}
        <Link to="/login" className="text-brand-400 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
