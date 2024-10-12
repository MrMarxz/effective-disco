import React from 'react';
import { LogOut } from 'lucide-react';
import { Button } from "~/components/ui/button";
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';

const SignOutButton = () => {
    const router = useRouter();

    const handleSignOut = async () => {
        await signOut();
        router.push('/login'); // Redirect to login page after sign out
    };

    return (
        <Button
            variant="outline"
            size="icon"
            onClick={handleSignOut}
            className="w-10 h-10 rounded-full shadow-lg transition-all duration-300 ease-in-out bg-primary text-white hover:text-white bg-blue-500 hover:bg-blue-500 hover:scale-110"
        >
            <LogOut className="h-5 w-5" />
        </Button>
    );
};

export default SignOutButton;