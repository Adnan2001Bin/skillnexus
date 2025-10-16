"use client";

export default function ServiceMultiSelect({
  options,
  values,
  onToggle,
}: {
  options: string[];
  values: string[];
  onToggle: (service: string) => void;
}) {
  if (!options?.length) return null;
  return (
    <div className="rounded-xl border border-slate-200 p-3">
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const active = values.includes(opt);
          return (
            <button
              type="button"
              key={opt}
              onClick={() => onToggle(opt)}
              className={`rounded-full px-3 py-1 text-sm ring-1 transition
                ${
                  active
                    ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                    : "bg-white text-slate-700 ring-slate-200 hover:bg-slate-50"
                }`}
              title={opt}
            >
              <span className="line-clamp-1">{opt}</span>
            </button>
          );
        })}
      </div>
      {values.length > 0 && (
        <div className="mt-2 text-xs text-slate-500">
          Selected:{" "}
          <span className="font-medium text-slate-700">{values.length}</span>
        </div>
      )}
    </div>
  );
}
