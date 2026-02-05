import { DataSource } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(__dirname, '../../.env') });

const configService = new ConfigService();

const dataSource = new DataSource({
    type: 'postgres',
    host: configService.get<string>('DB_HOST', 'localhost'),
    port: configService.get<number>('DB_PORT', 5432),
    username: configService.get<string>('DB_USERNAME', 'postgres'),
    password: configService.get<string>('DB_PASSWORD', 'postgres'),
    database: configService.get<string>('DB_DATABASE', 'onewave'),
    entities: [User],
    synchronize: true, // Dev only - creates table if not exists for seed
    logging: true,
});

async function bootstrap() {
    await dataSource.initialize();
    console.log('Database connected for seeding...');

    const userRepository = dataSource.getRepository(User);

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

    await dataSource.destroy();
    console.log('Seeding complete.');
}

bootstrap().catch((err) => {
    console.error('Seeding failed:', err);
    process.exit(1);
});
