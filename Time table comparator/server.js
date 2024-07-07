const express = require('express');
const oracledb = require('oracledb');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();  // Load environment variables from .env file

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(cors());

const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    connectString: process.env.DB_CONNECT_STRING
};

async function init() {
    try {
        const connection = await oracledb.getConnection(dbConfig);
        console.log('Connected to database.');

        app.get('/', (req, res) => {
            res.send('Welcome to the Timetable Application API');
        });

        app.post('/signup', async (req, res) => {
            const { email, password } = req.body;
            const checkQuery = 'SELECT * FROM users WHERE email = :email';
            const insertQuery = 'INSERT INTO users (email, password) VALUES (:email, :password)';

            try {
                const checkResult = await connection.execute(checkQuery, { email });
                if (checkResult.rows.length > 0) {
                    return res.status(400).send('Email already exists');
                }
                await connection.execute(insertQuery, { email, password }, { autoCommit: true });
                res.status(200).send('User signed up successfully');
            } catch (err) {
                console.error('Error during signup:', err);
                res.status(500).send('Error signing up');
            }
        });

        app.post('/login', async (req, res) => {
            const { email, password } = req.body;
            const query = 'SELECT * FROM users WHERE email = :email AND password = :password';
            try {
                const result = await connection.execute(query, { email, password });
                if (result.rows.length > 0) {
                    res.status(200).send('User logged in successfully');
                } else {
                    res.status(401).send('Invalid credentials');
                }
            } catch (err) {
                console.error('Error during login:', err);
                res.status(500).send('Error logging in');
            }
        });

        app.post('/saveTimetable', async (req, res) => {
            const { email, student1Name, student1Timetable, student2Name, student2Timetable } = req.body;

            const userQuery = 'SELECT id FROM users WHERE email = :email';
            const insertQuery = `INSERT INTO timetables (user_id, student1Name, student1Timetable, student2Name, student2Timetable) 
                                 VALUES (:user_id, :student1Name, :student1Timetable, :student2Name, :student2Timetable)`;

            try {
                const userResult = await connection.execute(userQuery, { email });
                if (userResult.rows.length === 0) {
                    return res.status(400).send('User not found');
                }
                const user_id = userResult.rows[0][0];

                await connection.execute(insertQuery, {
                    user_id,
                    student1Name,
                    student1Timetable: JSON.stringify(student1Timetable),
                    student2Name,
                    student2Timetable: JSON.stringify(student2Timetable)
                }, { autoCommit: true });

                res.status(200).send({ success: true, message: 'Timetable saved successfully' });
            } catch (err) {
                console.error('Error saving timetable:', err);
                res.status(500).send({ success: false, message: 'Error saving timetable' });
            }
        });

        app.get('/getTimetable', async (req, res) => {
            const { email } = req.query;
            const userQuery = 'SELECT id FROM users WHERE email = :email';
            const timetableQuery = 'SELECT * FROM timetables WHERE user_id = :user_id';

            try {
                const userResult = await connection.execute(userQuery, { email });
                if (userResult.rows.length === 0) {
                    return res.status(404).send('No timetable found for the user');
                }
                const user_id = userResult.rows[0][0];
                const result = await connection.execute(timetableQuery, { user_id }, { outFormat: oracledb.OUT_FORMAT_OBJECT });

                if (result.rows.length > 0) {
                    const timetable = result.rows[0];

                    // Fetch the CLOBs as strings
                    const student1Timetable = await timetable.STUDENT1TIMETABLE.getData();
                    const student2Timetable = await timetable.STUDENT2TIMETABLE.getData();

                    res.status(200).json({
                        student1Name: timetable.STUDENT1NAME,
                        student1Timetable: JSON.parse(student1Timetable),
                        student2Name: timetable.STUDENT2NAME,
                        student2Timetable: JSON.parse(student2Timetable)
                    });
                } else {
                    res.status(404).send('No timetable found');
                }
            } catch (err) {
                console.error('Error retrieving timetable:', err);
                res.status(500).send('Error retrieving timetable');
            }
        });

        app.listen(port, () => {
            console.log(`Server running on port ${port}`);
        });
    } catch (err) {
        console.error('Database connection failed:', err);
    }
}

init();
