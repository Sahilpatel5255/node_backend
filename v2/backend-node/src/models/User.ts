import pool from '../config/database';
import bcrypt from 'bcrypt';
import { User } from '../types';

export class UserModel {
    static async create(email: string, name: string, role: string, password: string): Promise<User> {
        const hashedPassword = await bcrypt.hash(password, 10);
        const username = email; // Use email as username like Django

        const query = `
      INSERT INTO mapp_customuser (email, username, name, role, password, is_active, date_joined)
      VALUES ($1, $2, $3, $4, $5, true, NOW())
      RETURNING id, email, username, name, role, is_active, last_login, date_joined
    `;

        const result = await pool.query(query, [email, username, name, role, hashedPassword]);
        return result.rows[0];
    }

    static async findByEmail(email: string): Promise<User | null> {
        const query = 'SELECT * FROM mapp_customuser WHERE email = $1';
        const result = await pool.query(query, [email]);
        return result.rows[0] || null;
    }

    static async findById(id: number): Promise<User | null> {
        const query = 'SELECT * FROM mapp_customuser WHERE id = $1';
        const result = await pool.query(query, [id]);
        return result.rows[0] || null;
    }

    static async findAll(): Promise<User[]> {
        const query = 'SELECT id, email, username, name, role, is_active, last_login, date_joined FROM mapp_customuser ORDER BY last_login DESC NULLS LAST';
        const result = await pool.query(query);
        return result.rows;
    }

    static async updateStatus(id: number, isActive: boolean): Promise<User | null> {
        const query = `
      UPDATE mapp_customuser 
      SET is_active = $1 
      WHERE id = $2 
      RETURNING id, email, username, name, role, is_active, last_login, date_joined
    `;
        const result = await pool.query(query, [isActive, id]);
        return result.rows[0] || null;
    }

    static async update(email: string, updates: Partial<{ name: string; role: string; password: string }>): Promise<User | null> {
        const user = await this.findByEmail(email);
        if (!user) return null;

        const updateFields: string[] = [];
        const values: any[] = [];
        let paramIndex = 1;

        if (updates.name) {
            updateFields.push(`name = $${paramIndex++}`);
            values.push(updates.name);
        }

        if (updates.role) {
            updateFields.push(`role = $${paramIndex++}`);
            values.push(updates.role);
        }

        if (updates.password) {
            const hashedPassword = await bcrypt.hash(updates.password, 10);
            updateFields.push(`password = $${paramIndex++}`);
            values.push(hashedPassword);
        }

        if (updateFields.length === 0) return user;

        values.push(email);
        const query = `
      UPDATE mapp_customuser 
      SET ${updateFields.join(', ')} 
      WHERE email = $${paramIndex}
      RETURNING id, email, username, name, role, is_active, last_login, date_joined
    `;

        const result = await pool.query(query, values);
        return result.rows[0] || null;
    }

    static async delete(email: string): Promise<boolean> {
        const query = 'DELETE FROM mapp_customuser WHERE email = $1';
        const result = await pool.query(query, [email]);
        return result.rowCount !== null && result.rowCount > 0;
    }

    static async updateLastLogin(id: number): Promise<void> {
        const query = 'UPDATE mapp_customuser SET last_login = NOW() WHERE id = $1';
        await pool.query(query, [id]);
    }

    static async verifyPassword(email: string, password: string): Promise<User | null> {
        const user = await this.findByEmail(email);
        if (!user) return null;

        const isValid = await bcrypt.compare(password, user.password);
        return isValid ? user : null;
    }
}
