export interface ConsentType {
    id: number;
    name?: string; // Display name
    description?: string;
    isActive?: boolean;
    consentId?: number;
    recordType: 'conducta' | 'tutoría' | 'médico' | 'cognitivo';
}

export interface StudentShareConsent {
    id: number;
    studentId: number;
    fromUserId: number;
    toUserId: number;
    isActive: boolean;
    expiresAt: string | Date; // DTO uses string (DateString), Entity uses Date
    revokedAt?: Date;
    createdAt?: Date;

    // Relaciones
    student?: any; // Student model
    fromUser?: any; // User model
    toUser?: any; // User model
    types?: ConsentType[];
}
