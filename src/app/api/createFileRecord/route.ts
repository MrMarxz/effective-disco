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
