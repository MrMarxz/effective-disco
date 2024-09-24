import prisma from "~/lib/prisma";
import { StandardResponse, hashPassword } from "~/lib/utils";
import { type PasswordHashResponse } from "~/lib/types";

interface ResetPasswordRequest {
  id: string;
  password: string;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, password } = body as ResetPasswordRequest;

    if (!id || !password) {
      return StandardResponse(false, "Please fill in all the required fields.");
    }

    // Find the reset token record
    const resetToken = await prisma.passwordResetRequest.findFirst({
      where: {
        id,
      },
      select: {
        id: true,
        userId: true,
        expiresAt: true,
        used: true,
      },
    });

    if (!resetToken) {
      return StandardResponse(false, "Invalid token.");
    }
    // Check if the token has expired
    if (resetToken.expiresAt < new Date()) {
      return StandardResponse(false, "Token has expired. Please request a new one.");
    }

    // Check if the token has been used previously
    if (resetToken.used) {
      return StandardResponse(false, "Token has already been used. Please request a new one.");
    }

    const hashed_response: PasswordHashResponse = hashPassword(password);

    // Update the user's password
    await prisma.user.update({
      where: {
        id: resetToken.userId,
      },
      data: {
        password: hashed_response.hash,
        salt: hashed_response.salt,
      },
    });

    // Mark the token as used so it can't be used again
    await prisma.passwordResetRequest.update({
      where: {
        id: resetToken.id,
      },
      data: {
        used: true,
      },
    });
  } catch (e) {
    console.log("Error: ", e);
    return StandardResponse(false, "An error occurred. Please contact our support team.");
  }

  return StandardResponse(true, "Successfully reset password!");
}
