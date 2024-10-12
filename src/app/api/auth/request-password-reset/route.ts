import { env } from "~/env";
import { sendEmail } from "~/lib/email-service";
import { ForgetPasswordTemplate } from "~/lib/email-templates/forget-password";
import { checkPermissions } from "~/lib/permissions";
import prisma from "~/lib/prisma";
import { StandardResponse } from "~/lib/utils";

interface RequestBody {
    email: string;
}

/**
 * @swagger
 * /api/auth/request-password-reset:
 *   post:
 *     summary: Request password reset
 *     description: Sends a password reset link to the user's email and returns a standard response
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: john.doe@example.com
 *     responses:
 *       '200':
 *         description: Password reset request successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Password reset request submitted successfully
 */

export async function POST(request: Request) {
    try {        
        const body: RequestBody = await request.json();

        if (!body.email) {
            return StandardResponse(false, "Please provide an email address");
        }

        // Find the user based on the email
        const user = await prisma.user.findUnique({
            where: {
                email: body.email
            }
        });

        if (!user) {
            return StandardResponse(false, "User not found. Please make sure you have entered the correct email address");
        }

        // Set the expiry date for the password reset request
        const expiryDate = new Date();
        expiryDate.setHours(expiryDate.getHours() + 1);

        // Create a new password reset request
        const resetRequest = await prisma.passwordResetRequest.create({
            data: {
                userId: user.id,
                expiresAt: expiryDate,
            }
        });

        const redirectLink = `${env.NEXTAUTH_URL}/reset-password/${resetRequest.id}`;

        // Send forget password email
        const htmlContent = ForgetPasswordTemplate(user.name, redirectLink);
        const emailData = {
            recipients: [
                {
                    email: user.email,
                    name: user.name
                }
            ],
            htmlContent,
            subject: "Reset your password"
        };
        await sendEmail(emailData);

        return StandardResponse(true, "Password reset request submitted successfully", { redirectLink });
    } catch (e) {
        console.log("Error: ", e);
        return StandardResponse(false, "An error occurred");
    }
}
