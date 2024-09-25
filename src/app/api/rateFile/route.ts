/* eslint-disable @typescript-eslint/no-unsafe-call */
import { checkPermissions } from "~/lib/permissions";
import prisma from "~/lib/prisma";
import { StandardResponse } from "~/lib/utils";

interface RateRequest {
    fileId: string
    rating: number
}

/**
 * @swagger
 * /api/rateFile:
 *   put:
 *     summary: Rate a file
 *     description: Adds a rating to a file and returns a standard response
 *     tags:
 *       - File Interactions
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fileId:
 *                 type: string
 *                 description: The unique identifier of the file to be rated
 *                 example: 507f1f77bcf86cd799439011
 *               rating:
 *                 type: number
 *                 description: The rating value to be assigned to the file (e.g., between 1 and 5)
 *                 example: 4
 *     responses:
 *       '200':
 *         description: File rated successfully
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
 *                   example: File rated successfully
 */

export async function PUT(request: Request) {
    try {
        //#region Check permissions
        const permission = await checkPermissions(request);
        if (permission.valid === false) {
            return StandardResponse(false, permission.message);
        }
        //#endregion
        
        const data: RateRequest = await request.json();

        if (!data.fileId) {
            return StandardResponse(false, "Invalid data. Please provide the ID of the file you want to rate");
        }

        if (!data.rating) {
            return StandardResponse(false, "Invalid data. Please provide a rating for the file.");
        }

        if (data.rating < 1 || data.rating > 5) {
            return StandardResponse(false, "Invalid rating. Please provide a rating between 1 and 5");
        }

        // Check if the given file id is valid
        const file = await prisma.fileUploads.findUnique({
            where: {
                id: data.fileId
            }
        });

        if (!file) {
            return StandardResponse(false, "File not found. Please provide a valid file ID");
        }

        // Update the rating of the file in the database
        const updatedMetadata = await prisma.metaData.update({
            where: {
                fileId: data.fileId
            },
            data: {
                rating: data.rating
            }
        })

        // If the user does have the correct role, execute the action
        return StandardResponse(true, "File rated successfully");
    } catch (e) {
        console.log("Error: ", e);
        return StandardResponse(false, "An error occurred");
    }
}
