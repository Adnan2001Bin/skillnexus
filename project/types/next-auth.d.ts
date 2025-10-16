import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      _id?: string;
      isVerified?: boolean;
      userName?: string;
      role?: "user" | "talent" | "admin";
    } & DefaultSession["user"];
    accessToken?: string;
  }

  interface User {
    _id?: string;
    isVerified?: boolean;
    userName?: string;

  }

  interface JWT {
    _id?: string;
    isVerified?: boolean;
    userName?: string;
    accessToken?: string;
  }
}

export type RequirementType = "instructions" | "text" | "textarea" | "multiple" | "file";

export type RequirementQuestion = {
  id: string;                 // stable client id
  type: RequirementType;
  label: string;              // e.g. "What’s your website URL?"
  helpText?: string;          // hint/helper copy
  required?: boolean;

  // multiple choice
  options?: string[];         // only for type === "multiple"
  multiSelect?: boolean;      // only for type === "multiple"

  // file upload
  maxFiles?: number;          // only for type === "file"
  acceptTypes?: string[];     // e.g. ["image/png","image/jpeg","application/pdf"]
};