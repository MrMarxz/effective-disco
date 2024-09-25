import { FileUploadStatus } from "@prisma/client";
import { checkPermissions } from "~/lib/permissions";
import prisma from "~/lib/prisma";
import { StandardResponse } from "~/lib/utils";

/**
 * @swagger
 * /api/searchFile:
 *   get:
 *     summary: Search for files
 *     description: Returns a list of file records based on search criteria
 *     tags:
 *       - File Search
 *     responses:
 *       '200':
 *         description: Successfully retrieved file records
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: The unique identifier of the file
 *                     example: 507f1f77bcf86cd799439011
 *                   status:
 *                     type: string
 *                     description: The current status of the file upload
 *                     example: APPROVED
 *                   url:
 *                     type: string
 *                     description: The URL of the file
 *                     example: https://example.com/file.pdf
 *                   size:
 *                     type: number
 *                     description: The size of the file in bytes
 *                     example: 204800
 *                   type:
 *                     type: string
 *                     description: The file type (e.g., pdf, doc, etc.)
 *                     example: pdf
 *                   name:
 *                     type: string
 *                     description: The name of the file
 *                     example: Exam Paper
 *                   comments:
 *                     type: string
 *                     nullable: true
 *                     description: Comments related to the file
 *                     example: null
 *                   reported:
 *                     type: boolean
 *                     description: Whether the file has been reported
 *                     example: false
 *                   display:
 *                     type: boolean
 *                     description: Whether the file is visible for display
 *                     example: true
 *                   userId:
 *                     type: string
 *                     description: The ID of the user who uploaded the file
 *                     example: 507f1f77bcf86cd799439011
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
        const query = searchParams.get("query");

        if (!query) {
            return StandardResponse(false, "Invalid data. Please provide a search query");
        }

        // Search for files that match the query
        // We are searching based on the file name, url, type, subject and tags
        // We are also filtering out files that have been reported or rejected
        const matchingFiles = await prisma.fileUploads.findMany({
            where: {
                reported: false,
                status: { not: FileUploadStatus.REJECTED },
                OR: [
                    {
                        name: {
                            contains: query,
                            mode: 'insensitive'
                        }
                    },
                    {
                        url: {
                            contains: query,
                            mode: 'insensitive'
                        }
                    },
                    {
                        type: {
                            contains: query,
                            mode: 'insensitive'
                        }
                    },
                    {
                        metaData: {
                            OR: [
                                {
                                    subject: {
                                        contains: query,
                                        mode: 'insensitive'
                                    }
                                },
                                {
                                    tags: {
                                        hasSome: [query]
                                    }
                                }
                            ]
                        }
                    }
                ]
            }
        });
        return StandardResponse(true, "", matchingFiles);
    } catch (e) {
        console.log("Error: ", e);
        return StandardResponse(false, "An error occurred");
    }
}
