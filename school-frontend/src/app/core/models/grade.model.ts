export interface Grade {
    id: number;
    assessmentId: number;
    studentId: number;
    score: number;
    feedback?: string;
    createdAt: Date;
    updatedAt: Date;
}
