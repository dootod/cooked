export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: string | null;
  image: string | null;
};

export type AppEnv = {
  Variables: {
    user: AuthUser;
    session: { id: string; token: string; userId: string };
  };
};
