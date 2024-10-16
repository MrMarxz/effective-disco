/* eslint-disable @typescript-eslint/no-unsafe-call */
import { checkPermissions } from "~/lib/permissions";
import prisma from "~/lib/prisma";
import { StandardResponse } from "~/lib/utils";
import { getServerAuthSession } from "~/server/auth";

interface ReqProps {
    fileId: string;
}

/**
 * @swagger
 * /api/reportFile:
 *   post:
 *     summary: Report a file
 *     description: Report a file and returns a standard response
 *     tags:
 *       - Files
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *          schema:
 *           type: object
 *          properties:
 *          fileId:
 *          type: string
 *         example: 1234
 *     responses:
 *       '200':
 *         description: File reported!
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
 *                   example: File reported!
 */

export async function POST(request: Request) {
    try {
        //#region Check permissions
        const permission = await checkPermissions(request);
        if (permission.valid === false) {
            return StandardResponse(false, permission.message);
        }
        //#endregion

        // TODO will be commented back in when working on the front end
        const session = await getServerAuthSession();
        if (!session) {
            return StandardResponse(false, "Not authenticated");
        }

        const data = await request.json() as ReqProps;

        // Get the existing file from the database
        const file = await prisma.fileUploads.findUnique({
            where: {
                id: data.fileId
            }
        });

        if (!file) {
            return StandardResponse(false, "File not found. Please make sure the provided file id is correct");
        }

        // Update the file visibility
        const updatedFile = await prisma.fileUploads.update({
            where: {
                id: data.fileId
            },
            data: {
                reported: true
            }
        });


        // If the user does have the correct role, execute the action
        return StandardResponse(true, "File reported!", updatedFile);
    } catch (e) {
        console.log("Error: ", e);
        return StandardResponse(false, "An error occurred");
    }
}
