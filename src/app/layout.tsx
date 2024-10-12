import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";
import { CredentialsProvider } from "~/components/CredentialsProvider";
import { Toaster } from 'react-hot-toast';
import { env } from "~/env";

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
      <head>
        {env.NODE_ENV === "production" && <script defer src="https://cloud.umami.is/script.js" data-website-id="bdbfd1a9-feff-4bd2-9b59-0f0ba723e2ae"></script>}
      </head>
      <body>
        <Toaster />
        <CredentialsProvider>{children}</CredentialsProvider>
      </body>
    </html>
  );
}
