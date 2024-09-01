export interface PasswordHashResponse {
    hash: string;
    salt: string;
}

export interface CustomResponse {
    success: boolean;
    message: string;
    data?: object;
}