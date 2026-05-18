import { useEffect, useState } from "react";

export default function AnimatedCounter({ value, suffix = "", className = "" }) {
  const target = typeof value === "number" ? value : parseFloat(String(value)) || 0;
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let frame;
    const start = performance.now();
    const duration = 900;
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - (1 - p) ** 3;
      setDisplay(Math.round(target * eased));
      if (p < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target]);

  return (
    <span className={className}>
      {display}
      {suffix}
    </span>
  );
}
