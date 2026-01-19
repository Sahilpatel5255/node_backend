import { Request } from 'express';

export interface User {
    id: number;
    email: string;
    username: string;
    name: string;
    role: string;
    password: string;
    is_active: boolean;
    last_login: Date | null;
    date_joined: Date;
}

export interface Lab {
    document_id_prefix: string;
    name: string;
    address: string;
    city: string;
    state: string;
    country: string;
    postal_code: string;
    type: 'accredited' | 'non-accredited';
    operating_hours?: string;
    website_url?: string;

    // File URLs
    nabl_certificate_url?: string;
    company_registration_url?: string;
    pollution_certificate_url?: string;
    cmo_certificate_url?: string;
    lab_logo_url?: string;
    director_signature_url?: string;
    consultant_signature_url?: string;
    quality_manager_signature_url?: string;
    doctor_signature_url?: string;
    staff_list_url?: string;
    equipment_list_url?: string;
    calibrator_details_url?: string;
    scope_list_url?: string;

    // Additional fields
    selected_departments: string[];
    quality_manager_name?: string;
    has_referral_lab_mou: boolean;
    referral_lab_details?: string;
    director_name?: string;
    consultant_name?: string;
    doctor_name?: string;
    doctor_qualification?: string;
    doctor_department?: string;
    sample_source?: string[];
    lab_category?: string;
    lab_status: 'active' | 'inactive';

    // Document settings
    issue_no?: string;
    issue_date?: string;

    // Timestamps
    created_at: Date;
    updated_at: Date;
}

export interface Document {
    id: number;
    title: string;
    content: string;
    owner_id: number;
    created_at: Date;
    updated_at: Date;
}

export interface DocContent {
    document_id: string;
    lab_prefix: string;
    content: Record<string, any>;
    updated_at: Date;
}

export interface JWTPayload {
    userId: number;
    email: string;
    role: string;
}

export interface AuthRequest extends Request {
    user?: User;
}

export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
    errors?: any;
}
