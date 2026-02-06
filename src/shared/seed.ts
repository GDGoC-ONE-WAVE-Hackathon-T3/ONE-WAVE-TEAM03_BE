import { DataSource } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Mission } from '../entities/mission.entity'; // Import Mission
import { PullRequest } from '../entities/pull-request.entity';
import { ReviewLog } from '../entities/review-log.entity';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { resolve } from 'path';
import { GithubService } from '../github/github.service'; // Import GithubService
import { GetRepoInfoInput } from '../github/dto/github.dto';

config({ path: resolve(__dirname, '../../.env') });

const configService = new ConfigService();

// Mock ConfigService for GithubService (needs only GITHUB_TOKEN)
const mockConfigService = {
    get: (key: string) => {
        if (key === 'GITHUB_TOKEN') return configService.get('GITHUB_TOKEN');
        return null;
    }
} as ConfigService;

const dataSource = new DataSource({
    type: 'postgres',
    host: configService.get<string>('DB_HOST', 'localhost'),
    port: configService.get<number>('DB_PORT', 5432),
    username: configService.get<string>('DB_USERNAME', 'postgres'),
    password: configService.get<string>('DB_PASSWORD', 'postgres'),
    database: configService.get<string>('DB_DATABASE', 'onewave'),
    entities: [User, Mission, PullRequest, ReviewLog], // Add Mission and others
    synchronize: true, // Dev only - creates table if not exists for seed
    logging: true,
});

async function bootstrap() {
    await dataSource.initialize();
    console.log('Database connected for seeding...');

    const userRepository = dataSource.getRepository(User);
    const missionRepository = dataSource.getRepository(Mission);

    // 1. Seed Users
    const users = [
        { email: 'user1@example.com', username: 'user1' },
        { email: 'user2@example.com', username: 'user2' },
        { email: 'user3@example.com', username: 'user3' },
    ];

    for (const userData of users) {
        const existing = await userRepository.findOne({ where: { email: userData.email } });
        if (!existing) {
            const user = userRepository.create(userData);
            await userRepository.save(user);
            console.log(`Seeded user: ${user.email}`);
        } else {
            console.log(`User already exists: ${userData.email}`);
        }
    }

    // 2. Seed Mission (Dynamic from GitHub)
    // Instantiate GithubService manually
    const githubService = new GithubService(mockConfigService);

    // Target Repo for Mission
    const missionRepoName = 'nestjs/nest'; // Example repo

    console.log(`Fetching info for ${missionRepoName} from GitHub...`);
    try {
        const repoInfoInput: GetRepoInfoInput = { repoName: missionRepoName };
        const repoInfo = await githubService.getRepoInfo(repoInfoInput);

        const missionData = {
            repoName: missionRepoName,
            title: 'NestJS Framework Analysis',
            description: repoInfo.description || 'Analyze the NestJS framework architecture.',
            solutionDiff: 'diff --git a/src/core.ts b/src/core.ts...', // Dummy Diff
            thumbnailUrl: repoInfo.thumbnailUrl,
        };

        const existingMission = await missionRepository.findOne({ where: { repoName: missionRepoName } });
        if (!existingMission) {
            const mission = missionRepository.create(missionData);
            await missionRepository.save(mission);
            console.log(`Seeded mission: ${mission.repoName} with Thumbnail: ${mission.thumbnailUrl}`);
        } else {
            // Update thumbnail if exists
            existingMission.thumbnailUrl = repoInfo.thumbnailUrl;
            existingMission.description = repoInfo.description || existingMission.description;
            await missionRepository.save(existingMission);
            console.log(`Updated existing mission: ${missionRepoName}`);
        }

    } catch (error) {
        console.error('Failed to fetch/seed mission from GitHub:', error);
        // Fallback or skip
    }

    await dataSource.destroy();
    console.log('Seeding complete.');
}

bootstrap().catch((err) => {
    console.error('Seeding failed:', err);
    process.exit(1);
});
