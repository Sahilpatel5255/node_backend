// Simple database connection test
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

console.log('Testing database connection...');
console.log('Configuration:');
console.log(`  Host: ${process.env.DB_HOST}`);
console.log(`  Port: ${process.env.DB_PORT}`);
console.log(`  Database: ${process.env.DB_NAME}`);
console.log(`  User: ${process.env.DB_USER}`);
console.log('');

pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('❌ Database connection failed:');
        console.error(err.message);
        console.error('\nPossible issues:');
        console.error('  1. PostgreSQL is not running');
        console.error('  2. Database credentials are incorrect');
        console.error('  3. Database does not exist');
        console.error('  4. Firewall blocking connection');
        process.exit(1);
    } else {
        console.log('✅ Database connection successful!');
        console.log(`   Server time: ${res.rows[0].now}`);
        pool.end();
        process.exit(0);
    }
});
