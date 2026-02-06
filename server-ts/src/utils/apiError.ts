interface ICustomAPIError {
    statusCode: number;
    errorCode: string;
    message: string;
}

export class CustomAPIError extends Error implements ICustomAPIError {
    
    public statusCode: number;
    public errorCode: string;
    
    constructor(message: string, statusCode: number, errorCode: string) {
        super(message);
        this.statusCode = statusCode;
        this.errorCode = errorCode;
    }

    static createErrorClass(
        statusCode: number,
        errorCode: string,
        defaultMessage: string = process.env.NODE_ENV === "production"
            ? "An error occurred"
            : "Internal Server Error"
    ) {
        return class extends CustomAPIError implements ICustomAPIError {
            constructor(message: string = defaultMessage) {
                super(message, statusCode, errorCode);
            }
        };
    }
}

export const NotFoundError = CustomAPIError.createErrorClass(
    404,
    "NOT_FOUND",
    "Resource not found"
);

export const InternalServerError = CustomAPIError.createErrorClass(
    500,
    "INTERNAL_SERVER_ERROR",
    "Internal server error"
);

export const NotAuthenticatedError = CustomAPIError.createErrorClass(
    401,
    "NOT_AUTHENTICATED",
    "User not authenticated"
);

export const NotAuthorizedError = CustomAPIError.createErrorClass(
    401,
    "NOT_AUTHORIZED",
    "User not authorized"
);

export const PermissionDeniedError = CustomAPIError.createErrorClass(
    403,
    "PERMISSION_DENIED",
    "Permission denied"
);

export const BadRequestError = CustomAPIError.createErrorClass(
    400,
    "BAD_REQUEST",
    "Bad request"
);

export const TooManyRequestsError = CustomAPIError.createErrorClass(
    429,
    "TOO_MANY_REQUESTS",
    "Too many requests - please try again later"
);
