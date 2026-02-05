import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client } from '@aws-sdk/client-s3';
import multerS3 from 'multer-s3';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';

@Injectable()
export class FilesService {
    private s3: S3Client;

    constructor(private readonly configService: ConfigService) {
        this.s3 = new S3Client({
            region: this.configService.get<string>('AWS_REGION'),
            credentials: {
                accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID') || '',
                secretAccessKey: this.configService.get<string>(
                    'AWS_SECRET_ACCESS_KEY',
                ) || '',
            },
        });
    }

    getMulterOptions(): MulterOptions {
        return {
            storage: multerS3({
                s3: this.s3,
                bucket: this.configService.get<string>('AWS_S3_BUCKET_NAME') || '',
                acl: 'public-read', // Assuming public access based on docs instructions
                contentType: multerS3.AUTO_CONTENT_TYPE,
                key: (req, file, cb) => {
                    const uniqueSuffix =
                        Date.now() + '-' + Math.round(Math.random() * 1e9);
                    const ext = file.originalname.split('.').pop();
                    cb(null, `uploads/${uniqueSuffix}.${ext}`);
                },
            }),
            limits: {
                fileSize: 5 * 1024 * 1024, // 5MB limit
            },
        };
    }
}
