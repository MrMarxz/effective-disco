"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import toast from "react-hot-toast";
import { RefreshCw } from "lucide-react";
import axios from "axios";
import { CustomResponse } from "~/lib/types";

export default function LoginForm() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [hasSubmitted, setHasSubmitted] = useState(false);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const email = new FormData(e.currentTarget).get("email") as string;

            const res = await axios.post<CustomResponse>("/api/auth/request-password-reset", { email });

            if (res.data.success) {
                toast.success("Password reset request submitted successfully");
                setHasSubmitted(true);
                console.log("RESPONSE: ", res.data.data);
            } else {
                toast.error(res.data.message);
            }
        } catch (error) {
            console.error("Error logging in: ", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
            {hasSubmitted ? (
                <div className="mx-auto mt-10 flex flex-col justify-center h-[320px] max-w-md items-center gap-4 rounded-xl border bg-[#FAF9F6] p-4 px-8 shadow-lg">
                    <div className="text-2xl text-center">Password reset request submitted successfully!</div>
                    <div className="text-lg text-center">Go check your email for a Reset Link.</div>
                    <a
                        href="/login"
                        className="mt-2 transition duration-150 ease-in-out hover:underline"
                    >
                        Want to sign in instead?
                    </a>
                </div>
            ) : (
                <form
                    onSubmit={handleSubmit}
                    className={`mx-auto mt-10 flex h-[320px] max-w-md flex-col items-center gap-4 rounded-xl border bg-[#FAF9F6] p-4 px-8 shadow-lg`}
                >
                    <div className="text-2xl">Forgot your Password?</div>
                    <div className="flex w-[300px] flex-col items-center">
                        <div className="mt-2 flex w-full flex-col">
                            <Input
                                type="email"
                                id="email"
                                name="email"
                                placeholder="Enter your email"
                            />
                        </div>

                        <a
                            href="/login"
                            className="mt-2 transition duration-150 ease-in-out hover:underline"
                        >
                            Want to sign in instead?
                        </a>

                        <Button
                            type="submit"
                            className="mt-6 w-full"
                            disabled={isLoading}
                        >
                            {isLoading && <RefreshCw className="animate-spin mr-2 h-4 w-4" />}
                            Submit
                        </Button>

                        <div className="mt-5 flex flex-col items-center">
                            {"Don't have a profile yet?"}
                            <a
                                href="/register"
                                className="mt-2 transition duration-150 ease-in-out hover:underline"
                            >
                                Sign up
                            </a>
                        </div>
                    </div>
                </form>
            )}
        </main>
    );
}
