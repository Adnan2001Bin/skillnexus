// components/PortfolioImageField.tsx
"use client";

import { useRef, useState } from "react";

type Props = {
  label?: string;
  value?: string;                 // current image URL (can be empty)
  onChange: (url: string) => void;
  onClear?: () => void;           // optional remove image handler
  size?: number;                  // preview size (square)
};

export default function PortfolioImageField({
  label = "Image",
  value,
  onChange,
  onClear,
  size = 88,
}: Props) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const uploadToCloudinary = async (file: File) => {
    setIsUploading(true);
    setError(null);
    try {
      // get signed payload from your API
      const sigRes = await fetch("/api/cloudinary-signature", { method: "POST" });
      const sigJson = await sigRes.json();
      if (!sigRes.ok) throw new Error(sigJson?.error || "Signature failed");

      const fd = new FormData();
      fd.append("file", file);
      fd.append("api_key", process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY as string);
      fd.append("timestamp", String(sigJson.timestamp));
      fd.append("signature", sigJson.signature);
      if (sigJson.folder) fd.append("folder", sigJson.folder);

      const cloudRes = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: "POST", body: fd }
      );
      const cloudJson = await cloudRes.json();
      if (!cloudRes.ok) throw new Error(cloudJson?.error?.message || "Upload failed");

      return cloudJson.secure_url as string;
    } catch (e: any) {
      setError(e.message || "Upload failed");
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = async (ev: React.ChangeEvent<HTMLInputElement>) => {
    const inputEl = ev.currentTarget;
    const file = inputEl.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      inputEl.value = "";
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setError("Max file size is 8MB.");
      inputEl.value = "";
      return;
    }

    const url = await uploadToCloudinary(file);
    if (url) onChange(url);
    inputEl.value = "";
  };

  return (
    <div className="grid gap-1">
      <label className="text-sm font-medium text-slate-700">{label}</label>

      <div className="flex items-center gap-3">
        <div
          className="overflow-hidden rounded-lg ring-1 ring-slate-200 bg-slate-50"
          style={{ width: size, height: size }}
        >
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="Portfolio preview" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
              No image
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={isUploading}
            className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-600 file:px-3 file:py-2 file:font-semibold file:text-white hover:file:bg-emerald-700"
          />
          {value && onClear && (
            <button
              type="button"
              onClick={onClear}
              className="text-xs text-red-600 hover:underline self-start"
            >
              Remove image
            </button>
          )}
        </div>
      </div>

      {isUploading && <p className="text-xs text-slate-500">Uploading…</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
