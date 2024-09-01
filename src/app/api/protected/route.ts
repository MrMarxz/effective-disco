import prisma from "~/lib/prisma";
import { StandardResponse, validateUser } from "~/lib/utils";
import { getServerAuthSession } from "~/server/auth";

export async function POST(request: Request) {
    try {
        const session = await getServerAuthSession();
        if (!session) {
            // throw new Error("Not authenticated");
            return StandardResponse(false, "Not authenticated");
        }

        // Check if the user has permission to execute this action
        const userId = session.user.id;
        const isValidUser = await validateUser(userId);
        if (!isValidUser) {
            return StandardResponse(false, "You do not have permission to execute this action");
        }

        // If the user does have the correct role, execute the action
        return StandardResponse(true, "You have permission to execute this action");
    } catch (e) {
        console.log("Error: ", e);
        return StandardResponse(false, "An error occurred");
    }
}
