export interface User {
  id?: string;
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  image?: string;
  password?: string;
  isActive?: boolean;
  isAdmin?: boolean;
  isSuperAdmin?: boolean;
  score?: number;
}

// Password update when authenticated and the old password is known
export interface PChange {
  password?: string;
  newPassword?: string;
}

// Sending email in case of a password reset
export interface PR {
  email?: string;
}

// Password reset when the user in not authenticated and old password is forgotten
export interface ResetPass {
  uniqueKey?: string;
  email?: string;
  userId?: string;
  password?: string;
}

// refresh token
export interface ResetToken {
  token?: string;
}
