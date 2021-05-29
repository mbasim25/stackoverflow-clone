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

export interface PChange {
  password?: string;
  newPassword?: string;
}

export interface PR {
  email?: string;
}

export interface ResetPass {
  uniqueKey?: string;
  email?: string;
  userId?: string;
  password?: string;
}
