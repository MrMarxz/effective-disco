/* eslint-disable @typescript-eslint/no-unsafe-call */
import prisma from "~/lib/prisma";
import { StandardResponse } from "~/lib/utils";

interface RateRequest {
    fileId: string
    rating: number
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

        
        const data: RateRequest = await request.json();

        if (!data.fileId ) {
            return StandardResponse(false, "Invalid data. Please provide the ID of the file you want to rate");
        }

        if (!data.rating) {
            return StandardResponse(false, "Invalid data. Please provide a rating for the file.");
        }

        if (data.rating < 1 || data.rating > 5) {
            return StandardResponse(false, "Invalid rating. Please provide a rating between 1 and 5");
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
                rating: data.rating
            }
        })

        // If the user does have the correct role, execute the action
        return StandardResponse(true, "File rated successfully");
    } catch (e) {
        console.log("Error: ", e);
        return StandardResponse(false, "An error occurred");
    }
}
