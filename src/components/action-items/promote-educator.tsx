"use client";

// import { routes } from '@/config/routes';
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@radix-ui/react-tooltip";
import { Button } from "~/components/ui/button";
import { Ban, GraduationCap, RefreshCw, User } from "lucide-react";
import { RoleEnum } from "@prisma/client";
import axios from "axios";
import toast from "react-hot-toast";
import { type CustomResponse } from "~/lib/types";

interface ChangeToUserProps {
    userId: string;
}

export default function ChangeToEducator({ userId }: ChangeToUserProps) {
    const [isLoading, setIsLoading] = useState(false);

    const submit = async () => {
        setIsLoading(true);

        try {
            const res = await axios.post<CustomResponse>("/api/changeUserRole", {
                userId,
                role: RoleEnum.EDUCATOR,
            });

            if (res.data.success === true) {
                window.location.reload();
            } else {
                toast.error(res.data.message);
            }
        } catch (error) {
            toast.error("An error occurred while updating User role");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant="outline"
                        size="icon"
                        className="w-8 h-8"
                        disabled={isLoading}
                        onClick={submit}
                    >
                        {isLoading ? (<RefreshCw className="h-4 w-4 animate-spin" />) : (<GraduationCap className="h-4 w-4" />)}
                    </Button>
                </TooltipTrigger>
                <TooltipContent className="border p-1 bg-white rounded-xl mb-2">
                    <p>Change role to Educator</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
