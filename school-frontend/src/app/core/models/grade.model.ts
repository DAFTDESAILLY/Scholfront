export interface Grade {
    id: number;
    evaluationItemId: number;
    studentAssignmentId: number;
    score: number;
    feedback?: string;
    createdAt: Date;
    updatedAt: Date;
}
