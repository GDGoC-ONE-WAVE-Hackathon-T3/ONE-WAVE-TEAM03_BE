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
}
