import { SessionOptions } from "iron-session";

export interface SessionData {
  userId?: string;
  role?: "user" | "admin";
  isLoggedIn: boolean;
  gmailAccessToken?: string;
  gmailRefreshToken?: string;
  gmailEmail?: string;
}

export const sessionOptions: SessionOptions = {
  password: process.env.NEXTAUTH_SECRET!,
  cookieName: "beenhanced_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "strict",
    // undefined = session cookie (expires when browser closes)
    maxAge: undefined,
  },
};
