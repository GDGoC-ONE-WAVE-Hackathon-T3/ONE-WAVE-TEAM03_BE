import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function swaggerConfig(app: INestApplication) {
    const config = new DocumentBuilder()
        .setTitle('One Wave API')
        .setDescription('One Wave 3팀 해커톤 API 문서입니다.')
        .setVersion('1.0')
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api-docs', app, document);
}
