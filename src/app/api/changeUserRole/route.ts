/* eslint-disable @typescript-eslint/no-unsafe-call */
import { RoleEnum } from "@prisma/client";
import { checkPermissions } from "~/lib/permissions";
import prisma from "~/lib/prisma";
import { StandardResponse } from "~/lib/utils";
import { getServerAuthSession } from "~/server/auth";

interface ReqProps {
    userId: string;
    role: RoleEnum;
}

/**
 * @swagger
 * /api/changeUserRole:
 *   post:
 *     summary: Change the role of a user and returns a standard response
 *     description: Change the role of a user and returns a standard response
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *          schema:
 *           type: object
 *          properties:
 *          userId:
 *           type: string
 *           example: "123"
 *          role:
 *           type: string
 *           example: "user"
 *     responses:
 *       '200':
 *         description: Updated user role
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
 *                   example: Updated user role
 */

export async function POST(request: Request) {
    try {
        //#region Check permissions
        const permission = await checkPermissions(request);
        if (permission.valid === false) {
            return StandardResponse(false, permission.message);
        }
        //#endregion

        const { userId, role }: ReqProps = await request.json();

        // Find the user
        const user = await prisma.user.findUnique({
            where: {
                id: userId,
            },
        });

        if (!user) {
            return StandardResponse(false, "User not found. Please make sure that the user exists.");
        }

        // Find the correct role
        if (role !== RoleEnum.ADMIN && role !== RoleEnum.USER && role !== RoleEnum.EDUCATOR) {
            return StandardResponse(false, "Role not found. Please make sure that the role is either 'user', 'admin' or 'educator'.");
        }

        const existingRole = await prisma.role.findFirst({
            where: {
                name: role,
            },
        });

        if (!existingRole) {
            return StandardResponse(false, "Role not found. Please make sure that the role is either 'user', 'admin' or 'educator'.");
        }

        // Update the user role
        await prisma.user.update({
            where: {
                id: userId,
            },
            data: {
                roleId: existingRole.id,
            },
        });

        // If the user does have the correct role, execute the action
        return StandardResponse(true, "Updated user role");
    } catch (e) {
        console.log("Error: ", e);
        return StandardResponse(false, "An error occurred");
    }
}
