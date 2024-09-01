/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Button } from "~/components/ui/button";
import { validateEmail, validatePassword } from "~/lib/utils";
import Image from "next/image";
import { Input } from "~/components/ui/input";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);

    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword");
    const name = formData.get("name");
    const email = formData.get("email") as string;

    // Check if all fields are filled
    if (!name || !email || !password || !confirmPassword) {
      console.log("Please fill in all fields");
      setIsLoading(false);
      return;
    }

    // Check if email is valid
    if (!validateEmail(email)) {
      console.log("Invalid email");
      setIsLoading(false);
      return;
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      console.log("Passwords do not match");
      setIsLoading(false);
      return;
    }

    // Check if password is valid
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      console.log("Invalid password");
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post("/api/auth/register", {
        name: formData.get("name"),
        surname: formData.get("surname"),
        email: formData.get("email"),
        password: formData.get("password"),
      });

      if (response.data.success) {
        router.push("/login");
        router.refresh();
      } else {
        console.log("ERROR REGISTERING");
        if (response.data.message) {
        } else {
        }
      }
    } catch (error) {
      console.log("ERROR REGISTERING", error);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="mx-auto mt-10 flex h-[550px]  max-w-md flex-col items-center gap-4 rounded-xl border bg-[#FAF9F6] p-4 px-8 shadow-lg"
      >
        {/* HEADING */}
        <div className="flex flex-row justify-center">
        </div>

        <div className="flex w-[300px] flex-col items-center">
          <div className="mt-2 flex w-full flex-col">
            <Input type="name" id="name" name="name" placeholder="Username" />
          </div>
          <div className="mt-2 flex w-full flex-col">
            <Input type="name" id="surname" name="surname" placeholder="Surname" />
          </div>
          <div className="mt-2 flex w-full flex-col">
            <Input type="email" id="email" name="email" placeholder="Email" />
          </div>
          <div className="mt-2 flex w-full flex-col">
            <Input
              type="password"
              id="password"
              name="password"
              placeholder="Password"
            />
          </div>
          <div className="mt-2 flex w-full flex-col">
            <Input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              placeholder="Confirm Password"
            />
          </div>

          <Button
            type="submit"
            className="mt-4 w-full"
            disabled={isLoading}
          >
            Create Profile
          </Button>

          <div className="mt-5 flex flex-col items-center">
            {"Already have an account?"}
            <a
              href="/login"
              className="mt-2 transition duration-150 ease-in-out hover:underline"
            >
              Sign In
            </a>
          </div>
        </div>
      </form>
    </main>
  );
}
