export interface Evaluation {
    id: number;
    subjectId: number;
    academicPeriodId: number;
    name: string;
    weight: number;
    type?: string;
    maxScore?: number;
    dueDate?: string;
    description?: string;
    grade?: number; // Optional, for student view
    status?: 'pending' | 'completed';
    createdAt?: Date;
    updatedAt?: Date;
}
