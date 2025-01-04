const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false
});

const connectDB = async () => {
    try {
        await pool.connect(); // This checks if a connection can be made
        console.log('PostgreSQL Connected...');

        // Ensure the proposals table is created
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS proposals (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;
        await pool.query(createTableQuery);
        console.log('Table is created or already exists');
    } catch (err) {
        console.error('Connection error', err.message);
        process.exit(1);
    }
};

module.exports = {
    connectDB,
    pool // Export the pool to use in other parts of your application
};
