import { FileUploadStatus } from "@prisma/client";
import { checkPermissions } from "~/lib/permissions";
import prisma from "~/lib/prisma";
import { StandardResponse } from "~/lib/utils";

export async function GET(request: Request) {
    try {
        //#region Check permissions
        const permission = await checkPermissions(request);
        if (permission.valid === false) {
            return StandardResponse(false, permission.message);
        }
        //#endregion
        
        const { searchParams } = new URL(request.url);
        const query = searchParams.get("query");

        if (!query) {
            return StandardResponse(false, "Invalid data. Please provide a search query");
        }

        // Search for files that match the query
        // We are searching based on the file name, url, type, subject and tags
        // We are also filtering out files that have been reported or rejected
        const matchingFiles = await prisma.fileUploads.findMany({
            where: {
                reported: false,
                status: { not: FileUploadStatus.REJECTED },
                OR: [
                    {
                        name: {
                            contains: query,
                            mode: 'insensitive'
                        }
                    },
                    {
                        url: {
                            contains: query,
                            mode: 'insensitive'
                        }
                    },
                    {
                        type: {
                            contains: query,
                            mode: 'insensitive'
                        }
                    },
                    {
                        metaData: {
                            OR: [
                                {
                                    subject: {
                                        contains: query,
                                        mode: 'insensitive'
                                    }
                                },
                                {
                                    tags: {
                                        hasSome: [query]
                                    }
                                }
                            ]
                        }
                    }
                ]
            }
        });
        return StandardResponse(true, "", matchingFiles);
    } catch (e) {
        console.log("Error: ", e);
        return StandardResponse(false, "An error occurred");
    }
}
