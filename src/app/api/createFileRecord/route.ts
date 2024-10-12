/* eslint-disable @typescript-eslint/no-unsafe-call */
import { checkPermissions } from "~/lib/permissions";
import prisma from "~/lib/prisma";
import { StandardResponse } from "~/lib/utils";
import { UTApi } from "uploadthing/server";
import fs from "fs/promises";
import path from "path";
import { AddWatermarkToImage, AddWaterToPDF } from "~/lib/file-manager";
import { getServerAuthSession } from "~/server/auth";

interface RecordRequest {
    // url: string;
    // size: number;
    // type: string;
    // name: string;
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               files:
 *                 type: string
 *                 format: binary
 *                 description: The file to be uploaded
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
        const session = await getServerAuthSession();
        if (!session) {
            return StandardResponse(false, "Not authenticated");
        }
        const userId = session.user.id;
        // const userId = permission.userId;

        //* The purpose of this call is to create a new record in the database for a file that has been uploaded *\\
        // Get the data from the request
        // const data: RecordRequest = await request.json();

        const body = await request.formData();
        const files = body.getAll("files") as unknown as File[];
        const subject = body.get("subject") as string;

        const grade = body.get("grade") as string;
        const gradeNumber = parseInt(grade);
        
        const tags = body.getAll("tags") as string[];

        console.log("Subject: ", subject);
        console.log("Grade: ", grade);
        console.log("Tags: ", tags);

        if (!subject || !grade || !gradeNumber || !tags) {
            return StandardResponse(false, "Invalid data. Please provide all the required fields");
        }
        

        console.log("Files: ", files);

        // Sort out images from pdfs
        const images = files.filter(file => file.type.startsWith("image"));
        const pdfs = files.filter(file => file.type === "application/pdf");

        // Add the watermark to all the files
        const watermarkedImages = await AddWatermarkToImage(images);
        const watermarkedPdfs = await AddWaterToPDF(pdfs);

        if (watermarkedImages.length === 0 && watermarkedPdfs.length === 0) {
            return StandardResponse(false, "No files were uploaded. Please provide images or PDFs");
        }

        const watermarkedFiles = [...watermarkedImages, ...watermarkedPdfs];

        // Upload files to uploadthing
        const utapi = new UTApi();
        const uploadResponse = await utapi.uploadFiles(watermarkedFiles);

        // Only take the first file for now
        const fileData = uploadResponse[0]?.data
        const fileUrl = fileData?.url;
        const fileSize = fileData?.size;
        const fileType = fileData?.type;
        const fileName = fileData?.name;

        if (!fileUrl || !fileSize || !fileType || !fileName) {
            return StandardResponse(false, "An error occurred while uploading the file. Please try again");
        }


        // // Check if the data is valid
        // if (!data.url || !data.size || !data.type || !data.name) {
        //     return StandardResponse(false, "Invalid data");
        // }

        // Create a new record in the database
        const record = await prisma.fileUploads.create({
            data: {
                url: fileUrl,
                size: fileSize,
                type: fileType,
                name: fileName,
                userId: userId,
            },
        });

        const metadata = await prisma.metaData.create({
            data: {
                subject: subject,
                grade: gradeNumber,
                tags: tags,
                fileId: record.id,
            },
        });


        // If the user does have the correct role, execute the action
        return StandardResponse(true, "Record created successfully", uploadResponse);
    } catch (e) {
        console.log("Error: ", e);
        return StandardResponse(false, "An error occurred");
    }
}
