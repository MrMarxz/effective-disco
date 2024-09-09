/* eslint-disable @typescript-eslint/no-unsafe-call */
import { type FileUploadStatus } from "@prisma/client";
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
}

export async function PUT(request: Request) {
    try {
        // const session = await getServerAuthSession();
        // if (!session) {
        //     // throw new Error("Not authenticated");
        //     return StandardResponse(false, "Not authenticated");
        // }

        // Check if the user has permission to execute this action
        // const userId = session.user.id;
        // const isValidUser = await validateUser(userId, "/protected");
        // if (!isValidUser.valid) {
        //     return StandardResponse(false, isValidUser.message);
        // }

        
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

        // If the user does have the correct role, execute the action
        return StandardResponse(true, "Record updated successfully!", updatedRecord);
    } catch (e) {
        console.log("Error: ", e);
        return StandardResponse(false, "An error occurred");
    }
}