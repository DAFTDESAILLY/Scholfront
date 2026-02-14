export interface Context {
    id: number;
    userId: number;
    name: string;
    level: string;
    institution?: string;
    status: 'active' | 'archived' | 'inactive';
    createdAt: Date;
    updatedAt: Date;
}
