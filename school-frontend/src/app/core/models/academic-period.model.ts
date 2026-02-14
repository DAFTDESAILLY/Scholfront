export interface AcademicPeriod {
    id: number;
    contextId: number;
    type: 'trimestre' | 'cuatrimestre' | 'semestre' | 'anual';
    startDate: Date;
    endDate: Date;
    gracePeriodDays: number;
    status: 'active' | 'archived';
    createdAt: Date;
    updatedAt: Date;
}
