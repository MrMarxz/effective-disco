import { FileUploadStatus, RoleEnum } from "@prisma/client";
import { checkPermissions } from "~/lib/permissions";
import prisma from "~/lib/prisma";
import { StandardResponse } from "~/lib/utils";

/**
 * @swagger
 * /api/getCommunityFiles:
 *   get:
 *     summary: Retrieve community files
 *     description: Returns a list of files uploaded by the community
 *     tags:
 *       - Community Files
 *     responses:
 *       '200':
 *         description: Successfully retrieved file uploads list
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
 *                     example: ckg7m2fxk0000j29z3l9h8f1q
 *                   status:
 *                     type: string
 *                     description: The status of the file upload
 *                     example: PENDING
 *                   url:
 *                     type: string
 *                     description: The URL of the uploaded file
 *                     example: https://example.com/files/document.pdf
 *                   size:
 *                     type: integer
 *                     description: The size of the file in bytes
 *                     example: 1024000
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
 *                     example: This is an important document
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
 *                     description: Additional metadata for the file
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

        // Find the current user
        const user = await prisma.user.findUnique({
            where: {
                id: permission.userId
            },
            include: {
                role: true
            }
        });

        if (!user) {
            return StandardResponse(false, "User not found. Please make sure you are logged in.");
        }

        let files;

        if (user.role.name === RoleEnum.USER) {
            // Return only approved files
            files = await prisma.fileUploads.findMany({
                where: {
                    display: true,
                    status: FileUploadStatus.APPROVED,
                    reported: false
                }
            });
        }

        else {
            // Return all files
            files = await prisma.fileUploads.findMany();
        }

        return StandardResponse(true, "", files ?? []);

    } catch (e) {
        console.log("Error: ", e);
        return StandardResponse(false, "An error occurred");
    }
}
