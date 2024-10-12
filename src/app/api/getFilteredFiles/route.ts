import { FileUploadStatus } from "@prisma/client";
import { checkPermissions } from "~/lib/permissions";
import prisma from "~/lib/prisma";
import { StandardResponse } from "~/lib/utils";

/**
 * @swagger
 * /api/getFilteredFiles:
 *   get:
 *     summary: Get filtered file uploads
 *     description: Retrieve file uploads based on a filter
 *     tags:
 *       - File Uploads
 *     responses:
*       '200':
*         description: Successfully retrieved file uploads
*         content:
*           application/json:
*             schema:
*               type: array
*               items:
*                 type: object
*                 properties:
*                   id:
*                     type: string
*                     description: The unique identifier for the file upload
*                     example: cljk2c0z80000qwer1234abcd
*                   status:
*                     type: string
*                     description: The status of the file upload
*                     enum: [PENDING, COMPLETED, FAILED]
*                     example: COMPLETED
*                   url:
*                     type: string
*                     description: The URL of the uploaded file
*                     example: https://example.com/uploads/file.pdf
*                   size:
*                     type: integer
*                     description: The size of the file in bytes
*                     example: 1048576
*                   type:
*                     type: string
*                     description: The MIME type of the file
*                     example: application/pdf
*                   name:
*                     type: string
*                     description: The name of the file
*                     example: document.pdf
*                   comments:
*                     type: string
*                     nullable: true
*                     description: Optional comments about the file
*                     example: Important document for review
*                   reported:
*                     type: boolean
*                     description: Whether the file has been reported
*                     example: false
*                   display:
*                     type: boolean
*                     description: Whether the file should be displayed
*                     example: true
*                   userId:
*                     type: string
*                     description: The ID of the user who uploaded the file
*                     example: user123
*                   metaData:
*                     type: object
*                     nullable: true
*                     description: Additional metadata associated with the file
*                     example: null
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
        const filter = searchParams.get("filter");

        console.log("Filter: ", filter);

        if (!filter) {
            return StandardResponse(false, "No filter provided. Please provide a filter");
        }

        if (filter === "all") {
            const files = await prisma.fileUploads.findMany();
            return StandardResponse(true, "Successfully retrieved files", files);
        } else if (filter === "approved") {
            const files = await prisma.fileUploads.findMany({
                where: {
                    status: FileUploadStatus.APPROVED
                }
            });
            return StandardResponse(true, "Successfully retrieved files", files);
        } else if (filter === "pending") {
            const files = await prisma.fileUploads.findMany({
                where: {
                    status: FileUploadStatus.PENDING
                }
            });
            console.log("Files: ", files);
            return StandardResponse(true, "Successfully retrieved files", files);
        } else if (filter === "rejected") {
            const files = await prisma.fileUploads.findMany({
                where: {
                    status: FileUploadStatus.REJECTED
                }
            });
            return StandardResponse(true, "Successfully retrieved files", files);
        } else {
            return StandardResponse(false, "Invalid filter provided. Please provide a valid filter");
        }

    } catch (e) {
        console.log("Error: ", e);
        return StandardResponse(false, "An error occurred");
    }
}
