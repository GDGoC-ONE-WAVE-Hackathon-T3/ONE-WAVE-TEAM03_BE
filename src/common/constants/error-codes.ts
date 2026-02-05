export const ERROR_CODES = {
    // Common
    INTERNAL_SERVER_ERROR: 'COMMON_500_0',
    INVALID_INPUT: 'COMMON_400_0',

    // Users
    USER_NOT_FOUND: 'USER_404_0',
    USER_ALREADY_EXISTS: 'USER_409_0',
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];
