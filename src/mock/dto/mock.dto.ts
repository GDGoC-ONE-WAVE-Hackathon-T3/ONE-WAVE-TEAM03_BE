import { ApiProperty } from '@nestjs/swagger';

export class MockAiFeedbackResponseDto {
    @ApiProperty({ example: true })
    isPassed: boolean;

    @ApiProperty({ example: '좋은 코드입니다! 다만 변수명을 더 명확하게 지으면 좋을 것 같아요.' })
    feedback: string;
}

export class MockDiffResponseDto {
    @ApiProperty({ example: 'diff --git a/src/main.ts b/src/main.ts\nindex 123..456 100644\n--- a/src/main.ts\n+++ b/src/main.ts\n@@ -1,5 +1,5 @@\n- console.log("Hello");\n+ console.log("Hello World");' })
    diff: string;
}

export class MockWorkflowStatusResponseDto {
    @ApiProperty({ example: 'IN_PROGRESS', description: 'IN_PROGRESS | RESOLVED | NOT_INSTALLED' })
    status: string;

    @ApiProperty({ example: '봇이 설치되지 않았습니다.', required: false })
    message?: string;

    @ApiProperty({ example: '# 최종 평가\n\n훌륭합니다!', required: false })
    finalAssessment?: string;
}
