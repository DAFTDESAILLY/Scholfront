export interface Grade {
    id: number;
    evaluationId: number;
    studentId: number;
    score: number;
    feedback?: string;
    createdAt: Date;
    updatedAt: Date;
}
