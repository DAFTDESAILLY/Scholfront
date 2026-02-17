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
    status?: 'active' | 'archived';
    createdAt?: Date;
    updatedAt?: Date;
}
