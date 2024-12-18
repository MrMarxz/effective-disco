import { RoleEnum } from "@prisma/client";
import { redirect } from "next/navigation";
import { env } from "~/env";
import prisma from "~/lib/prisma";
import { getServerAuthSession } from "~/server/auth";

interface AccountPageProps {
    name: string;
}

export default async function AccountPage({ params }: { params: AccountPageProps }) {
    const session = await getServerAuthSession();

    if (!session) {
        redirect("/login")
    }

    const user = await prisma.user.findFirst({
        where: {
            id: session.user.id,
        },
        select: {
            role: true,
        }
    });

    if (!user) {
        redirect("/login")
    }

    if (user.role.name === RoleEnum.USER) {
        redirect("/user/files")
    } else if (user.role.name === RoleEnum.EDUCATOR) {
        redirect("/educator/files")
    } else if (user.role.name === RoleEnum.ADMIN) {
        redirect("/admin/files")
    } else {
        redirect("/login")
    }

}
