"use client";

import React, { useState } from 'react';
import { Button } from "~/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/components/ui/tooltip";
import { Plus, MessageSquare, HelpCircle, FileText } from 'lucide-react';
import SignOutButton from './signout-fab-action';
import ProfileUpdateDialog from './profile-fab-action';
import UserTablesAction from './user-table-fab-action';
import { RoleEnum } from '@prisma/client';
import FilesAction from './files-fab-action';

interface FABProps {
    role: RoleEnum
}

const FAB = ({ role }: FABProps) => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => setIsOpen(!isOpen);

    return (
        <TooltipProvider>
            <div className="fixed bottom-6 right-6 flex flex-col items-center">

                {/* FAB CONTENT */}
                <div className={`flex flex-col gap-3 mb-3 transition-all duration-300 ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                    <ProfileUpdateDialog />
                    {role === RoleEnum.ADMIN && <FilesAction />}
                    {role === RoleEnum.ADMIN && <UserTablesAction />}
                    <SignOutButton />
                </div>

                {/* FAB TOGGLE BUTTON */}
                <Button
                    variant="default"
                    size="icon"
                    className="w-14 h-14 rounded-full shadow-lg bg-white hover:bg-gray-100 text-black transition-colors duration-200"
                    onClick={toggleMenu}
                >
                    <Plus className={`h-6 w-6 transition-transform duration-200 text-black ${isOpen ? 'rotate-45' : ''}`} />
                    <span className="sr-only">Toggle menu</span>
                </Button>
            </div>
        </TooltipProvider>
    );
};

export default FAB;
