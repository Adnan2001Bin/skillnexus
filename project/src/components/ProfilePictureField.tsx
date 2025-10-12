"use client";

import { useState, useRef } from "react";

type Props = {
  label?: string;
  value: string;                 // current URL
  onChange: (url: string) => void;
};

export function ProfilePictureField({ label = "Profile Picture", value, onChange }: Props) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const uploadToCloudinary = async (file: File) => {
    setIsUploading(true);
    setError(null);
    try {
      const sigRes = await fetch("/api/cloudinary-signature", { method: "POST" });
      const sigJson = await sigRes.json();
      if (!sigRes.ok) throw new Error(sigJson?.error || "Signature failed");

      const fd = new FormData();
      fd.append("file", file);
      fd.append("api_key", process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY!);
      fd.append("timestamp", String(sigJson.timestamp));
      fd.append("signature", sigJson.signature);
      fd.append("folder", sigJson.folder);

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
    // capture the input before any await
    const inputEl = ev.currentTarget;
    const file = inputEl.files?.[0];
    if (!file) return;

    // optional guards
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      inputEl.value = "";
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Max file size is 5MB.");
      inputEl.value = "";
      return;
    }

    const url = await uploadToCloudinary(file);
    if (url) onChange(url);

    // reset safely using the saved ref
    inputEl.value = "";
  };

  return (
    <div className="grid gap-1">
      <label className="text-sm font-medium text-slate-700">{label}</label>

      {value ? (
        <img
          src={value}
          alt="Profile preview"
          className="h-20 w-20 rounded-full object-cover ring-1 ring-slate-200"
        />
      ) : (
        <div className="h-20 w-20 rounded-full bg-slate-100 ring-1 ring-slate-200" />
      )}

      <input
        ref={inputRef}
        id="profilePictureUpload"
        type="file"
        accept="image/*"
        className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-emerald-600 file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-emerald-700"
        disabled={isUploading}
        onChange={handleFileChange}
      />

      {isUploading && <p className="text-xs text-slate-500">Uploading…</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
