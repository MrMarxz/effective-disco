"use client";

import { SessionProvider } from "next-auth/react";
import { type ReactNode } from "react";
import { Toaster } from "./ui/toaster";

export const CredentialsProvider = ({ children }: { children: ReactNode }) => {
  return (
    <SessionProvider>
      <Toaster />
      {children}
    </SessionProvider>
  );
};
