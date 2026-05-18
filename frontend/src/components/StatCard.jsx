export default function StatCard({ label, value, icon: Icon, accent = "brand" }) {
  const accents = {
    brand: "from-brand-600/20 to-brand-600/5 text-brand-400",
    emerald: "from-emerald-600/20 to-emerald-600/5 text-emerald-400",
    amber: "from-amber-600/20 to-amber-600/5 text-amber-400",
  };
  return (
    <div className="rounded-xl border border-slate-800 bg-gradient-to-br p-5">
      <div className={`mb-3 inline-flex rounded-lg bg-gradient-to-br p-2.5 ${accents[accent]}`}>
        {Icon && <Icon className="h-5 w-5" />}
      </div>
      <p className="text-2xl font-bold text-slate-50">{value}</p>
      <p className="mt-1 text-sm text-slate-400">{label}</p>
    </div>
  );
}
