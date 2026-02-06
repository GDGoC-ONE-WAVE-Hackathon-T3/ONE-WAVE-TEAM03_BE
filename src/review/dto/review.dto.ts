export class ProcessCommitInput {
    repoOwner: string;
    repoName: string;
    prNumber: number;
    prUrl: string;
    ownerUserLogin: string;
    commitSha: string;
}

export class ProcessCommitOutput {
    success: boolean;
}
