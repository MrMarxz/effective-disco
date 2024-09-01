/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import prisma from "~/lib/prisma";
import { StandardResponse, hashPassword } from "~/lib/utils";
import { type PasswordHashResponse } from "~/lib/types";
import { RoleEnum } from "@prisma/client";
interface RegisterDetails {
  name: string;
  surname: string;
  email: string;
  password: string;
  hasAcceptedTerms: boolean;
}

export async function POST(request: Request) {
  try {
    const { name, surname, email, password } = (await request.json()) as RegisterDetails;

    // Check if all fields are filled
    if (!name || !email || !password || !surname) {
      return StandardResponse(false, "All fields are required");
    }

    // Check if email is already taken
    const existingUser = await prisma.user.findFirst({
      where: {
        email: email,
      },
    });

    if (existingUser) {
      return StandardResponse(false, "A user with this email already exists.");
    }

    const hashed_response: PasswordHashResponse = hashPassword(password);

    // Get the User role details
    const role = await prisma.role.findFirst({
      where: {
        name: RoleEnum.USER,
      },
    });

    if (!role) {
      return StandardResponse(false, "Role not found");
    }

    // Save to database
    const user = await prisma.user.create({
      data: {
        name: name,
        surname: surname,
        email: email,
        password: hashed_response.hash,
        salt: hashed_response.salt,
        role: {
          connect: {
            id: role.id,
          },
        }
      },
    });

    return StandardResponse(true, "User created successfully");
  } catch (e) {
    console.log("Error while creating user: ", e);
    return StandardResponse(false, "Error while creating user");
  }
  return StandardResponse(true, "User created successfully");
}