import { env } from "~/env";
import { sendEmail } from "~/lib/email-service";
import { ForgetPasswordTemplate } from "~/lib/email-templates/forget-password";
import prisma from "~/lib/prisma";
import { StandardResponse } from "~/lib/utils";

interface RequestBody {
    email: string;
}

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
            recipients: [],
            htmlContent,
            subject: "Reset your password"
        };
        await sendEmail(emailData);

        return StandardResponse(true, "Password reset request submitted successfully", { redirectLink});
    } catch (e) {
        console.log("Error: ", e);
        return StandardResponse(false, "An error occurred");
    }
}
