"use client";

// import { routes } from '@/config/routes';
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@radix-ui/react-tooltip";
import { Button } from "~/components/ui/button";
import { Ban, GraduationCap, User } from "lucide-react";

interface ChangeToUserProps {
    userId: string;
}

export default function ChangeToEducator({ userId }: ChangeToUserProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const submit = async () => {
        console.log("submit");
    };

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" className="w-8 h-8">
                        <GraduationCap className="h-4 w-4" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent className="border p-1 bg-white rounded-xl mb-2">
                    <p>Change role to Educator</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
