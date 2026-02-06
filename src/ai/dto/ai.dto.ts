export class GenerateCodeReviewInput {
    missionDesc: string;
    solutionDiff: string;
    userDiff: string;
}

export class GenerateCodeReviewOutput {
    isPassed: boolean;
    feedback: string;
}

export class GenerateFinalAssessmentInput {
    missionDesc: string;
    solutionDiff: string;
    userDiff: string;
}

export class GenerateFinalAssessmentOutput {
    assessmentReport: string;
}
