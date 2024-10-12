
import { RoleEnum } from "@prisma/client";
import { redirect } from "next/navigation";
import { type ReactNode } from "react";
import FAB from "~/components/fab/fab";
import prisma from "~/lib/prisma";
import { getServerAuthSession } from "~/server/auth";

interface EducatorLayoutProps {
    children: ReactNode;
}

const EducatorLayout: React.FC<EducatorLayoutProps> = async ({ children }) => {
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

    if (user?.role.name !== RoleEnum.EDUCATOR) {
        redirect("/login")
    }

    return (
        <>
            <FAB role={RoleEnum.EDUCATOR} />
            {children}
        </>
    )
};

export default EducatorLayout;