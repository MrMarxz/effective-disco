import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";
import { CredentialsProvider } from "~/components/CredentialsProvider";
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: "JaKaMa",
  description: "JaKaMa - Document Management",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable}`}>
      <body>
        <Toaster />
        <CredentialsProvider>{children}</CredentialsProvider>
      </body>
    </html>
  );
}
