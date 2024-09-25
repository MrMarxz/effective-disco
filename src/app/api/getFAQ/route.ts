import { checkPermissions } from "~/lib/permissions";
import prisma from "~/lib/prisma";
import { StandardResponse } from "~/lib/utils";

/**
 * @swagger
 * /api/getFAQ:
 *   get:
 *     summary: Retrieve FAQs
 *     description: Returns a list of frequently asked questions and their answers
 *     tags:
 *       - FAQ
 *     responses:
 *       '200':
 *         description: Successfully retrieved FAQ list
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   question:
 *                     type: string
 *                     description: The FAQ question
 *                     example: What happens if my document is denied?
 *                   answer:
 *                     type: string
 *                     description: The answer to the FAQ
 *                     example: If your document is denied, you will receive feedback from the reviewing educator detailing the reason for rejection. You can revise and resubmit your document for further review.
 */

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
