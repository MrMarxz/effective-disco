import { redirect } from "next/navigation";
import React from "react";
import { getServerAuthSession } from "~/server/auth";
import { UsersTable } from "./table";
import { columns } from "./column";
import prisma from "~/lib/prisma";

export default async function Files() {
  const session = await getServerAuthSession();
  if (!session) {
    redirect("/login");
  }

  // Fetch all users
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      surname: true,
      email: true,
      createdAt: true,
      role: {
        select: {
          name: true,
        },
      },
    },
  });

  return (
    <div className="container mx-auto p-4 space-y-6">
      <UsersTable columns={columns} data={users} />
    </div>
  );
}
