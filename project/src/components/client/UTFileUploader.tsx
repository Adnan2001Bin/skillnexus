"use client";

import * as React from "react";
import { UploadDropzone } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";
import { X, Trash2, Eye } from "lucide-react";

export type UploadedFile = { url: string; name: string; size?: number };

type Props = {
  /** Current files (controlled). If omitted, component manages its own state. */
  value?: UploadedFile[];
  /** Fired with the latest list every time files change. */
  onChange: (files: UploadedFile[]) => void;
  /** Max number of files user can keep. */
  maxFiles?: number;
  /** Small helper note below the list. */
  note?: string;
  /** Disable all interactions (used during submit/spinner). */
  disabled?: boolean;
  /** Optional accept labels for the small helper line (UI only; server enforces real rules). */
  acceptNote?: string;
  /** If true, hides the dropzone once maxFiles is reached. */
  hideDropzoneAtMax?: boolean;
};

export function UTFileUploader({
  value,
  onChange,
  maxFiles = 5,
  note,
  disabled = false,
  acceptNote,
  hideDropzoneAtMax = true,
}: Props) {
  // If parent passes `value`, use it as controlled; otherwise manage internally.
  const isControlled = Array.isArray(value);
  const [files, setFiles] = React.useState<UploadedFile[]>(value ?? []);

  React.useEffect(() => {
    if (isControlled) setFiles(value || []);
  }, [isControlled, value]);

  const setAndNotify = (next: UploadedFile[]) => {
    // dedupe by url
    const uniqueByUrl = Array.from(new Map(next.map((f) => [f.url, f])).values());
    const clipped = uniqueByUrl.slice(0, maxFiles);
    if (!isControlled) setFiles(clipped);
    onChange(clipped);
  };

  const atMax = files.length >= maxFiles;

  const onClientUploadComplete = (res: any[]) => {
    const mapped =
      (res || []).map((f) => ({
        url: f?.serverData?.url || f?.url,
        name: f?.serverData?.name || f?.name,
        size: f?.serverData?.size ?? undefined,
      })) as UploadedFile[];
    setAndNotify([...files, ...mapped]);
  };

  const removeAt = (idx: number) => {
    const next = files.filter((_, i) => i !== idx);
    setAndNotify(next);
  };

  const clearAll = () => setAndNotify([]);

  return (
    <div className="w-full">
      {/* Dropzone */}
      {!disabled && (!atMax || !hideDropzoneAtMax) && (
        <UploadDropzone<OurFileRouter, "projectFileUploader">
          endpoint="projectFileUploader"
          onClientUploadComplete={onClientUploadComplete}
          onUploadError={(e) => {
            alert(e?.message || "Upload failed");
          }}
          appearance={{
            container:
              "ut-upload-dropzone rounded-xl border border-slate-300 bg-white " +
              (disabled ? "opacity-50 pointer-events-none" : ""),
            button:
              "ut-button bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-3 py-2",
            label: "text-slate-700",
          }}
          config={{
            // UI-only hint. Real accept rules should be in your server endpoint.
            // accept: {"image/*": [], "application/pdf": []}
          }}
        />
      )}

      {/* Count / helper */}
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
        <div>
          {acceptNote ? `${acceptNote} • ` : ""}
          {note ?? ""}
        </div>
        <div className="ml-auto">
          {files.length}/{maxFiles} file{maxFiles === 1 ? "" : "s"}
        </div>
      </div>

      {/* List */}
      {files.length > 0 && (
        <ul className="mt-2 space-y-1 text-sm text-slate-800">
          {files.map((f, i) => (
            <li
              key={`${f.url}-${i}`}
              className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 px-2 py-1.5"
            >
              <div className="min-w-0 truncate">
                • {f.name}
                {typeof f.size === "number" && (
                  <span className="ml-2 text-xs text-slate-500">
                    {Math.round(f.size / 1024)} KB
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <a
                  href={f.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-xs hover:bg-slate-50"
                >
                  <Eye className="h-3.5 w-3.5" />
                  Preview
                </a>
                {!disabled && (
                  <button
                    type="button"
                    onClick={() => removeAt(i)}
                    className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-xs hover:bg-slate-50 text-slate-600"
                    aria-label={`Remove ${f.name}`}
                    title="Remove"
                  >
                    <X className="h-3.5 w-3.5" />
                    Remove
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Clear all */}
      {files.length > 0 && !disabled && (
        <div className="mt-2 flex justify-end">
          <button
            type="button"
            onClick={clearAll}
            className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-600 hover:bg-slate-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}
