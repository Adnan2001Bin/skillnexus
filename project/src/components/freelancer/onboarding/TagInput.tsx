"use client";
import { useState } from "react";

export default function TagInput({
  values,
  onAdd,
  onRemove,
  placeholder,
  className = "",
}: {
  values: string[];
  onAdd: (v: string) => void;
  onRemove: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  const [val, setVal] = useState("");
  const inputClass =
    "mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 outline-none ring-emerald-500 focus:ring-2";
  return (
    <div className={className}>
      <div className="flex flex-wrap gap-2">
        {values.map((v) => (
          <span
            key={v}
            className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-emerald-800 ring-1 ring-emerald-200"
          >
            {v}
            <button
              type="button"
              onClick={() => onRemove(v)}
              className="text-emerald-700/70 hover:text-emerald-900"
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <input
        className={inputClass}
        placeholder={placeholder}
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            if (val.trim()) onAdd(val.trim());
            setVal("");
          }
        }}
      />
    </div>
  );
}
