/* eslint-disable @typescript-eslint/no-unsafe-call */
import { checkPermissions } from "~/lib/permissions";
import prisma from "~/lib/prisma";
import { PasswordHashResponse } from "~/lib/types";
import { hashPassword, StandardResponse } from "~/lib/utils";

interface EditProfileProps {
    name: string;
    surname: string;
    email: string;
    affiliation: string;
    credentials: string;
    newPassword: string;
    confirmPassword: string;
}

/**
 * @swagger
 * /api/editProfile:
 *   post:
 *     summary: Edit user profile
 *     description: Updates the profile information of the authenticated user.
 *     tags:
 *       - Users
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - surname
 *               - email
 *             properties:
 *               name:
 *                 type: string
 *                 description: User's first name
 *               surname:
 *                 type: string
 *                 description: User's last name
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *               affiliation:
 *                 type: string
 *                 description: User's affiliation (optional)
 *               credentials:
 *                 type: string
 *                 description: User's credentials (optional)
 *     responses:
 *       200:
 *         description: Profile updated successfully
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
 *                   example: Profile updated successfully
 */

export async function POST(request: Request) {
    try {
        //#region Check permissions
        const permission = await checkPermissions(request);
        if (permission.valid === false) {
            return StandardResponse(false, permission.message);
        }
        //#endregion

        const { name, surname, email, affiliation, credentials, newPassword, confirmPassword } = await request.json() as EditProfileProps;

        if (newPassword && confirmPassword) {
            if (newPassword !== confirmPassword) {
                return StandardResponse(false, "Please make sure the passwords match.");
            }
        }

        if (!name || !surname || !email) {
            return StandardResponse(false, "Invalid data. Please provide all required fields.");
        }

        let password: PasswordHashResponse | null = null

        if (newPassword) {
            const hashed_response: PasswordHashResponse = hashPassword(newPassword);
            password = hashed_response;
        }

        console.log("Should change password: ", password);

        await prisma.user.update({
            where: {
                id: permission.userId,
            },
            data: {
                name,
                surname,
                email,
                affiliation: affiliation.length > 0 ? affiliation : "No affiliation",
                credentials: credentials.length > 0 ? credentials : "No credentials",
                ...(password !== null && { password: password.hash, salt: password.salt }),
            }
        });

        return StandardResponse(true, "Profile updated successfully");
    } catch (e) {
        console.log("Error: ", e);
        return StandardResponse(false, "An error occurred");
    }
}
