export interface Group {
    id: number;
    academicPeriodId: number;
    name: string;
    status: 'active' | 'archived';
    createdAt: Date;
    updatedAt: Date;
}
