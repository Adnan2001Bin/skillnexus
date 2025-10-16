"use client";

import { JSX, useId, useMemo, useState } from "react";
import { Plus, Trash2, ArrowUp, ArrowDown, Type, FileUp, ListChecks, AlignLeft, Info } from "lucide-react";
import { RequirementQuestion,RequirementType } from "../../../../types/next-auth";

const inputBase =
  "rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none ring-emerald-500 focus:ring-2";

const TYPES: { key: RequirementType; label: string; icon: JSX.Element }[] = [
  { key: "instructions", label: "Instructions box", icon: <Info className="h-4 w-4" /> },
  { key: "text",         label: "Short text",      icon: <Type className="h-4 w-4" /> },
  { key: "textarea",     label: "Long text",       icon: <AlignLeft className="h-4 w-4" /> },
  { key: "multiple",     label: "Multiple choice", icon: <ListChecks className="h-4 w-4" /> },
  { key: "file",         label: "File upload",     icon: <FileUp className="h-4 w-4" /> },
];

function newQuestion(t: RequirementType): RequirementQuestion {
  return {
    id: crypto.randomUUID(),
    type: t,
    label:
      t === "instructions"
        ? "Describe your project in detail."
        : t === "text"
        ? "What’s your website URL?"
        : t === "textarea"
        ? "What kind of vibe do you want for the video?"
        : t === "multiple"
        ? "Choose your video style:"
        : "Upload your logo, script, or reference images.",
    helpText:
      t === "multiple" ? "Pick one or multiple options." : undefined,
    required: t !== "instructions",
    options: t === "multiple" ? ["Cinematic", "Vlog", "Corporate"] : undefined,
    multiSelect: t === "multiple" ? false : undefined,
    maxFiles: t === "file" ? 3 : undefined,
    acceptTypes: t === "file" ? ["image/png", "image/jpeg", "application/pdf"] : undefined,
  };
}

export default function RequirementBuilder({
  value,
  onChange,
}: {
  value: RequirementQuestion[];
  onChange: (q: RequirementQuestion[]) => void;
}) {
  const add = (t: RequirementType) => onChange([...(value || []), newQuestion(t)]);
  const update = (id: string, patch: Partial<RequirementQuestion>) =>
    onChange(value.map((q) => (q.id === id ? { ...q, ...patch } : q)));
  const remove = (id: string) => onChange(value.filter((q) => q.id !== id));
  const move = (id: string, dir: -1 | 1) => {
    const idx = value.findIndex((q) => q.id === id);
    if (idx < 0) return;
    const j = idx + dir;
    if (j < 0 || j >= value.length) return;
    const arr = value.slice();
    const [it] = arr.splice(idx, 1);
    arr.splice(j, 0, it);
    onChange(arr);
  };

  return (
    <div className="space-y-4">
      {/* Add toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-slate-700">Add question:</span>
        {TYPES.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => add(t.key)}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* List */}
      {(value || []).length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">
          No requirements yet. Add instructions, text questions, multiple choice, or file uploads.
        </div>
      ) : (
        <div className="space-y-3">
          {value.map((q, idx) => (
            <div key={q.id} className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <span className="rounded bg-emerald-50 px-2 py-0.5 text-emerald-700 ring-1 ring-emerald-200">
                    {idx + 1}
                  </span>
                  <span className="text-slate-700 capitalize">{q.type}</span>
                </div>
                <div className="flex items-center gap-1">
                  <IconButton onClick={() => move(q.id, -1)} disabled={idx === 0}>
                    <ArrowUp className="h-4 w-4" />
                  </IconButton>
                  <IconButton onClick={() => move(q.id, 1)} disabled={idx === value.length - 1}>
                    <ArrowDown className="h-4 w-4" />
                  </IconButton>
                  <IconButton onClick={() => remove(q.id)} intent="danger">
                    <Trash2 className="h-4 w-4" />
                  </IconButton>
                </div>
              </div>

              {/* Common fields */}
              <label className="text-xs font-medium text-slate-700">Question / Label</label>
              <input
                className={`${inputBase} mt-1`}
                value={q.label}
                onChange={(e) => update(q.id, { label: e.target.value })}
                placeholder="Type your question or instruction…"
              />

              <label className="mt-3 block text-xs font-medium text-slate-700">Help text (optional)</label>
              <input
                className={`${inputBase} mt-1`}
                value={q.helpText || ""}
                onChange={(e) => update(q.id, { helpText: e.target.value })}
                placeholder="Add a short hint for the buyer…"
              />

              {/* Type-specific config */}
              {q.type === "multiple" && (
                <div className="mt-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-slate-700">Options</label>
                    <label className="flex items-center gap-2 text-xs text-slate-600">
                      <input
                        type="checkbox"
                        checked={!!q.multiSelect}
                        onChange={(e) => update(q.id, { multiSelect: e.target.checked })}
                      />
                      Allow multi-select
                    </label>
                  </div>
                  <OptionEditor
                    values={q.options || []}
                    onChange={(values) => update(q.id, { options: values })}
                  />
                </div>
              )}

              {q.type === "file" && (
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <div>
                    <label className="text-xs font-medium text-slate-700">Max files</label>
                    <input
                      type="number"
                      min={1}
                      className={`${inputBase} mt-1`}
                      value={q.maxFiles || 1}
                      onChange={(e) => update(q.id, { maxFiles: Math.max(1, Number(e.target.value || 1)) })}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-700">Accepted types (comma separated)</label>
                    <input
                      className={`${inputBase} mt-1`}
                      placeholder="image/png,image/jpeg,application/pdf"
                      value={(q.acceptTypes || []).join(",")}
                      onChange={(e) => update(q.id, {
                        acceptTypes: e.target.value
                          .split(",")
                          .map(s => s.trim())
                          .filter(Boolean)
                      })}
                    />
                  </div>
                </div>
              )}

              {q.type !== "instructions" && (
                <label className="mt-3 inline-flex items-center gap-2 text-xs text-slate-700">
                  <input
                    type="checkbox"
                    checked={!!q.required}
                    onChange={(e) => update(q.id, { required: e.target.checked })}
                  />
                  Required
                </label>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function OptionEditor({
  values,
  onChange,
}: {
  values: string[];
  onChange: (v: string[]) => void;
}) {
  const [val, setVal] = useState("");
  const add = () => {
    const v = val.trim();
    if (!v) return;
    onChange(Array.from(new Set([...(values || []), v])));
    setVal("");
  };
  const remove = (s: string) => onChange(values.filter((x) => x !== s));

  return (
    <div>
      <div className="mt-1 flex flex-wrap gap-2">
        {(values || []).map((s) => (
          <span key={s} className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs text-emerald-800 ring-1 ring-emerald-200">
            {s}
            <button type="button" onClick={() => remove(s)} className="text-emerald-700/70 hover:text-emerald-900">×</button>
          </span>
        ))}
      </div>
      <div className="mt-2 flex gap-2">
        <input
          className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-emerald-500 focus:ring-2"
          placeholder="Add option and press Enter"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
        />
        <button type="button" onClick={add} className="rounded-lg bg-emerald-600 px-3 text-sm font-medium text-white hover:bg-emerald-700">
          Add
        </button>
      </div>
    </div>
  );
}

function IconButton({
  children,
  onClick,
  disabled,
  intent,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  intent?: "danger" | "default";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={[
        "grid h-8 w-8 place-items-center rounded-lg border text-slate-600 transition",
        intent === "danger"
          ? "border-red-200 bg-white hover:bg-red-50 text-red-600"
          : "border-slate-200 bg-white hover:bg-slate-50",
        disabled ? "opacity-40" : "",
      ].join(" ")}
    >
      {children}
    </button>
  );
}
