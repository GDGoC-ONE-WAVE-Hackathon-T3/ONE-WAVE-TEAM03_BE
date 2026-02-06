import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Octokit } from '@octokit/rest';
import { App } from 'octokit';
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
}
