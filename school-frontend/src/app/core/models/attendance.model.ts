export interface Attendance {
    id: number;
    subjectId: number;
    studentId: number;
    date: Date;
    status: 'present' | 'absent' | 'late' | 'excused';
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}
