import type { DefaultSession } from "next-auth";

// Role values (stored as string in DB for SQLite compat)
export type Role =
  | "ADMINISTRATOR"
  | "FOREMAN"
  | "EMPLOYEE"
  | "ACCOUNTING";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: Role;
  }
}
