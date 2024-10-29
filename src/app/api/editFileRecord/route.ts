/* eslint-disable @typescript-eslint/no-unsafe-call */
import { type FileUploadStatus } from "@prisma/client";
import { checkPermissions } from "~/lib/permissions";
import prisma from "~/lib/prisma";
import { StandardResponse } from "~/lib/utils";

interface UpdateRequest {
    id: string;
    status?: FileUploadStatus
    url?: string;
    size?: number;
    type?: string;
    name?: string;
    comments?: string;
    reported?: boolean;
    display?: boolean;

    // Metadata
    metaData?: {
        subject: string;
        tags: string[];
        grade: number;
    }
}

/**
 * @swagger
 * /api/editFileRecord:
 *   post:
 *     summary: Edit a file record
 *     description: Updates an existing file record and returns a standard response
 *     tags:
 *       - Files
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 description: The unique identifier of the file record to update
 *                 example: 507f1f77bcf86cd799439011
 *               status:
 *                 type: string
 *                 description: The current status of the file upload
 *                 example: PENDING
 *               url:
 *                 type: string
 *                 description: The updated URL of the file
 *                 example: https://example.com/updated-file.pdf
 *               size:
 *                 type: number
 *                 description: The updated size of the file in bytes
 *                 example: 305600
 *               type:
 *                 type: string
 *                 description: The updated file type (e.g., pdf, doc, etc.)
 *                 example: doc
 *               name:
 *                 type: string
 *                 description: The updated name of the file
 *                 example: Updated File Name
 *               comments:
 *                 type: string
 *                 description: Any comments or notes about the file
 *                 example: Updated due to new guidelines
 *               reported:
 *                 type: boolean
 *                 description: Whether the file has been reported
 *                 example: false
 *               display:
 *                 type: boolean
 *                 description: Whether the file should be displayed
 *                 example: true
 *     responses:
 *       '200':
 *         description: File record updated successfully
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
 *                   example: Record updated successfully!
 */

export async function PUT(request: Request) {
    try {
        //#region Check permissions
        const permission = await checkPermissions(request);
        if (permission.valid === false) {
            return StandardResponse(false, permission.message);
        }
        //#endregion

        
        const data: UpdateRequest = await request.json();

        if (!data.id) {
            return StandardResponse(false, "Invalid data. Please provide the ID of the record you want to update");
        }

        // Fetch the file record from the database
        const record = await prisma.fileUploads.findUnique({
            where: {
                id: data.id
            }
        });

        if (!record) {
            return StandardResponse(false, "Record not found. Please provide a valid ID");
        }

        // Check if data was provided to update the record
        const isValidData = !data.status && !data.url && !data.size && !data.type && !data.name && !data.comments && !data.reported && !data.display;
        if (isValidData) {
            return StandardResponse(false, "No data provided to update the record. Please provide the data you want to update");
        }

        // Update the record in the database
        // The elipsis operator is used to only update the fields that were provided
        // If a field was not provided, it will not be updated
        const updatedRecord = await prisma.fileUploads.update({
            where: {
                id: data.id
            },
            data: {
                ...(data.status && { status: data.status }),
                ...(data.url && { url: data.url }),
                ...(data.size && { size: data.size }),
                ...(data.type && { type: data.type }),
                ...(data.name && { name: data.name }),
                ...(data.comments && { comments: data.comments }),
                ...(data.reported && { reported: data.reported }),
                ...(data.display && { display: data.display }),
            }
        });

        // If the metadata was provided, update the metadata
        console.log("Metadata: ", data.metaData);
        if (data.metaData) {
            await prisma.metaData.update({
                where: {
                    fileId: data.id
                },
                data: {
                    ...(data.metaData.subject && { subject: data.metaData.subject }),
                    ...(data.metaData.tags && { tags: data.metaData.tags }),
                    ...(data.metaData.grade && { grade: Number(data.metaData.grade) }),
                }
            });
        }

        // If the user does have the correct role, execute the action
        return StandardResponse(true, "Record updated successfully!", updatedRecord);
    } catch (e) {
        console.log("Error: ", e);
        return StandardResponse(false, "An error occurred");
    }
}