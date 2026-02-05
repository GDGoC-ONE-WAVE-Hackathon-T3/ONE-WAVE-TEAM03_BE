import {
    Controller,
    Post,
    UploadedFile,
    UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FilesService } from '../services/files.service';

@ApiTags('Files')
@Controller('files')
export class FilesController {
    constructor(private readonly filesService: FilesService) { }

    @Post('upload')
    @ApiOperation({ summary: 'S3에 파일 업로드' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    })
    @UseInterceptors(FileInterceptor('file')) // Storage strategy injected via Module? No, need to pass options here or register globally/locally.
    // NestJS FileInterceptor doesn't take the service instance directly easily. 
    // We need to register the MulterModule.registerAsync in the module.
    uploadFile(@UploadedFile() file: Express.MulterS3.File) {
        // If registered correctly, file will be uploaded to S3 and info available here
        return {
            url: file.location,
            key: file.key,
        };
    }
}
