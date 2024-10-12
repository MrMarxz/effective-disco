/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
"use client";

import axios from "axios";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { useRouter } from "next/navigation";
import { validatePassword } from "~/lib/utils";
import toast from "react-hot-toast";
import { RefreshCw } from "lucide-react";

interface ResetPasswordParams {
  token: string;
}

export default function Form({ token }: ResetPasswordParams) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setIsLoading(true);
    // Check if all fields are filled
    if (!password || !confirmPassword) {
      console.log("Please fill in all fields");
      toast.error("Please fill in all fields");
      setIsLoading(false);
      return;
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      console.log("Passwords do not match");
      toast.error("Passwords do not match. Please try again.");
      setIsLoading(false);
      return;
    }

    // Check if password is valid
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      toast.error(passwordValidation.message);
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post("/api/auth/reset-password", {
        id: token,
        password,
      });

      if (response.data.success === true) {
        toast.success("Password reset successfully!");
        router.push("/login");
        router.refresh();
      } else {
        console.log("ERROR REGISTERING", response.data.message);
        const message = response.data.message as string || "An error occurred while resetting your password. Please try again.";
        toast.error(message);
      }
    } catch (error) {
      console.log("ERROR REGISTERING", error);
      toast.error("An error occurred while resetting your password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
      <div className="mx-auto mt-10 flex h-[350px] w-[450px] max-w-md flex-col gap-4 rounded-lg border bg-white p-8 shadow-lg">
        {/* HEADING */}
        <div className="flex flex-row justify-center">
          <h1 className="text-2xl font-semibold text-gray-700">
            Create new password
          </h1>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="password" className="font-semibold text-gray-700">
            New Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your new password"
            className="rounded-md border border-gray-300 px-4 py-2 transition duration-150 ease-in-out focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="confirmPassword"
            className="font-semibold text-gray-700"
          >
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Enter your password"
            className="rounded-md border border-gray-300 px-4 py-2 transition duration-150 ease-in-out focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <Button onClick={handleSubmit} className="mt-4" disabled={isLoading}>
          {isLoading && <RefreshCw className="animate-spin mr-2 h-4 w-4" />}
          Submit
        </Button>
      </div>
    </main>
  );
}
