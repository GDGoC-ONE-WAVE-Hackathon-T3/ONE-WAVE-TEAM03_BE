import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { S3Client } from '@aws-sdk/client-s3';
import multerS3 from 'multer-s3';
import { FilesController } from './controllers/files.controller';
import { FilesService } from './services/files.service';

@Module({
    imports: [
        MulterModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => {
                const s3 = new S3Client({
                    region: configService.get<string>('AWS_REGION'),
                    credentials: {
                        accessKeyId: configService.get<string>('AWS_ACCESS_KEY_ID') || '',
                        secretAccessKey: configService.get<string>('AWS_SECRET_ACCESS_KEY') || '',
                    },
                });

                return {
                    storage: multerS3({
                        s3: s3,
                        bucket: configService.get<string>('AWS_S3_BUCKET_NAME') || '',
                        acl: 'public-read',
                        contentType: multerS3.AUTO_CONTENT_TYPE,
                        key: (req, file, cb) => {
                            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                            const ext = file.originalname.split('.').pop();
                            cb(null, `uploads/${uniqueSuffix}.${ext}`);
                        },
                    }),
                    limits: {
                        fileSize: 5 * 1024 * 1024,
                    },
                };
            },
        }),
    ],
    controllers: [FilesController],
    providers: [FilesService],
    exports: [FilesService],
})
export class FilesModule { }
