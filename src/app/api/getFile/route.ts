import { checkPermissions } from "~/lib/permissions";
import prisma from "~/lib/prisma";
import { StandardResponse } from "~/lib/utils";

/**
 * @swagger
 * /api/getFile:
 *   get:
 *     summary: Get a file upload
 *     description: Retrieve a file upload by its unique identifier
 *     tags:
 *       - Files
 *     responses:
*       '200':
*         description: Successfully retrieved file upload
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
        const fileId = searchParams.get("id");

        if (!fileId) {
            return StandardResponse(false, "Invalid data. Please provide a File ID");
        }

        const file = await prisma.fileUploads.findUnique({
            where: {
                id: fileId
            },
            include: {
                metaData: true
            }
        })

        return StandardResponse(true, "", file ?? []);
    } catch (e) {
        console.log("Error: ", e);
        return StandardResponse(false, "An error occurred");
    }
}
