import { useCallback, useState } from "react";
import { motion } from "framer-motion";
import { FileUp, Sparkles } from "lucide-react";
import { cn } from "../../lib/utils.js";

export default function UploadDropzone({ file, onFileSelect, disabled }) {
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragOver(false);
      if (disabled) return;
      const dropped = e.dataTransfer.files?.[0];
      if (dropped) onFileSelect(dropped);
    },
    [disabled, onFileSelect]
  );

  return (
    <motion.label
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      animate={{
        borderColor: dragOver ? "rgba(139, 92, 246, 0.8)" : "rgba(255,255,255,0.1)",
        boxShadow: dragOver ? "0 0 40px rgba(139, 92, 246, 0.25)" : "0 0 0 rgba(0,0,0,0)",
      }}
      className={cn(
        "relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-12 text-center transition-colors",
        "bg-gradient-to-b from-violet-950/30 to-slate-950/50",
        disabled && "pointer-events-none opacity-50"
      )}
    >
      <input
        type="file"
        className="sr-only"
        accept=".pdf,.txt,.md,.json,.png,.jpg,.jpeg,.webp"
        disabled={disabled}
        onChange={(e) => onFileSelect(e.target.files?.[0] || null)}
      />
      <motion.div
        animate={{ y: dragOver ? -4 : 0 }}
        className="mb-4 rounded-2xl bg-gradient-to-br from-violet-600/30 to-fuchsia-600/20 p-4 border border-violet-500/30"
      >
        {file ? <Sparkles className="h-8 w-8 text-violet-300" /> : <FileUp className="h-8 w-8 text-violet-300" />}
      </motion.div>
      {file ? (
        <>
          <p className="font-semibold text-white">{file.name}</p>
          <p className="mt-1 text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB · Click to replace</p>
        </>
      ) : (
        <>
          <p className="font-semibold text-white">Drop your file here</p>
          <p className="mt-1 text-sm text-slate-500">PDF, images, text — hashed & anchored on-chain</p>
        </>
      )}
    </motion.label>
  );
}
