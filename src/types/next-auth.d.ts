import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "ADMIN" | "STAFF" | "EMPLOYEE";
    } & DefaultSession["user"];
  }

  interface User {
    role: "ADMIN" | "STAFF" | "EMPLOYEE";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "ADMIN" | "STAFF" | "EMPLOYEE";
  }
}
