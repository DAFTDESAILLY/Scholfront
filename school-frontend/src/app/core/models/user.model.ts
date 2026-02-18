export interface User {
    id: number;
    email: string;
    name: string;
    role?: 'admin' | 'teacher' | 'student';
    status: 'active' | 'inactive';
    createdAt: Date;
    updatedAt: Date;
}
