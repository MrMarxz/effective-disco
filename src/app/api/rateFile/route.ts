/* eslint-disable @typescript-eslint/no-unsafe-call */
import { FileUploadStatus } from "@prisma/client";
import { checkPermissions } from "~/lib/permissions";
import prisma from "~/lib/prisma";
import { StandardResponse } from "~/lib/utils";

interface RateRequest {
    fileId: string
    rating: number
    status: FileUploadStatus
}

/**
 * @swagger
 * /api/rateFile:
 *   put:
 *     summary: Rate a file
 *     description: Adds a rating to a file and returns a standard response
 *     tags:
 *       - Files
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
 *               status:
 *                type: string
 *                description: The status of the file
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

        if (!data.status) {
            return StandardResponse(false, "Invalid data. Please provide the status of the file");
        }

        if (data.status !== FileUploadStatus.APPROVED && data.status !== FileUploadStatus.REJECTED) {
            return StandardResponse(false, "Invalid status. Please provide a valid status for the file");
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

        // Check if the file has metadata
        const metadata = await prisma.metaData.findFirst({
            where: {
                fileId: data.fileId
            }
        });

        if (metadata) {
            // Update the rating of the file in the database
            const updatedMetadata = await prisma.metaData.update({
                where: {
                    fileId: data.fileId
                },
                data: {
                    rating: data.rating
                }
            })
        }

        // Update the status of the file in the database
        const updatedFile = await prisma.fileUploads.update({
            where: {
                id: data.fileId
            },
            data: {
                status: data.status,
                reported: false
            }
        });

        // If the user does have the correct role, execute the action
        return StandardResponse(true, "File rated successfully");
    } catch (e) {
        console.log("Error: ", e);
        return StandardResponse(false, "An error occurred");
    }
}
