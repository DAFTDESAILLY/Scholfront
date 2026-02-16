export interface ConsentType {
    id: number;
    name: string;
    description: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface StudentConsent {
    id: number;
    studentId: number;
    consentTypeId: number;
    grantedBy: string;
    grantedAt: Date;
    expiresAt?: Date;
    isRevoked: boolean;
    revokedAt?: Date;
    revokedBy?: string;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;

    // Relaciones
    student?: any; // Student model
    consentType?: ConsentType;
}
