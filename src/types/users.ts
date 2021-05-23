export interface User {
  id?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  image?: string;
  password?: string;
  isActive?: Boolean;
  isAdmin?: Boolean;
  isSuperAdmin?: Boolean;
  score?: number;
}
