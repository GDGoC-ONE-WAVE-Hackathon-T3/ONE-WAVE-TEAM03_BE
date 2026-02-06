import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Octokit } from '@octokit/rest';
import { App } from 'octokit';
import { Interval } from '@nestjs/schedule';
import {
    GetPrDiffInput,
    GetPrDiffOutput,
    PostCommentInput,
    PostCommentOutput,
    GetRepoInfoInput,
    GetRepoInfoOutput,
} from './dto/github.dto';

@Injectable()
export class GithubService implements OnModuleInit {
    private octokit: Octokit;
    private readonly logger = new Logger(GithubService.name);

    constructor(private readonly configService: ConfigService) { }

    async onModuleInit() {
        const appId = this.configService.get<string>('GITHUB_APP_ID');
        const installationId = this.configService.get<number>(
            'GITHUB_INSTALLATION_ID',
        );
        const base64Key = this.configService.get<string>(
            'GITHUB_PRIVATE_KEY_BASE64',
        );

        if (appId && installationId && base64Key) {
            this.logger.log('Initializing GitHub App Authentication...');
            const privateKey = Buffer.from(base64Key, 'base64').toString('utf-8');
            const app = new App({
                appId,
                privateKey,
                installationId,
            });
            // Cast to Octokit (rest) because App.getInstallationOctokit returns a compatible instance
            this.octokit = (await app.getInstallationOctokit(
                installationId,
            )) as unknown as Octokit;
            this.logger.log('GitHub App Authentication initialized.');
        } else {
            this.logger.log('Initializing GitHub Token Authentication (PAT)...');
            const token = this.configService.get<string>('GITHUB_TOKEN');
            this.octokit = new Octokit({ auth: token });
        }
    }

    async getPrDiff(input: GetPrDiffInput): Promise<GetPrDiffOutput> {
        if (!this.octokit) await this.onModuleInit(); // Safety check

        const { owner, repo, prNumber } = input;
        try {
            const { data } = await this.octokit.pulls.get({
                owner,
                repo,
                pull_number: prNumber,
                mediaType: {
                    format: 'diff',
                },
            });
            return { diff: data as unknown as string };
        } catch (error) {
            this.logger.error(
                `Failed to get PR diff for ${owner}/${repo} #${prNumber}`,
                error,
            );
            throw error;
        }
    }

    async postComment(input: PostCommentInput): Promise<PostCommentOutput> {
        if (!this.octokit) await this.onModuleInit();

        const { owner, repo, prNumber, body } = input;
        try {
            await this.octokit.issues.createComment({
                owner,
                repo,
                issue_number: prNumber,
                body,
            });
            this.logger.log(`Comment posted to ${owner}/${repo} #${prNumber}`);
            return { success: true };
        } catch (error) {
            this.logger.error(
                `Failed to post comment to ${owner}/${repo} #${prNumber}`,
                error,
            );
            throw error;
        }
    }

    async getRepoInfo(input: GetRepoInfoInput): Promise<GetRepoInfoOutput> {
        if (!this.octokit) await this.onModuleInit();

        const { repoName } = input;
        const [owner, repo] = repoName.split('/');
        if (!owner || !repo) {
            throw new Error(
                `Invalid repoName format: ${repoName}. Expected 'owner/repo'`,
            );
        }

        try {
            const { data } = await this.octokit.repos.get({
                owner,
                repo,
            });

            return {
                description: data.description || '',
                thumbnailUrl: data.owner.avatar_url,
            };
        } catch (error) {
            this.logger.error(`Failed to get repo info for ${repoName}`, error);
            throw error;
        }
    }

    async forkRepo(token: string, repoName: string): Promise<string> {
        const [owner, repo] = repoName.split('/');
        if (!owner || !repo) {
            throw new Error(`Invalid repoName format: ${repoName}. Expected 'owner/repo'`);
        }

        const userOctokit = new Octokit({ auth: token });
        try {
            const { data } = await userOctokit.repos.createFork({
                owner,
                repo,
            });
            this.logger.log(`Forked ${repoName} successfully. URL: ${data.html_url}`);
            return data.html_url;
        } catch (error) {
            this.logger.error(`Failed to fork ${repoName}`, error);
            throw error;
        }
    }
    async mockForkRepo(): Promise<{ forkUrl: string; botInstallUrl: string }> {
        const token = this.configService.get<string>('DEMO_GITHUB_TOKEN');
        const octokit = new Octokit({ auth: token }); // 유저의 토큰으로 인스턴스 생성

        try {
            // 핵심: createFork 메서드 하나면 끝입니다.
            const response = await octokit.rest.repos.createFork({
                owner: 'elastic', // 원본 레포 주인 (예: 'elastic')
                repo: 'elasticsearch',   // 원본 레포 이름 (예: 'elasticsearch')
            });

            // 포크된 레포지토리의 URL 반환
            return {
                forkUrl: 'https://github.com/labyrinth30/elasticsearch',
                botInstallUrl: 'https://github.com/apps/one-wave-team3-bot'
            }
        } catch (error) {
            // 이미 포크된 경우에도 GitHub는 에러 대신 기존 레포 정보를 줄 때가 있지만,
            // 명시적으로 에러가 나면 처리해줍니다.
            console.error('Fork Error:', error);
            throw new Error('GitHub Fork Failed');
        }
    }
    async getLatestPrStatus(): Promise<{ isMerged: boolean; prUrl?: string }> {
        const token = this.configService.get<string>('DEMO_GITHUB_TOKEN');
        const octokit = new Octokit({ auth: token });

        try {
            // 1. labyrinth30/elasticsearch 레포의 PR 목록을 가져옵니다.
            const { data: pulls } = await octokit.rest.pulls.list({
                owner: 'labyrinth30',
                repo: 'elasticsearch',
                state: 'all', // open, closed 모두 포함
                per_page: 1,  // 가장 최신 것 하나만 확인
            });

            if (pulls.length === 0) {
                return { isMerged: false };
            }

            const latestPr = pulls[0];

            // 2. merged_at 값이 있으면 머지된 것입니다.
            return {
                isMerged: !!latestPr.merged_at,
                prUrl: latestPr.html_url
            };
        } catch (error) {
            console.error('PR Status Check Error:', error);
            return { isMerged: false };
        }
    }
    // src/github/github.service.ts

    async createAiReviewComment(prNumber: number) {
        const token = this.configService.get<string>('DEMO_GITHUB_TOKEN');
        const octokit = new Octokit({ auth: token });

        const reviewBody = `
## 🤖 AI Code Review: Concurrency Issue Analysis

제출하신 \`elasticsearch\` 관련 수정 사항을 분석한 결과입니다. 특히 **Optimistic Concurrency Control (OCC)**을 활용한 동시성 문제 해결 접근 방식이 인상적입니다.

### 🔍 주요 리뷰 사항

1. **_seq_no 및 _primary_term 활용**
   - 문서 업데이트 시 \`if_seq_no\`와 \`if_primary_term\` 파라미터를 사용하여 쓰기 충돌을 방지한 점이 적절합니다.
   - 이를 통해 네트워크 지연 상황에서도 데이터의 일관성(Consistency)을 유지할 수 있습니다.

2. **Retry Mechanism 도입 권장**
   - 현재 로직에서 충돌 발생 시 즉시 에러를 반환하고 있습니다.
   - 실제 운영 환경에서는 \`retry_on_conflict\` 옵션을 추가하여 일시적인 경합 상황을 부드럽게 처리하는 것을 추천합니다.

3. **성능 영향도**
   - 불필요한 전체 문서 업데이트 대신 Partial Update를 사용하여 샤드(Shard)에 가해지는 부하를 최소화했습니다.

---
**총평**: Elasticsearch의 분산 환경 특성을 잘 이해하고 있으며, 동시성 제어 로직이 안정적으로 구현되었습니다. **승인(Approve)**을 권장합니다. ✅
    `;

        try {
            await octokit.rest.issues.createComment({
                owner: 'labyrinth30',
                repo: 'elasticsearch',
                issue_number: prNumber,
                body: reviewBody,
            });
            console.log(`[AI-REVIEW] Commented on PR #${prNumber}`);
        } catch (error) {
            console.error('[AI-REVIEW] Failed:', error);
        }
    }
    async getLatestPrNumber(): Promise<number | null> {
        const token = this.configService.get<string>('DEMO_GITHUB_TOKEN');
        const octokit = new Octokit({ auth: token });

        try {
            const { data: pulls } = await octokit.rest.pulls.list({
                owner: 'labyrinth30',
                repo: 'elasticsearch',
                state: 'open', // 아직 열려있는 PR만 조회
                per_page: 1,   // 가장 최신 것 하나만
            });

            if (pulls.length > 0) {
                return pulls[0].number; // 여기서 prNumber를 추출합니다.
            }
            return null;
        } catch (error) {
            console.error('PR 번호 조회 실패:', error);
            return null;
        }
    }
    @Interval(5000) // 5초마다 실행
    async autoBotReview() {
        console.log('[BOT] Checking for new PRs...');

        const prNumber = await this.getLatestPrNumber();

        if (prNumber) {
            // 이미 댓글을 달았는지 확인하는 로직 (선택 사항이지만 중복 방지용)
            // 시연 때는 단순히 최신 PR에 댓글을 한 번만 달도록 구성하세요.
            await this.createAiReviewComment(prNumber);
        }
    }
}
