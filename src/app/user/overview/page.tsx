/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import LogoutButton from "~/components/LogoutBtn";

export default function OverviewPage() {
  const { data: session } = useSession();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    if (session) {
      setIsLoggedIn(true);
    }
  }, [session]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
        <div>This is the {"User's"} page</div>
        {!isLoggedIn ? <div>Not Logged in</div> : <LogoutButton />}
    </main>
  );
}
