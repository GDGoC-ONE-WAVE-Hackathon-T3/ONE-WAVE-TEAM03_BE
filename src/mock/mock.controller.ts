import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
    MockAiFeedbackResponseDto,
    MockDiffResponseDto,
    MockWorkflowStatusResponseDto,
} from './dto/mock.dto';

@ApiTags('Mocks (Frontend Dev)')
@Controller('mocks')
export class MockController {
    @Get('ai/feedback')
    @ApiOperation({ summary: 'Mock AI Code Review Feedback' })
    @ApiResponse({ status: 200, type: MockAiFeedbackResponseDto })
    getAiFeedback(): MockAiFeedbackResponseDto {
        return {
            isPassed: false,
            feedback:
                '전반적으로 잘 작성하셨습니다. 하지만 에러 핸들링 부분이 조금 부족해 보입니다. try-catch 블록을 추가하여 예외 처리를 강화해보세요.',
        };
    }

    @Get('diff')
    @ApiOperation({ summary: 'Mock Code Diff' })
    @ApiResponse({ status: 200, type: MockDiffResponseDto })
    getDiff(): MockDiffResponseDto {
        return {
            diff: `diff --git a/src/app.service.ts b/src/app.service.ts
index 548c894..4776100 100644
--- a/src/app.service.ts
+++ b/src/app.service.ts
@@ -1,8 +1,8 @@
 import { Injectable } from '@nestjs/common';
 
 @Injectable()
 export class AppService {
   getHello(): string {
-    return 'Hello World!';
+    return 'Hello NestJS!';
   }
 }`,
        };
    }

    @Get('workflow/bot-not-installed')
    @ApiOperation({ summary: 'Mock Workflow: Bot Not Installed' })
    @ApiResponse({ status: 200, type: MockWorkflowStatusResponseDto })
    getBotNotInstalled(): MockWorkflowStatusResponseDto {
        return {
            status: 'NOT_INSTALLED',
            message: 'GitHub App이 아직 설치되지 않았습니다. 설치를 진행해주세요.',
        };
    }

    @Get('workflow/pr-pending')
    @ApiOperation({ summary: 'Mock Workflow: PR In Progress' })
    @ApiResponse({ status: 200, type: MockWorkflowStatusResponseDto })
    getPrPending(): MockWorkflowStatusResponseDto {
        return {
            status: 'IN_PROGRESS',
            message: 'PR이 생성되었으며, AI 리뷰가 진행 중입니다.',
        };
    }

    @Get('workflow/pr-completed')
    @ApiOperation({ summary: 'Mock Workflow: PR Completed (Resolved)' })
    @ApiResponse({ status: 200, type: MockWorkflowStatusResponseDto })
    getPrCompleted(): MockWorkflowStatusResponseDto {
        return {
            status: 'RESOLVED',
            finalAssessment: `# 최종 코드 평가

## 장점
- 코드가 매우 간결하고 가독성이 좋습니다.
- 변수 명명 규칙을 잘 준수했습니다.

## 단점
- 일부 함수에 타입 정의가 누락되었습니다.

## 총평
매우 훌륭한 시도였습니다! 다음 미션도 기대됩니다.`,
        };
    }
}