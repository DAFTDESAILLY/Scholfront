export interface Student {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    studentId: string; // Matricula
    phone?: string;
    address?: string;
    dateOfBirth?: Date;
    status: 'active' | 'inactive' | 'graduated' | 'dropped';
    createdAt: Date;
    updatedAt: Date;
}
