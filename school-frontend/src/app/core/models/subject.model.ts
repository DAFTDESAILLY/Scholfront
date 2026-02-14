export interface Subject {
    id: number;
    groupId: number;
    name: string;
    teacherId?: number; // Optional if not yet assigned
    schedule?: string;
    status: 'active' | 'archived';
    createdAt: Date;
    updatedAt: Date;
}
