import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { createHash, randomBytes } from "crypto";
import { type CustomResponse, type PasswordHashResponse } from "./types";
import { NextResponse } from "next/server";
import prisma from "~/lib/prisma";
import { RoleEnum } from "@prisma/client";

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

const allowedUserCalls = [
  "/protected",
];

const allowedAdminCalls = [
  "/protected",
];

const allowedModeratorCalls = [];

const allowedEducatorCalls = [];

export const validateUser = async (userId: string, route: string) => {
  if (!userId) {
    return {
      valid: false,
      message: "User not found",
    };
  }

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      role: {
        select: {
          name: true,
        },
      },
    }
  });

  if (!user) {
    return {
      valid: false,
      message: "User not found",
    };
  }

  if (!allowedUserCalls.includes(route)) {
    return {
      valid: false,
      message: "Route not allowed",
    };
  }

  if (user.role.name === RoleEnum.USER) {
    return {
      valid: true,
      message: "User has permission to execute this action",
    };
  } else {
    return {
      valid: false,
      message: "User does not have permission to execute this action",
    };
  }
}
