"use client";

export default function SocialLinksEditor({
  values,
  onChange,
}: {
  values: { platform: string; url: string }[];
  onChange: (v: { platform: string; url: string }[]) => void;
}) {
  const inputClass =
    "rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 outline-none ring-emerald-500 focus:ring-2";
  const add = () => onChange([...(values || []), { platform: "", url: "" }]);
  const update = (
    i: number,
    patch: Partial<{ platform: string; url: string }>
  ) => onChange(values.map((v, idx) => (idx === i ? { ...v, ...patch } : v)));
  const remove = (i: number) => onChange(values.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={add}
        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-700 hover:bg-slate-50"
      >
        + Add link
      </button>
      {(values || []).map((v, i) => (
        <div key={i} className="grid gap-2 md:grid-cols-2">
          <input
            className={inputClass}
            placeholder="Platform (e.g., GitHub, Dribbble)"
            value={v.platform}
            onChange={(e) => update(i, { platform: e.target.value })}
          />
          <input
            className={inputClass}
            placeholder="https://..."
            value={v.url}
            onChange={(e) => update(i, { url: e.target.value })}
          />
          <div className="md:col-span-2 text-right">
            <button
              type="button"
              onClick={() => remove(i)}
              className="text-sm text-red-600 hover:underline"
            >
              Remove
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
