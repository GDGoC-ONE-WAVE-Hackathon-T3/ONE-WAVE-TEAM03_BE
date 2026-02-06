import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { ScheduleModule } from '@nestjs/schedule';
import { WebhookModule } from './webhook/webhook.module';
import { CodeReviewModule } from './review/code-review.module';
import { MockModule } from './mock/mock.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get<string>('DB_USERNAME', 'postgres'),
        password: configService.get<string>('DB_PASSWORD', 'postgres'),
        database: configService.get<string>('DB_DATABASE', 'onewave'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true, // Dev only
        logging: true,
        ssl: {
          rejectUnauthorized: false,
        },
      }),
    }),
    UsersModule,
    WebhookModule,
    CodeReviewModule,
    MockModule,
  ],
})
export class AppModule { }
