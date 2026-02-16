export interface StudentAssignment {
    id: number;
    studentId: number;
    groupId: number;
    assignedAt: Date;
    unassignedAt?: Date;
    reason?: string;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;

    // Relaciones
    student?: any; // Student model
    group?: any;   // Group model
}

export interface StudentAssignmentHistory {
    id: number;
    assignmentId: number;
    action: 'assigned' | 'unassigned' | 'transferred';
    fromGroupId?: number;
    toGroupId?: number;
    performedBy: string;
    performedAt: Date;
    notes?: string;

    // Relaciones
    assignment?: StudentAssignment;
}
