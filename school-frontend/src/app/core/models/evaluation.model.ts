export interface Evaluation {
    id: number;
    subjectId: number;
    periodId: number;
    groupId?: number;  // Optional group ID from subject relation
    name: string;
    type: 'exam' | 'homework' | 'project' | 'participation';
    maxScore: number;
    weight: number; // Percentage
    dueDate: Date;
    description?: string;
    status: 'active' | 'archived';
    createdAt: Date;
    updatedAt: Date;
}
