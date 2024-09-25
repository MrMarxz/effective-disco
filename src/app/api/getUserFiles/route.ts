import { checkPermissions } from "~/lib/permissions";
import prisma from "~/lib/prisma";
import { StandardResponse } from "~/lib/utils";

/**
 * @swagger
 * /api/getUserFiles:
 *   get:
 *     summary: Retrieve user files
 *     description: Fetches an array of file information for a specific user
 *     tags:
 *      - User Files
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique identifier of the user
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   subject:
 *                     type: string
 *                   grade:
 *                     type: number
 *                   tags:
 *                     type: array
 *                     items:
 *                       type: string
 *                   rating:
 *                     type: number
 *                   likes:
 *                     type: number
 *                   fileId:
 *                     type: string
 */
export async function GET(request: Request) {
    try {
        //#region Check permissions
        const permission = await checkPermissions(request);
        if (permission.valid === false) {
            return StandardResponse(false, permission.message);
        }
        //#endregion

        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId");

        if (!userId) {
            return StandardResponse(false, "Invalid data. Please provide a User ID");
        }

        // Get the data from the database
        const userFiles = await prisma.fileUploads.findMany({
            where: {
                userId: userId,
            },
            include: {
                metaData: true
            }
        });

        return StandardResponse(true, "User files retrieved successfully", userFiles);
    } catch (e) {
        console.log("Error: ", e);
        return StandardResponse(false, "An error occurred");
    }
}
