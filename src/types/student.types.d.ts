export interface Student {
    id: string,
    organizationId: string,
    userId: string,
    instrument: string,
    specialization: string,
    name: string,
    nameRu: string | null,
    city: string | null,
    country: string | null,
    gradebookNumber: string,
    gradebookIssuedAt: Date,
    enrolledAt: Date,
}

export interface NewStudent {
    organizationId: string,
    userId: string,
    instrument: string,
    specialization: string,
    name: string,
    nameRu: string | null,
    city: string | null,
    country: string | null,
    gradebookNumber: string,
}

export interface UpdateStudent {
    studentId: string,
    instrument?: string,
    specialization?: string,
    name?: string,
    nameRu?: string | null,
    city?: string | null,
    country?: string | null,
}