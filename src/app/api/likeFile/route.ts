/* eslint-disable @typescript-eslint/no-unsafe-call */
import prisma from "~/lib/prisma";
import { StandardResponse } from "~/lib/utils";

interface LikeRequest {
    fileId: string
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
