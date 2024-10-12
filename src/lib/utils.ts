import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { createHash, randomBytes } from "crypto";
import { type CustomResponse, type PasswordHashResponse } from "./types";
import { NextResponse } from "next/server";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const StandardResponse = (
  pSuccess: boolean,
  pMessage: string,
  pData?: object,
) => {
  const response: CustomResponse = {
    success: pSuccess,
    message: pMessage,
    ...(pData && { data: pData }),
  };

  return NextResponse.json(response);
};

export const validatePasswordWithSalt = (
  password: string,
  salt: string,
  existingHash: string,
) => {
  const hashedPassword = hashPassword(password, salt);
  return hashedPassword.hash === existingHash;
};

export const generateSalt = (length = 16): string => {
  return randomBytes(length).toString("hex");
};

export const hashPassword = (
  password: string | undefined,
  salt = "",
): PasswordHashResponse => {
  if (!password) {
    return {
      hash: "",
      salt: "",
    };
  }

  // If no salt was provided, generate a new one
  if (salt === "") {
    salt = generateSalt();
  }

  const hash = createHash("sha256");
  hash.update(password + salt);

  return {
    hash: hash.digest("hex"),
    salt: salt,
  };
};

export const validateEmail = (email: string) => {
  const re = /\S+@\S+\.\S+/;
  return re.test(email);
};

export const validatePassword = (password: string) => {
  const res = {
    valid: true,
    message: "",
  };

  if (password.length < 8) {
    res.message = "Password must be at least 8 characters";
    res.valid = false;
  }
  if (!/[a-z]/.test(password)) {
    res.message = "Password must contain at least one lowercase letter";
    res.valid = false;
  }

  if (!/[A-Z]/.test(password)) {
    res.message = "Password must contain at least one uppercase letter";
    res.valid = false;
  }

  if (!/[0-9]/.test(password)) {
    res.message = "Password must contain at least one number";
    res.valid = false;
  }

  if (!/[!@#$%^&*]/.test(password)) {
    res.message = "Password must contain at least one special character";
    res.valid = false;
  }

  return res;
};

export function enumToString(enumString: string): string {
  if (typeof enumString !== "string") {
      return "";
  }
  const words = enumString.toLowerCase().split("_");
  return words
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
}

