import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import {
    GenerateCodeReviewInput,
    GenerateCodeReviewOutput,
    GenerateFinalAssessmentInput,
    GenerateFinalAssessmentOutput,
} from './dto/ai.dto';

@Injectable()
export class AiService {
    private readonly logger = new Logger(AiService.name);
    private genAI: GoogleGenerativeAI;
    private model: any;

    constructor(private readonly configService: ConfigService) {
        const apiKey = this.configService.get<string>('GEMINI_API_KEY');
        if (apiKey) {
            this.genAI = new GoogleGenerativeAI(apiKey);
            this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash', });
        } else {
            this.logger.warn(
                'GEMINI_API_KEY is not set. AiService will fail if called.',
            );
        }
    }

    async generateCodeReview(
        input: GenerateCodeReviewInput,
    ): Promise<GenerateCodeReviewOutput> {
        this.logger.log('Requesting Gemini Code Review...');
        const { missionDesc, solutionDiff, userDiff } = input;

        if (!this.model) {
            throw new Error('GEMINI_API_KEY is missing');
        }

        const prompt = `
You are a Senior Technical Reviewer. Your goal is to review a user's code submission against a "Hidden Solution" for a specific mission.

**Mission Description:**
${missionDesc}

**Golden Solution Diff (Answer Key):**
${solutionDiff}

**User's Submission Diff:**
${userDiff}

**Instructions:**
1. Analyze if the User's submission solves the mission correctly, comparing it to the Golden Solution.
2. If the user's code is correct (functionally equivalent to the solution or better), set "isPassed" to true.
3. If the user's code is incorrect, incomplete, or has critical bugs, set "isPassed" to false.
4. **Feedback Guidelines:**
    - Language: Korean (한국어).
    - If "isPassed" is true: Provide a compliment and briefly mention what they did well.
    - If "isPassed" is false: Provide specific hints about what is missing or wrong without revealing the exact code answer. Focus on the concept or logic error.

**Output Format:**
Return ONLY a JSON object in the following format (no markdown code blocks):
{
  "isPassed": boolean,
  "feedback": "string"
}
    `;

        try {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            // Clean up markdown code blocks if Gemini wraps json in them
            const cleanedText = text
                .replace(/```json/g, '')
                .replace(/```/g, '')
                .trim();
            const parsed = JSON.parse(cleanedText);

            return {
                isPassed: parsed.isPassed,
                feedback: parsed.feedback,
            };
        } catch (error) {
            this.logger.error('Gemini API Error', error);
            return {
                isPassed: false,
                feedback:
                    'AI 리뷰 서비스를 일시적으로 사용할 수 없습니다. 나중에 다시 시도해주세요.',
            };
        }
    }

    async generateFinalAssessment(
        input: GenerateFinalAssessmentInput,
    ): Promise<GenerateFinalAssessmentOutput> {
        this.logger.log('Requesting Gemini Final Assessment...');
        const { missionDesc, solutionDiff, userDiff } = input;

        if (!this.model) {
            throw new Error('GEMINI_API_KEY is missing');
        }

        const prompt = `
You are a Senior Tech Lead writing a final assessment report for a junior developer who has successfully completed a task.

**Mission Description:**
${missionDesc}

**Golden Solution Diff:**
${solutionDiff}

**User's Submission Diff:**
${userDiff}

**Instructions:**
1. Provide a comprehensive summary of the user's approach compared to the ideal solution.
2. Highlight Pros (Good practices, clean code) and Cons (Potential optimizations, style issues).
3. The tone should be professional and encouraging.
4. **Language: Korean (한국어)**.
5. Use the following Markdown structure:

# 최종 코드 평가

## 장점
- (List pros)

## 단점
- (List cons)

## 총평
(Summary paragraph)
    `;

        try {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            return { assessmentReport: response.text() };
        } catch (error) {
            this.logger.error('Gemini API Assessment Error', error);
            return {
                assessmentReport:
                    '# 최종 평가 생성을 실패했습니다.\n\n나중에 다시 시도해주세요.',
            };
        }
    }
}
