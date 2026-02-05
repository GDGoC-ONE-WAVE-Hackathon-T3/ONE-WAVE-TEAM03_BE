import { HttpException } from '@nestjs/common';
import { ErrorCode } from '../constants/error-codes';

export class BaseException extends HttpException {
    constructor(
        public readonly errorCode: ErrorCode,
        message: string,
        statusCode: number,
    ) {
        super({ errorCode, message }, statusCode);
    }
}
