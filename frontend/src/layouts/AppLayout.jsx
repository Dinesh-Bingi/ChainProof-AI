import { useState } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { History, LayoutDashboard, LogOut, Shield, Upload, Search, Menu, X } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import AuroraBackground from "../components/effects/AuroraBackground.jsx";
import PageTransition from "../components/motion/PageTransition.jsx";
import { cn } from "../lib/utils.js";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/upload", label: "Upload", icon: Upload },
  { to: "/verify", label: "Verify", icon: Search },
  { to: "/history", label: "History", icon: History },
];

function NavItem({ to, label, icon: Icon, onClick }) {
  return (
    <NavLink to={to} onClick={onClick} className="block">
      {({ isActive }) => (
        <motion.div
          className={cn(
            "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
            isActive ? "text-white" : "text-slate-400 hover:text-slate-200"
          )}
          whileHover={{ x: 4 }}
        >
          {isActive && (
            <motion.div
              layoutId="nav-active"
              className="absolute inset-0 rounded-xl bg-gradient-to-r from-violet-600/30 to-fuchsia-600/10 border border-violet-500/30 nav-glow-active"
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
            />
          )}
          <Icon className={cn("relative h-4 w-4", isActive && "text-violet-300 drop-shadow-[0_0_8px_rgba(139,92,246,0.8)]")} />
          <span className="relative">{label}</span>
        </motion.div>
      )}
    </NavLink>
  );
}

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex">
      <AuroraBackground />

      <aside className="hidden lg:flex w-[260px] shrink-0 p-4">
        <div className="glass-panel-glow flex w-full flex-col rounded-2xl p-4">
          <div className="flex items-center gap-2 px-2 py-3 mb-4">
            <motion.div className="rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 p-2 shadow-lg shadow-violet-600/30">
              <Shield className="h-5 w-5 text-white" />
            </motion.div>
            <div>
              <p className="font-bold text-white font-[family-name:var(--font-display)]">ChainProof</p>
              <p className="text-[10px] text-violet-400/80 uppercase tracking-widest">AI · Web3</p>
            </div>
          </div>

          <nav className="flex-1 space-y-1">
            {nav.map((item) => (
              <NavItem key={item.to} {...item} />
            ))}
          </nav>

          <div className="mt-4 rounded-xl border border-white/10 bg-slate-950/50 p-3">
            <p className="text-sm font-medium text-slate-200 truncate">{user?.name}</p>
            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            <button
              type="button"
              onClick={handleLogout}
              className="mt-3 flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm text-slate-400 hover:bg-white/5 hover:text-white transition"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 min-w-0 flex flex-col">
        <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3 glass-panel mx-4 mt-4 rounded-xl">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-violet-400" />
            <span className="font-bold">ChainProof</span>
          </div>
          <button type="button" onClick={() => setMobileOpen(!mobileOpen)} className="p-2 text-slate-400">
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </header>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden mx-4 glass-panel rounded-xl p-3 overflow-hidden"
            >
              {nav.map((item) => (
                <NavItem key={item.to} {...item} onClick={() => setMobileOpen(false)} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex-1 px-4 py-6 md:px-8 md:py-8 pb-28 lg:pb-8 max-w-[1400px]">
          <AnimatePresence mode="wait">
            <PageTransition key={location.pathname}>
              <Outlet />
            </PageTransition>
          </AnimatePresence>
        </div>

        <nav className="lg:hidden fixed bottom-4 inset-x-4 z-30 glass-panel-glow rounded-2xl flex justify-around py-2 px-2">
          {nav.map(({ to, icon: Icon }) => (
            <NavLink key={to} to={to} className="flex-1 flex justify-center p-2">
              {({ isActive }) => (
                <Icon
                  className={cn(
                    "h-5 w-5 transition",
                    isActive ? "text-violet-400 drop-shadow-[0_0_8px_rgba(139,92,246,0.9)]" : "text-slate-500"
                  )}
                />
              )}
            </NavLink>
          ))}
        </nav>
      </main>
    </div>
  );
}
