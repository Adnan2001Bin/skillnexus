// lib/cloudinaryClient.ts
export type UploadProgressCb = (p: number) => void;

export async function getUploadSignature() {
  const res = await fetch("/api/upload/sign", { method: "POST" });
  if (!res.ok) throw new Error("Could not get signature");
  return res.json() as Promise<{ signature: string; timestamp: number; folder: string }>;
}

export function uploadToCloudinary(
  file: File,
  { onProgress }: { onProgress?: UploadProgressCb } = {}
): Promise<{ secure_url: string; public_id: string }> {
  return new Promise(async (resolve, reject) => {
    try {
      const { signature, timestamp, folder } = await getUploadSignature();

      const form = new FormData();
      form.append("file", file);
      form.append("api_key", process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ? process.env.CLOUDINARY_API_KEY! : "");
      // api_key must be the **key**, not the cloud name:
      form.set("api_key", process.env.CLOUDINARY_API_KEY!);
      form.append("timestamp", String(timestamp));
      form.append("folder", folder);
      // Optional: eager transformations go here (also must be signed)

      const xhr = new XMLHttpRequest();
      xhr.open(
        "POST",
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/auto/upload`
      );

      xhr.upload.onprogress = (evt) => {
        if (evt.lengthComputable && onProgress) {
          onProgress(Math.round((evt.loaded / evt.total) * 100));
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const json = JSON.parse(xhr.responseText);
          resolve({ secure_url: json.secure_url, public_id: json.public_id });
        } else {
          reject(new Error(`Cloudinary upload failed (${xhr.status})`));
        }
      };
      xhr.onerror = () => reject(new Error("Network error during upload"));
      xhr.send(form);
    } catch (err) {
      reject(err);
    }
  });
}
