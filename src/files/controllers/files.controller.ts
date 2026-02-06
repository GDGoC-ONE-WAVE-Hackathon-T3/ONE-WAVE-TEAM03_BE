import {
    Controller,
    Post,
    UploadedFile,
    UseInterceptors,
    Get,
    Logger,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags, ApiResponse } from '@nestjs/swagger';
import { FilesService } from '../services/files.service';
import { FileUploadResponseDto } from '../dto/response/file-upload.response.dto';

@ApiTags('Keys')
@Controller('files')
export class FilesController {
    private readonly logger = new Logger(FilesController.name);

    constructor(private readonly filesService: FilesService) { }

    @Post('upload')
    @ApiOperation({ summary: 'S3에 파일 업로드' })
    @ApiConsumes('multipart/form-data')
    @ApiResponse({
        status: 201,
        description: 'File Uploaded Successfully',
        type: FileUploadResponseDto,
    })
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
    @UseInterceptors(FileInterceptor('file'))
    uploadFile(@UploadedFile() file: Express.MulterS3.File): FileUploadResponseDto {
        return new FileUploadResponseDto({
            url: file.location,
            key: file.key,
        });
    }

    // Smoke Test Endpoint
    @ApiOperation({ summary: 'Smoke Test' })
    @ApiResponse({ status: 200, description: 'OK' })
    @Get('admin/test')
    async smokeTest(): Promise<string> {
        return 'OK';
    }
}
