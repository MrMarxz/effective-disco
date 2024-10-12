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

        const { searchParams } = new URL(request.url);
        const fileId = searchParams.get("id");

        if (!fileId) {
            return StandardResponse(false, "Invalid data. Please provide a File ID");
        }

        const file = await prisma.fileUploads.findUnique({
            where: {
                id: fileId
            },
            include: {
                metaData: true
            }
        })

        return StandardResponse(true, "", file ?? []);
    } catch (e) {
        console.log("Error: ", e);
        return StandardResponse(false, "An error occurred");
    }
}
