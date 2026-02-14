export interface SchoolFile {
    id: number;
    name: string;
    type: string;
    size: number;
    url: string;
    studentId?: number; // Optional, if related to a specific student
    contextId?: number; // Optional, if related to a context
    uploadedBy: number; // User ID
    createdAt: Date;
}
