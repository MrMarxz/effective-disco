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

        // Get the data from the database
        const faq = await prisma.fAQ.findMany({
            take: 5,
            select: {
                question: true,
                answer: true,
            }
        });
        return StandardResponse(true, "", faq ?? []);
    } catch (e) {
        console.log("Error: ", e);
        return StandardResponse(false, "An error occurred");
    }
}
