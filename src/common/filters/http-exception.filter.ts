import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { BaseException } from '../exception/base.exception';
import { ERROR_CODES, ErrorCode } from '../constants/error-codes';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(HttpExceptionFilter.name);

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Internal Server Error';
        let errorCode: ErrorCode = ERROR_CODES.INTERNAL_SERVER_ERROR;

        if (exception instanceof BaseException) {
            status = exception.getStatus();
            message = exception.message;
            errorCode = exception.errorCode;
        } else if (exception instanceof HttpException) {
            status = exception.getStatus();
            const responseBody = exception.getResponse();
            message =
                typeof responseBody === 'object' && 'message' in responseBody
                    ? (responseBody as any).message
                    : exception.message;
            errorCode = ERROR_CODES.INVALID_INPUT; // Default validation error or other http errors
        } else {
            this.logger.error(exception);
        }

        response.status(status).json({
            statusCode: status,
            errorCode,
            message,
            timestamp: new Date().toISOString(),
            path: request.url,
        });
    }
}
