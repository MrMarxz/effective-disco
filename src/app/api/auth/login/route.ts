/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import prisma from "~/lib/prisma";
import { StandardResponse, hashPassword, validatePasswordWithSalt } from "~/lib/utils";
import { type PasswordHashResponse } from "~/lib/types";
import jwt from 'jsonwebtoken';
import { env } from "~/env";

interface LoginDetails {
    email: string;
    password: string;
}

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: User login
 *     description: Logs in a user and returns a standard response with a JWT token
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: user123
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       '200':
 *         description: Successfully logged in
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
 *                   example: Login successful
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                       description: JWT token for the user
 *                       example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.abc123
 */
export async function POST(request: Request) {
    try {
        const { email, password } = (await request.json()) as LoginDetails;

        // Check if all fields are filled
        if (!email || !password) {
            return StandardResponse(false, "All fields are required");
        }

        // Find the user in the database
        const user = await prisma.user.findFirst({
            where: {
                email: email,
            },
            select: {
                id: true,
                name: true,
                email: true,
                password: true,
                salt: true,
                role: {
                    select: {
                        name: true
                    }
                },
            }
        });

        if (!user) {
            return StandardResponse(false, "Invalid credentials. Please check your email and password");
        }

        // Hash the input password with the salt from the database
        const isValid = validatePasswordWithSalt(
            password,
            user.salt,
            user.password,
        );

        if (!isValid) {
            return StandardResponse(false, "Invalid credentials. Please check your email and password");
        }

        // Create a JWT token
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        const token = jwt.sign({ user }, env.JWT_SECRET, {
            expiresIn: "1h",
        });

        // Create the session in the database
        const expiresIn = new Date();
        expiresIn.setHours(expiresIn.getHours() + 1);

        await prisma.session.create({
            data: {
                userId: user.id,
                token: token,
                expiresAt: expiresIn,
            }
        });

        return StandardResponse(true, "Login successful", { token });
    } catch (e) {
        console.log("Error while creating user: ", e);
        return StandardResponse(false, "Error while creating user");
    }
}
