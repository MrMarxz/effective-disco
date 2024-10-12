"use client";

import { type ReactNode, useEffect, useState } from "react";
import FAB from "~/components/fab/fab";

interface UserLayoutProps {
    children: ReactNode;
}

const UserLayout: React.FC<UserLayoutProps> = ({ children }) => {

    return (
        <>
            <FAB />
            {children}
        </>
    )
};

export default UserLayout;