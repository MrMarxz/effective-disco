"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import toast from "react-hot-toast";
import { RefreshCw } from "lucide-react";

export default function LoginForm() {
    const router = useRouter();
    const [isLoginButtonLoading, setIsLoginButtonLoading] = useState(false);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoginButtonLoading(true);

        try {
            const formData = new FormData(e.currentTarget);
            const response = await signIn("credentials", {
                email: formData.get("email"),
                password: formData.get("password"),
                redirect: false,
            });

            console.log("RESPONSE: ", response);

            if (!response?.error) {
                toast.success("Logged in successfully!");
                // router.push("/overview");
                // router.refresh();
            } else {
                toast.error("Incorrect credentials! Please try again.");
                if (response.error === "CredentialsSignin")
                    console.log("Invalid credentials");
            }
        } catch (error) {
            console.error("Error logging in: ", error);
        } finally {
            setIsLoginButtonLoading(false);
        }
    };

    return (
        <main className="flex min-h-screen flex-col items-center justify-center">
            <form
                onSubmit={handleSubmit}
                className={`mx-auto mt-10 flex h-[420px] max-w-md flex-col items-center gap-4 rounded-xl border bg-[#FAF9F6] p-4 px-8 shadow-lg`}
            >
                <div className="text-2xl">Login</div>
                <div className="flex w-[300px] flex-col items-center">
                    <div className="mt-2 flex w-full flex-col">
                        <Input
                            type="email"
                            id="email"
                            name="email"
                            placeholder="Enter your email"
                        />
                    </div>
                    <div className="mt-4 flex w-full flex-col">
                        <Input
                            type="password"
                            id="password"
                            name="password"
                            placeholder="Enter your password"
                        />
                    </div>

                    <a
                        href="/forgot-password"
                        className="mt-2 transition duration-150 ease-in-out hover:underline"
                    >
                        Forgot your password?
                    </a>

                    <Button
                        type="submit"
                        className="mt-6 w-full"
                        disabled={isLoginButtonLoading}
                    >
                        {isLoginButtonLoading && <RefreshCw className="animate-spin mr-2 h-4 w-4" />}
                        Sign In
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
        </main>
    );
}
