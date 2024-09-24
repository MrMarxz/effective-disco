/* eslint-disable @typescript-eslint/no-unsafe-call */
import { checkPermissions } from "~/lib/permissions";
import prisma from "~/lib/prisma";
import { StandardResponse } from "~/lib/utils";
import { getServerAuthSession } from "~/server/auth";

interface RecordRequest {
    url: string;
    size: number;
    type: string;
    name: string;
    subject: string;
    grade: number;
    tags: string[];
}

/**
 * @swagger
 * /api/createFileRecord:
 *   post:
 *     summary: Create a file record
 *     description: Creates a new file record and returns a standard response
 *     tags:
 *       - File Records
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               url:
 *                 type: string
 *                 description: The URL of the file
 *                 example: https://example.com/file.pdf
 *               size:
 *                 type: number
 *                 description: The size of the file in bytes
 *                 example: 204800
 *               type:
 *                 type: string
 *                 description: The file type (e.g., pdf, doc, etc.)
 *                 example: pdf
 *               name:
 *                 type: string
 *                 description: The name of the file
 *                 example: Example File
 *               subject:
 *                 type: string
 *                 description: The subject related to the file
 *                 example: Mathematics
 *               grade:
 *                 type: number
 *                 description: The grade level associated with the file
 *                 example: 12
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: A list of tags related to the file
 *                 example: ["exam", "final", "2024"]
 *     responses:
 *       '200':
 *         description: File record created successfully
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
 *                   example: File record created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     recordId:
 *                       type: string
 *                       description: The unique identifier for the created file record
 *                       example: 507f1f77bcf86cd799439011
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
        // const session = await getServerAuthSession();
        // if (!session) {
        //     return StandardResponse(false, "Not authenticated");
        // }
        // const userId = session.user.id;
        const userId = permission.userId;

        //* The purpose of this call is to create a new record in the database for a file that has been uploaded *\\
        // Get the data from the request
        const data: RecordRequest = await request.json();

        // Check if the data is valid
        if (!data.url || !data.size || !data.type || !data.name) {
            return StandardResponse(false, "Invalid data");
        }

        // Create a new record in the database
        const record = await prisma.fileUploads.create({
            data: {
                url: data.url,
                size: data.size,
                type: data.type,
                name: data.name,
                userId: userId,
            },
        });

        const metadata = await prisma.metaData.create({
            data: {
                subject: data.subject,
                grade: data.grade,
                tags: data.tags,
                fileId: record.id,
            },
        });



        // If the user does have the correct role, execute the action
        return StandardResponse(true, "Record created successfully", record);
    } catch (e) {
        console.log("Error: ", e);
        return StandardResponse(false, "An error occurred");
    }
}
