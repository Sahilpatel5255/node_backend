import pool from '../config/database';
import { Document } from '../types';

export class DocumentModel {
    static async create(title: string, content: string, ownerId: number): Promise<Document> {
        const query = `
      INSERT INTO mapp_document (title, content, owner_id, created_at, updated_at)
      VALUES ($1, $2, $3, NOW(), NOW())
      RETURNING *
    `;

        const result = await pool.query(query, [title, content, ownerId]);
        return result.rows[0];
    }

    static async findById(id: number): Promise<Document | null> {
        const query = 'SELECT * FROM mapp_document WHERE id = $1';
        const result = await pool.query(query, [id]);
        return result.rows[0] || null;
    }

    static async findByOwner(ownerId: number): Promise<Document[]> {
        const query = 'SELECT * FROM mapp_document WHERE owner_id = $1 ORDER BY created_at DESC';
        const result = await pool.query(query, [ownerId]);
        return result.rows;
    }

    static async findAll(): Promise<Document[]> {
        const query = 'SELECT * FROM mapp_document ORDER BY created_at DESC';
        const result = await pool.query(query);
        return result.rows;
    }

    static async update(id: number, updates: Partial<{ title: string; content: string }>): Promise<Document | null> {
        const updateFields: string[] = [];
        const values: any[] = [];
        let paramIndex = 1;

        if (updates.title !== undefined) {
            updateFields.push(`title = $${paramIndex++}`);
            values.push(updates.title);
        }

        if (updates.content !== undefined) {
            updateFields.push(`content = $${paramIndex++}`);
            values.push(updates.content);
        }

        if (updateFields.length === 0) return this.findById(id);

        updateFields.push(`updated_at = NOW()`);
        values.push(id);

        const query = `
      UPDATE mapp_document 
      SET ${updateFields.join(', ')} 
      WHERE id = $${paramIndex}
      RETURNING *
    `;

        const result = await pool.query(query, values);
        return result.rows[0] || null;
    }

    static async delete(id: number): Promise<boolean> {
        const query = 'DELETE FROM mapp_document WHERE id = $1';
        const result = await pool.query(query, [id]);
        return result.rowCount !== null && result.rowCount > 0;
    }
}
