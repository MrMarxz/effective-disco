"use client"

import { RoleEnum, type Role, type User } from "@prisma/client"
import { type ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import { UserIcon, GraduationCap, ShieldCheck } from "lucide-react"
import ChangeToAdmin from "~/components/action-items/promote-admin"
import ChangeToEducator from "~/components/action-items/promote-educator"
import ChangeToUser from "~/components/action-items/promote-user"
import { Badge } from "~/components/ui/badge"
import { enumToString } from "~/lib/utils"

interface ExtendedUser {
  id: string
  name: string
  surname: string
  email: string
  createdAt: Date
  role: {
    name: RoleEnum
  }
}

function getRoleBadge(role: RoleEnum) {
  switch (role) {
    case RoleEnum.ADMIN:
      return (
        <Badge className="flex justify-center items-center bg-gray-400 rounded-full p-2 w-[100px]">
          <ShieldCheck className="h-4 w-4" />
          {enumToString(role)}
        </Badge>
      )
    case RoleEnum.EDUCATOR:
      return (
        <Badge className="flex justify-center items-center bg-yellow-500 rounded-full p-2 w-[100px]">
          <GraduationCap className="h-4 w-4" />
          {enumToString(role)}
        </Badge>
      )
    case RoleEnum.USER:
      return (
        <Badge className="flex justify-center items-center bg-green-500 rounded-full p-2 w-[100px]">
          <UserIcon className="h-4 w-4" />
          {enumToString(role)}
        </Badge>
      )
  }
}

export const columns: ColumnDef<ExtendedUser>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "surname",
    header: "Surname",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "createdAt",
    header: "Date Created",
    cell: ({ row }) => {
      const date = row.getValue<string>("createdAt")
      const formattedDate = format(new Date(date), 'yyyy/MM/dd');
      return <div className="italic">{formattedDate}</div>
    },
  },
  {
    accessorKey: "role.name",
    header: "Role",
    cell: ({ row }) => {
      const role = row.original.role.name
      return getRoleBadge(role)
    },
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <div className="flex justify-center items-center gap-x-2">
        {row.original.role.name !== RoleEnum.USER && (
          <ChangeToUser userId={row.original.id} />
        )}
        {row.original.role.name !== RoleEnum.EDUCATOR && (
          <ChangeToEducator userId={row.original.id} />
        )}
        {row.original.role.name !== RoleEnum.ADMIN && (
          <ChangeToAdmin userId={row.original.id} />
        )}
      </div>
    ),
  },
]
