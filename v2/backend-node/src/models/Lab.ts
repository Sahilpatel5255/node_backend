import pool from '../config/database';
import { Lab } from '../types';

export class LabModel {
    static async create(labData: Partial<Lab>): Promise<Lab> {
        const query = `
      INSERT INTO mapp_lab (
        document_id_prefix, name, address, city, state, country, postal_code, type,
        operating_hours, website_url, quality_manager_name, has_referral_lab_mou,
        referral_lab_details, sample_source, lab_category, lab_status, selected_departments,
        director_name, consultant_name, doctor_name, doctor_qualification, doctor_department,
        lab_logo_url, director_signature_url, consultant_signature_url,
        quality_manager_signature_url, doctor_signature_url, nabl_certificate_url,
        company_registration_url, pollution_certificate_url, cmo_certificate_url,
        staff_list_url, equipment_list_url, calibrator_details_url, scope_list_url,
        issue_no, issue_date, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17,
        $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32,
        $33, $34, $35, $36, $37, NOW(), NOW()
      )
      RETURNING *
    `;

        const values = [
            labData.document_id_prefix,
            labData.name,
            labData.address,
            labData.city,
            labData.state,
            labData.country,
            labData.postal_code,
            labData.type,
            labData.operating_hours || null,
            labData.website_url || null,
            labData.quality_manager_name || null,
            labData.has_referral_lab_mou || false,
            labData.referral_lab_details || null,
            labData.sample_source ? JSON.stringify(labData.sample_source) : null,
            labData.lab_category || null,
            labData.lab_status || 'active',
            labData.selected_departments ? JSON.stringify(labData.selected_departments) : '[]',
            labData.director_name || null,
            labData.consultant_name || null,
            labData.doctor_name || null,
            labData.doctor_qualification || null,
            labData.doctor_department || null,
            labData.lab_logo_url || null,
            labData.director_signature_url || null,
            labData.consultant_signature_url || null,
            labData.quality_manager_signature_url || null,
            labData.doctor_signature_url || null,
            labData.nabl_certificate_url || null,
            labData.company_registration_url || null,
            labData.pollution_certificate_url || null,
            labData.cmo_certificate_url || null,
            labData.staff_list_url || null,
            labData.equipment_list_url || null,
            labData.calibrator_details_url || null,
            labData.scope_list_url || null,
            labData.issue_no || '01',
            labData.issue_date || null,
        ];

        const result = await pool.query(query, values);
        return this.formatLab(result.rows[0]);
    }

    static async findByPrefix(prefix: string): Promise<Lab | null> {
        const query = 'SELECT * FROM mapp_lab WHERE document_id_prefix = $1';
        const result = await pool.query(query, [prefix]);
        return result.rows[0] ? this.formatLab(result.rows[0]) : null;
    }

    static async findAll(): Promise<Lab[]> {
        const query = 'SELECT * FROM mapp_lab ORDER BY created_at DESC';
        const result = await pool.query(query);
        return result.rows.map(row => this.formatLab(row));
    }

    static async update(prefix: string, updates: Partial<Lab>): Promise<Lab | null> {
        const updateFields: string[] = [];
        const values: any[] = [];
        let paramIndex = 1;

        const fieldMap: Record<string, any> = {
            name: updates.name,
            address: updates.address,
            city: updates.city,
            state: updates.state,
            country: updates.country,
            postal_code: updates.postal_code,
            type: updates.type,
            operating_hours: updates.operating_hours,
            website_url: updates.website_url,
            quality_manager_name: updates.quality_manager_name,
            has_referral_lab_mou: updates.has_referral_lab_mou,
            referral_lab_details: updates.referral_lab_details,
            sample_source: updates.sample_source ? JSON.stringify(updates.sample_source) : undefined,
            lab_category: updates.lab_category,
            lab_status: updates.lab_status,
            selected_departments: updates.selected_departments ? JSON.stringify(updates.selected_departments) : undefined,
            director_name: updates.director_name,
            consultant_name: updates.consultant_name,
            doctor_name: updates.doctor_name,
            doctor_qualification: updates.doctor_qualification,
            doctor_department: updates.doctor_department,
            lab_logo_url: updates.lab_logo_url,
            director_signature_url: updates.director_signature_url,
            consultant_signature_url: updates.consultant_signature_url,
            quality_manager_signature_url: updates.quality_manager_signature_url,
            doctor_signature_url: updates.doctor_signature_url,
            nabl_certificate_url: updates.nabl_certificate_url,
            company_registration_url: updates.company_registration_url,
            pollution_certificate_url: updates.pollution_certificate_url,
            cmo_certificate_url: updates.cmo_certificate_url,
            staff_list_url: updates.staff_list_url,
            equipment_list_url: updates.equipment_list_url,
            calibrator_details_url: updates.calibrator_details_url,
            scope_list_url: updates.scope_list_url,
            issue_no: updates.issue_no,
            issue_date: updates.issue_date,
        };

        for (const [field, value] of Object.entries(fieldMap)) {
            if (value !== undefined) {
                updateFields.push(`${field} = $${paramIndex++}`);
                values.push(value);
            }
        }

        if (updateFields.length === 0) {
            return this.findByPrefix(prefix);
        }

        updateFields.push(`updated_at = NOW()`);
        values.push(prefix);

        const query = `
      UPDATE mapp_lab 
      SET ${updateFields.join(', ')} 
      WHERE document_id_prefix = $${paramIndex}
      RETURNING *
    `;

        const result = await pool.query(query, values);
        return result.rows[0] ? this.formatLab(result.rows[0]) : null;
    }

    static async delete(prefix: string): Promise<boolean> {
        const query = 'DELETE FROM mapp_lab WHERE document_id_prefix = $1';
        const result = await pool.query(query, [prefix]);
        return result.rowCount !== null && result.rowCount > 0;
    }

    static async checkPrefixExists(prefix: string): Promise<boolean> {
        const query = 'SELECT 1 FROM mapp_lab WHERE LOWER(document_id_prefix) = LOWER($1)';
        const result = await pool.query(query, [prefix]);
        return result.rows.length > 0;
    }

    static async createSchema(prefix: string): Promise<void> {
        const schemaName = `lab_${prefix.toLowerCase()}`;
        const query = `CREATE SCHEMA IF NOT EXISTS "${schemaName}"`;
        await pool.query(query);
    }

    private static formatLab(row: any): Lab {
        return {
            ...row,
            selected_departments: typeof row.selected_departments === 'string'
                ? JSON.parse(row.selected_departments)
                : row.selected_departments || [],
            sample_source: typeof row.sample_source === 'string'
                ? JSON.parse(row.sample_source)
                : row.sample_source || [],
        };
    }
}
