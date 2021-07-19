import { User as BaseUser } from ".prisma/client";
import { Pagination as BasePagination } from "./pagination";

export interface User extends BaseUser {}

export interface UserQuery extends BasePagination {
  id: string;
  username: string;
  email: string;
  role: "USER" | "ADMIN";
  isActive: boolean;
  yOfExperience: number;
  level: "JUNIOR" | "INTERMEDIATE" | "MIDLEVEL" | "SENIOR";
  fieldId: string;
}

// Password update when authenticated and the old password is known
export interface PasswordChange {
  old?: string;
  new?: string;
}

// Sending email in case of a password reset
export interface ResetEmail {
  email?: string;
}

// Password reset when the user in not authenticated and old password is forgotten
export interface ResetConfirm {
  uniqueKey?: string;
  email?: string;
  password?: string;
}

// refresh token
export interface ResetToken {
  token?: string;
}
