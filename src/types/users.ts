import { User as BaseUser } from ".prisma/client";

export interface User extends BaseUser {}

// Password update when authenticated and the old password is known
export interface PassChange {
  password?: string;
  newPassword?: string;
}

// Sending email in case of a password reset
export interface EmailPassReset {
  email?: string;
}

// Password reset when the user in not authenticated and old password is forgotten
export interface PassReset {
  uniqueKey?: string;
  email?: string;
  userId?: string;
  password?: string;
}

// refresh token
export interface ResetToken {
  token?: string;
}
