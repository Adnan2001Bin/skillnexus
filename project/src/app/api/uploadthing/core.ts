// server-only
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

const f = createUploadthing();

/**
 * One endpoint that allows both images and pdfs.
 * (You can add "blob"/'video' etc if you want more)
 */
export const ourFileRouter = {
  projectFileUploader: f({
    image: { maxFileSize: "4MB", maxFileCount: 5 },
    pdf: { maxFileSize: "8MB", maxFileCount: 5 },
  })
    .middleware(async () => {
      const session = await getServerSession(authOptions);
      if (!session || !session.user?._id) {
        throw new UploadThingError("Unauthorized");
      }
      return { userId: (session.user as any)._id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // You can persist file.url if desired; we just return it to client.
      return { uploadedBy: metadata.userId, url: file.url, name: file.name, size: file.size };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
