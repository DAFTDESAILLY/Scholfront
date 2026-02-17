export interface Grade {
    id: number;
    evaluationItemId: number;
    studentAssignmentId: number;
    score: number;
    feedback?: string;
    createdAt: Date | string;
    updatedAt: Date | string;
    
    // Optional relations
    studentAssignment?: {
        id: number;
        studentId: number;
        student?: {
            id: number;
            fullName: string;
        };
    };
}
