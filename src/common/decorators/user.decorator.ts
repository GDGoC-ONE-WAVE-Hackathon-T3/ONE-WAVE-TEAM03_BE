import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        // 헤더나 쿼리로 보낸 userId를 바로 반환
        return request.headers['x-user-id'];
    },
);
