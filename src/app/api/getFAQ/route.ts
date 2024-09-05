import prisma from "~/lib/prisma";
import { StandardResponse } from "~/lib/utils";

export async function GET() {
    try {
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
