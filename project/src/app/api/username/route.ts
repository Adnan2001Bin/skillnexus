// app/api/auth/username/route.ts
import connectDB from "@/lib/connectDB";
import UserModel from "@/models/user.model";
import { z } from "zod";
import { signUpSchema } from "@/schemas/signUpSchema";

const UsernameQuerySchema = z.object({
  userName: signUpSchema.shape.userName,
});

export async function GET(request: Request) {
  await connectDB();

  try {
    const { searchParams } = new URL(request.url);
    const queryParam = { userName: searchParams.get("userName") };

    const result = UsernameQuerySchema.safeParse(queryParam);
    if (!result.success) {
      const usernameErrors = result.error.format().userName?._errors || [];
      return Response.json(
        {
          success: false,
          message:
            usernameErrors?.length > 0
              ? usernameErrors.join(", ")
              : "Invalid query parameters",
        },
        { status: 400 }
      );
    }

    const { userName } = result.data;

    // Case-insensitive exact match + verified only
    const existingUser = await UserModel.findOne({
      userName: { $regex: `^${userName}$`, $options: "i" },
      isVerified: true,
    });

    if (existingUser) {
      return Response.json(
        { success: false, message: "Username is already taken" },
        { status: 200 } // 200 is fine for UI checks; success=false tells the story
      );
    }

    return Response.json(
      { success: true, message: "Username is unique" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error checking username:", error);
    return Response.json(
      { success: false, message: "Error checking username" },
      { status: 500 }
    );
  }
}
