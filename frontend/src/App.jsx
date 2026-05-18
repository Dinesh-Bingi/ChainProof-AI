import { Navigate, Route, Routes } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "./context/AuthContext.jsx";
import AppLayout from "./layouts/AppLayout.jsx";
import AuthLayout from "./layouts/AuthLayout.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import HistoryPage from "./pages/HistoryPage.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import ProofDetailPage from "./pages/ProofDetailPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import UploadPage from "./pages/UploadPage.jsx";
import VerifyPage from "./pages/VerifyPage.jsx";

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return (
      <motion.div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#030712]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="h-10 w-10 rounded-xl border-2 border-violet-500/30 border-t-violet-400 shadow-[0_0_24px_rgba(139,92,246,0.4)]"
        />
        <p className="text-sm text-slate-500 tracking-wide">ChainProof AI</p>
      </motion.div>
    );
  }
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/verify" element={<VerifyPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/proofs/:id" element={<ProofDetailPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
