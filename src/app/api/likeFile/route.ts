/* eslint-disable @typescript-eslint/no-unsafe-call */
import { checkPermissions } from "~/lib/permissions";
import prisma from "~/lib/prisma";
import { StandardResponse } from "~/lib/utils";

interface LikeRequest {
    fileId: string
}

export async function PUT(request: Request) {
    try {
        //#region Check permissions
        const permission = await checkPermissions(request);
        if (permission.valid === false) {
            return StandardResponse(false, permission.message);
        }
        //#endregion

        
        const data: LikeRequest = await request.json();

        if (!data.fileId ) {
            return StandardResponse(false, "Invalid data. Please provide the ID of the file you want to like");
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
                likes: {
                    increment: 1
                }
            }
        })

        // If the user does have the correct role, execute the action
        return StandardResponse(true, "File liked successfully");
    } catch (e) {
        console.log("Error: ", e);
        return StandardResponse(false, "An error occurred");
    }
}
