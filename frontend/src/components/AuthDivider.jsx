export default function AuthDivider() {
  return (
    <div className="relative my-6">
      <div className="absolute inset-0 flex items-center" aria-hidden>
        <div className="w-full border-t border-slate-800" />
      </div>
      <div className="relative flex justify-center text-xs uppercase">
        <span className="bg-slate-950 px-2 text-slate-500">or</span>
      </div>
    </div>
  );
}
