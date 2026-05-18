import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import AuthDivider from "../components/AuthDivider.jsx";
import GoogleSignInButton from "../components/GoogleSignInButton.jsx";
import Button from "../components/ui/Button.jsx";
import Input from "../components/ui/Input.jsx";
import { getAuthErrorMessage } from "../utils/authError.js";

export default function LoginPage() {
  const { login, loginWithGoogle, firebaseEnabled } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(getAuthErrorMessage(err, "Login failed"));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError("");
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
      navigate("/dashboard");
    } catch (err) {
      setError(getAuthErrorMessage(err, "Google sign-in failed"));
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold gradient-text font-[family-name:var(--font-display)]">Welcome back</h2>
      <p className="mt-1 text-slate-400 text-sm">Sign in to your ChainProof account</p>

      {firebaseEnabled && (
        <>
          <div className="mt-8">
            <GoogleSignInButton onClick={handleGoogle} loading={googleLoading} />
          </div>
          <AuthDivider />
        </>
      )}

      <form onSubmit={handleSubmit} className={firebaseEnabled ? "space-y-4" : "mt-8 space-y-4"}>
        <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <Button type="submit" className="w-full" loading={loading}>
          Sign in
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-400">
        No account?{" "}
        <Link to="/register" className="text-brand-400 hover:underline">
          Register
        </Link>
      </p>
    </div>
  );
}
