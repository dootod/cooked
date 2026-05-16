export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: string | null;
  image: string | null;
  banned: boolean | null;
  banReason: string | null;
  banExpires: string | Date | null;
};

export type AppEnv = {
  Variables: {
    user: AuthUser;
    session: { id: string; token: string; userId: string };
  };
};
