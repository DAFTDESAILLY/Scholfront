export interface Subject {
    id: number;
    groupId: number;
    name: string;
    teacherId?: number; // Optional if not yet assigned
    schedule?: string;
    gradingScale?: Record<string, number>;
    status: 'active' | 'archived';
    createdAt: Date;
    updatedAt: Date;
}
