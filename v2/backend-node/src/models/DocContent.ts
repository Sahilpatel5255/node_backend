import pool from '../config/database';
import { DocContent } from '../types';

export class DocContentModel {
    static async createTable(labPrefix: string): Promise<void> {
        const schemaName = `lab_${labPrefix.toLowerCase()}`;
        const query = `
      CREATE TABLE IF NOT EXISTS "${schemaName}".doccontent (
        document_id VARCHAR(100) PRIMARY KEY,
        lab_prefix VARCHAR(50) NOT NULL,
        content JSONB NOT NULL DEFAULT '{}'::jsonb,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;
        await pool.query(query);
    }

    static async save(labPrefix: string, documentId: string, content: Record<string, any>): Promise<void> {
        const schemaName = `lab_${labPrefix.toLowerCase()}`;
        await this.createTable(labPrefix);

        const query = `
      INSERT INTO "${schemaName}".doccontent (document_id, lab_prefix, content, updated_at)
      VALUES ($1, $2, $3::jsonb, NOW())
      ON CONFLICT (document_id)
      DO UPDATE SET content = EXCLUDED.content, lab_prefix = EXCLUDED.lab_prefix, updated_at = NOW()
    `;

        await pool.query(query, [documentId, labPrefix, JSON.stringify(content)]);
    }

    static async bulkSave(labPrefix: string, documents: Record<string, Record<string, any>>): Promise<number> {
        const schemaName = `lab_${labPrefix.toLowerCase()}`;
        await this.createTable(labPrefix);

        let count = 0;
        for (const [documentId, content] of Object.entries(documents)) {
            const query = `
        INSERT INTO "${schemaName}".doccontent (document_id, lab_prefix, content, updated_at)
        VALUES ($1, $2, $3::jsonb, NOW())
        ON CONFLICT (document_id)
        DO UPDATE SET content = EXCLUDED.content, lab_prefix = EXCLUDED.lab_prefix, updated_at = NOW()
      `;

            await pool.query(query, [documentId, labPrefix, JSON.stringify(content)]);
            count++;
        }

        return count;
    }

    static async findByDocument(labPrefix: string, documentId: string): Promise<DocContent[]> {
        const schemaName = `lab_${labPrefix.toLowerCase()}`;
        await this.createTable(labPrefix);

        const query = `
      SELECT document_id, lab_prefix, content, updated_at
      FROM "${schemaName}".doccontent
      WHERE document_id = $1
    `;

        const result = await pool.query(query, [documentId]);
        return result.rows;
    }

    static async findAll(labPrefix: string): Promise<DocContent[]> {
        const schemaName = `lab_${labPrefix.toLowerCase()}`;
        await this.createTable(labPrefix);

        const query = `
      SELECT document_id, lab_prefix, content, updated_at
      FROM "${schemaName}".doccontent
      ORDER BY document_id
    `;

        const result = await pool.query(query);
        return result.rows;
    }

    static async delete(labPrefix: string, documentId: string): Promise<boolean> {
        const schemaName = `lab_${labPrefix.toLowerCase()}`;
        const query = `DELETE FROM "${schemaName}".doccontent WHERE document_id = $1`;
        const result = await pool.query(query, [documentId]);
        return result.rowCount !== null && result.rowCount > 0;
    }
}
