import { redirect } from "next/navigation";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { SessionData, sessionOptions } from "@/lib/session";
import { isAccessRevoked } from "@/lib/db";
import ChatClient from "./ChatClient";

export default async function ChatPage() {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);

  if (!session.isLoggedIn) redirect("/login");

  const revoked = await isAccessRevoked();
  if (revoked) {
    return (
      <div className="min-h-screen bg-brand-black flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h1 className="font-heading text-3xl font-light text-gold mb-4">Access Suspended</h1>
          <p className="text-text-muted text-sm leading-relaxed">
            Your access to the BeEnhanced AI Assistant has been temporarily suspended by the administrator.
            Please contact your manager for assistance.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ChatClient
      gmailConnected={!!session.gmailAccessToken}
      gmailEmail={session.gmailEmail}
    />
  );
}
