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
