/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import prisma from "~/lib/prisma";
import { RoleEnum } from "@prisma/client";
import { getServerAuthSession } from "~/server/auth";
import jwt from 'jsonwebtoken';

//#region Allowed routes for each role. These should be closely monitored and updated as needed
const openRoutes: string[] = [
    "/getFAQ",
];

const allowedUserCalls: string[] = [
    "/createFileRecord",
    "/editFileRecord",
    "/likeFile",
    "/searchFile",
    "/getUserFiles",
    "/toggleVisibility",
    "/reportFile",
    "/getCommunityFiles",
    "/getFile",
    "/getProfile",
    "/editProfile",
];

const allowedAdminCalls: string[] = [
    "/createFileRecord",
    "/editFileRecord",
    "/likeFile",
    "/rateFile",
    "/searchFile",
    "/getUserFiles",
    "/toggleVisibility",
    "/reportFile",
    "/getCommunityFiles",
    "/getFile",
    "/getProfile",
    "/editProfile",
    "/getFilteredFiles",
    "/changeUserRole",
];

const allowedEducatorCalls: string[] = [
    "/createFileRecord",
    "/editFileRecord",
    "/likeFile",
    "/rateFile",
    "/searchFile",
    "/getUserFiles",
    "/toggleVisibility",
    "/reportFile",
    "/getCommunityFiles",
    "/getFile",
    "/getProfile",
    "/editProfile",
    "/getFilteredFiles",
];
//#endregion

// Interface for the response of the permission validation
export interface PermissionResponse {
    valid: boolean;
    message: string;
    userId: string;
}

// Pre-defined messages for the permission validation
const permissionMessages = {
    userNotFound: "User not found. Please make sure you are logged in.",
    roleNotFound: "User role not found. Please provide a valid role",
    routeNotFound: "Route not found. Make sure you provide a valid route that exists",
    invalidRole: "Invalid role. Please provide a valid role",
    noPermission: (role: RoleEnum) => `You do not have permission to execute this action as a ${role}`,
    success: "Permission granted",
    tokenMissing: "Token missing. Please provide a valid token in the headers",
}


/**
 * Validates if a user has permission to execute an action
 * @param userId The id of the user
 * @param route The route the user is trying to access
 * @returns An object with a boolean value and a message
 */
export const checkPermissions = async (request: Request): Promise<PermissionResponse> => {
    console.log("CHECKING PERMISSIONS");

    // Extract the route from the request
    const url = new URL(request.url);
    const pathname = url.pathname;
    const routeParts = pathname.split("/");
    const route = `/${routeParts[routeParts.length - 1]}`;

    // Check if the request is an open route. All users can access these routes
    if (openRoutes.includes(route)) {
        return {
            valid: true,
            message: permissionMessages.success,
            userId: "",
        };
    }


    //#region Session Management
    const session = await getServerAuthSession();
    const userId = session?.user.id;
    //#endregion


    if (!userId) {
        return {
            valid: false,
            message: permissionMessages.userNotFound,
            userId: "",
        };
    }

    if (!route) {
        return {
            valid: false,
            message: permissionMessages.routeNotFound,
            userId: "",
        };
    }

    // Find the user in the database
    const user = await prisma.user.findUnique({
        where: {
            id: userId
        },
        select: {
            role: true
        }
    });

    if (!user) {
        return {
            valid: false,
            message: permissionMessages.userNotFound,
            userId: "",
        };
    }

    // Check if the user has permission to execute the action
    switch (user.role.name) {
        case RoleEnum.USER:
            if (!allowedUserCalls.includes(route)) {
                return {
                    valid: false,
                    message: permissionMessages.noPermission(RoleEnum.USER),
                    userId: "",
                };
            }
            break;
        case RoleEnum.ADMIN:
            if (!allowedAdminCalls.includes(route)) {
                return {
                    valid: false,
                    message: permissionMessages.noPermission(RoleEnum.ADMIN),
                    userId: "",
                };
            }
            break;
        case RoleEnum.EDUCATOR:
            if (!allowedEducatorCalls.includes(route)) {
                return {
                    valid: false,
                    message: permissionMessages.noPermission(RoleEnum.EDUCATOR),
                    userId: "",
                };
            }
            break;
        default:
            return {
                valid: false,
                message: permissionMessages.invalidRole,
                userId: "",
            };
    }

    // If all checks pass, return valid
    return {
        valid: true,
        message: permissionMessages.success,
        userId: userId,
    };
}
