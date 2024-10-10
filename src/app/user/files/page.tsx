import { redirect } from "next/navigation";
import React from "react";
import { getServerAuthSession } from "~/server/auth";
import UserFilesPage from "./form";

export default async function Files() {
  const session = await getServerAuthSession();
  if (!session) {
    redirect("/login");
  }

  return (
    <UserFilesPage userId={session.user.id} />
  );
}
