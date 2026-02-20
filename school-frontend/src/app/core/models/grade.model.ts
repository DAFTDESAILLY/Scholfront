export interface Grade {
    id: number;
    evaluationItemId: number;
    studentAssignmentId: number;
    score: number;
    feedback?: string;
    createdAt: Date | string;
    updatedAt: Date | string;

    // Relaciones opcionales que vienen del backend
    studentAssignment?: {
        id: number;
        studentId: number;
        student?: {
            id: number;
            fullName: string;
        };
    };
    evaluationItem?: {
        id: number;
        subjectId: number;
        name: string;
        type: string;
    };
}