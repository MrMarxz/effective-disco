import { checkPermissions } from "~/lib/permissions";
import prisma from "~/lib/prisma";
import { StandardResponse } from "~/lib/utils";

/**
 * @swagger
 * /api/getProfile:
 *   get:
 *     summary: Get the user's profile
 *     description: Retrieve the user's profile information
 *     tags:
 *       - Profile
*     responses:
*       '200':
*         description: Successfully retrieved user information
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 id:
*                   type: string
*                   description: The unique identifier for the user
*                   example: cljk2c0z80000qwer1234abcd
*                 name:
*                   type: string
*                   description: The user's first name
*                   example: John
*                 surname:
*                   type: string
*                   description: The user's last name
*                   example: Doe
*                 email:
*                   type: string
*                   description: The user's email address
*                   example: john.doe@example.com
*                 roleId:
*                   type: string
*                   description: The ID of the user's role
*                   example: role123
*                 active:
*                   type: boolean
*                   description: Whether the user account is active
*                   example: true
*                 createdAt:
*                   type: string
*                   format: date-time
*                   description: The timestamp when the user account was created
*                   example: 2023-06-15T10:30:00Z
*                 updatedAt:
*                   type: string
*                   format: date-time
*                   description: The timestamp when the user account was last updated
*                   example: 2023-06-16T14:45:00Z
*                 affiliation:
*                   type: string
*                   nullable: true
*                   description: The user's affiliation
*                   example: University of Example
*                 credentials:
*                   type: string
*                   nullable: true
*                   description: The user's credentials
*                   example: PhD in Computer Science
 */

export async function GET(request: Request) {
    try {
        //#region Check permissions
        const permission = await checkPermissions(request);
        if (permission.valid === false) {
            return StandardResponse(false, permission.message);
        }
        //#endregion

        const user = await prisma.user.findFirst({
            where: {
                id: permission.userId,
            },
            select: {
                id: true,
                name: true,
                surname: true,
                email: true,
                roleId: true,
                role: true,
                active: true,
                createdAt: true,
                updatedAt: true,
                affiliation: true,
                credentials: true,
            }
        });
        
        return StandardResponse(true, "", user ?? []);
    } catch (e) {
        console.log("Error: ", e);
        return StandardResponse(false, "An error occurred");
    }
}
