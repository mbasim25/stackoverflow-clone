export interface User {
  id?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  image?: string;
  password?: string;
  isActive?: boolean;
  isAdmin?: boolean;
  isSuperAdmin?: boolean;
  score?: number;
}
