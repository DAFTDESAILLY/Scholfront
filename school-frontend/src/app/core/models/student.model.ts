export interface Student {
    id: number;
    fullName: string;              // ← Backend usa fullName (no firstName/lastName)
    email: string;
    address?: string;
    enrollmentId?: string;         // ← Backend usa enrollmentId (no studentId)
    birthDate?: Date | string;     // ← Backend usa birthDate (no dateOfBirth)
    parentPhone?: string;          // ← Backend usa parentPhone (no phone)
    notes?: string;
    status: 'active' | 'inactive' | 'archived';  // ← Backend usa estos valores
    createdAt: Date | string;
    updatedAt: Date | string;
}