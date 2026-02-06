import { ApiProperty } from '@nestjs/swagger';

export class FileUploadResponseDto {
    @ApiProperty({ description: 'The URL of the uploaded file' })
    url: string;

    @ApiProperty({ description: 'The key of the uploaded file in the bucket' })
    key: string;

    constructor(partial: Partial<FileUploadResponseDto>) {
        Object.assign(this, partial);
    }
}
