"use client";

import * as React from "react";
import { UploadDropzone } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";

type UploadedFile = { url: string; name: string; size?: number };

export function UTFileUploader({
  onChange,
  maxFiles = 5,
  note,
}: {
  onChange: (files: UploadedFile[]) => void;
  maxFiles?: number;
  note?: string;
}) {
  const [files, setFiles] = React.useState<UploadedFile[]>([]);

  return (
    <div>
      <UploadDropzone<OurFileRouter, "projectFileUploader">
        endpoint="projectFileUploader"
        onClientUploadComplete={(res) => {
          const mapped =
            (res || []).map((f) => ({
              url: f.serverData?.url || f.url, // both exist; prefer serverData
              name: f.serverData?.name || f.name,
              size: f.serverData?.size ?? undefined,
            })) as UploadedFile[];
          const merged = [...files, ...mapped].slice(0, maxFiles);
          setFiles(merged);
          onChange(merged);
        }}
        onUploadError={(e) => {
          alert(e.message || "Upload failed");
        }}
        config={{
          // Hints only; the endpoint itself accepts image & pdf per server config
          // accept: {"image/*": [], "application/pdf": []}
        }}
        appearance={{
          container: "ut-upload-dropzone rounded-xl border border-slate-300",
          button:
            "ut-button bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-3 py-2",
        }}
      />

      {files.length > 0 && (
        <ul className="mt-2 space-y-1 text-sm text-slate-700">
          {files.map((f, i) => (
            <li key={`${f.url}-${i}`} className="flex items-center justify-between gap-2">
              <span className="truncate">• {f.name}</span>
              <a
                href={f.url}
                target="_blank"
                rel="noreferrer"
                className="text-emerald-700 underline text-xs"
              >
                preview
              </a>
            </li>
          ))}
        </ul>
      )}
      {note && <div className="mt-1 text-xs text-slate-500">{note}</div>}
    </div>
  );
}
