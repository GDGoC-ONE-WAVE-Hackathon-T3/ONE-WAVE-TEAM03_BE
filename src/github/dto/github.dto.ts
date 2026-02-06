export class GetPrDiffInput {
    owner: string;
    repo: string;
    prNumber: number;
}

export class GetPrDiffOutput {
    diff: string;
}

export class PostCommentInput {
    owner: string;
    repo: string;
    prNumber: number;
    body: string;
}

export class PostCommentOutput {
    success: boolean;
}

export class GetRepoInfoInput {
    repoName: string; // "owner/repo"
}

export class GetRepoInfoOutput {
    description: string;
    thumbnailUrl: string;
}
