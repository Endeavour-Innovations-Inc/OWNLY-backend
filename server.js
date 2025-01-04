const express = require('express');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const { Pool } = require('pg');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Database pool configuration
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

// Swagger configuration
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Proposals API',
            version: '1.0.0',
            description: 'This is a simple API to manage proposals with operations to add and retrieve proposals.',
        },
        servers: [
            {
                url: `http://localhost:${PORT}`,
            },
        ],
    },
    apis: ['server.js'], // files containing annotations for Swagger Documentation
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Middleware
app.use(express.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // Limit each IP to 100 requests per window
});
app.use('/api', apiLimiter);

/**
 * @openapi
 * /api/proposals:
 *   get:
 *     summary: Retrieve a list of proposals
 *     responses:
 *       200:
 *         description: A list of proposals
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: The proposal ID
 *                   name:
 *                     type: string
 *                     description: The name of the proposal
 *                   description:
 *                     type: string
 *                     description: The description of the proposal
 *                   submitted_at:
 *                     type: string
 *                     format: date-time
 *                     description: The time at which the proposal was submitted
 */
app.get('/api/proposals', async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM proposals');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});

/**
 * @openapi
 * /api/proposals:
 *   post:
 *     summary: Create a new proposal
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the proposal
 *               description:
 *                 type: string
 *                 description: The description of the proposal
 *     responses:
 *       201:
 *         description: Successfully created proposal
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 name:
 *                   type: string
 *                 description:
 *                   type: string
 *       500:
 *         description: Error creating proposal
 */
app.post('/api/proposals', async (req, res) => {
    const { name, description } = req.body;
    try {
        const { rows } = await pool.query(
            'INSERT INTO proposals (name, description) VALUES ($1, $2) RETURNING *;',
            [name, description]
        );
        res.status(201).json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
