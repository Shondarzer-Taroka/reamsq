const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MySQL
const db = mysql.createConnection({
    host: process.env.HOST_MY_SQL,
    user: process.env.USER_MY_SQL, // Replace with your MySQL username
    password: process.env.PASSWORD_MY_SQL, // Replace with your MySQL password
    database:process.env.DB_MY_SQL,
});

db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err);
    } else {
        console.log('Connected to MySQL database.');
        createUsersTable(); // Ensure the table is created
    }
});

// Function to create the users table if it doesn't exist
const createUsersTable = () => {
    const query = `
    CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        age INT NOT NULL,
        address JSON NOT NULL
    );
    `;
    db.query(query, (err, result) => {
        if (err) {
            console.error('Failed to create users table:', err);
        } else {
            console.log('Users table is ready.');
        }
    });
};

// CRUD Endpoints

// Get all users
app.get('/users', (req, res) => {
    const query = 'SELECT id, name, email, age, address FROM users';

    db.query(query, (err, results) => {
        if (err) return res.status(500).send(err);

        const users = results.map((user) => {
            let address;
            try {
                // Check if `address` is a string and parse it
                address = typeof user.address === 'string'
                    ? JSON.parse(user.address)
                    : user.address;
            } catch (e) {
                console.error(`Invalid JSON for user id ${user.id}:`, e.message);
                address = { city: 'Unknown', house: 'Unknown' }; // Default fallback
            }
            return {
                id: user.id,
                name: user.name,
                email: user.email,
                age: user.age,
                address,
            };
        });

        res.json(users);
    });
});



// Add a new user

app.post('/users', (req, res) => {
    const { name, email, age, address } = req.body;

    // Debugging: Log the received payload
    console.log('Received payload:', req.body);

    // Validate required fields
    if (!name || typeof name !== 'string') {
        return res.status(400).send({ message: 'Invalid or missing name. Name must be a string.' });
    }
    if (!email || typeof email !== 'string') {
        return res.status(400).send({ message: 'Invalid or missing email. Email must be a string.' });
    }
    if (age === undefined || typeof age !== 'number') {
        return res.status(400).send({ message: 'Invalid or missing age. Age must be a number.' });
    }
    if (!address || typeof address !== 'object' || !address.city || !address.house) {
        return res.status(400).send({
            message: 'Invalid or missing address. Address must include "city" and "house", both as strings.',
        });
    }
    if (typeof address.city !== 'string' || typeof address.house !== 'string') {
        return res.status(400).send({
            message: 'Invalid address format. Both "city" and "house" must be strings.',
        });
    }

    // Prepare and execute the query
    const query = 'INSERT INTO users (name, email, age, address) VALUES (?, ?, ?, ?)';
    const queryParams = [name, email, age, JSON.stringify(address)];

    db.query(query, queryParams, (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).send({ message: 'An error occurred while saving the user.', error: err });
        }

        // Respond with the created user's data
        res.status(201).json({
            id: result.insertId,
            name,
            email,
            age,
            address,
        });
    });
});


// Update a user
// Update user details by ID
app.put('/users/:id', (req, res) => {
    const userId = req.params.id;
    const { name, email, age, address } = req.body;

    // Validate fields
    if (!name || !email || !age || !address || !address.city || !address.house) {
        return res.status(400).send({ message: 'Invalid or missing fields in the request.' });
    }

    const query = `
        UPDATE users
        SET name = ?, email = ?, age = ?, address = ?
        WHERE id = ?`;
    const queryParams = [name, email, age, JSON.stringify(address), userId];

    db.query(query, queryParams, (err, result) => {
        if (err) {
            console.error('Error updating user:', err);
            return res.status(500).send({ message: 'Failed to update user.', error: err });
        }
        if (result.affectedRows === 0) {
            return res.status(404).send({ message: 'User not found.' });
        }
        res.send({ message: 'User updated successfully.' });
    });
});


// Delete a user
// Delete a user by ID
app.delete('/users/:id', (req, res) => {
    const userId = req.params.id;

    const query = 'DELETE FROM users WHERE id = ?';
    db.query(query, [userId], (err, result) => {
        if (err) {
            console.error('Error deleting user:', err);
            return res.status(500).send({ message: 'Failed to delete user.', error: err });
        }
        if (result.affectedRows === 0) {
            return res.status(404).send({ message: 'User not found.' });
        }
        res.send({ message: 'User deleted successfully.' });
    });
});

// Start the server
app.listen(5000, () => {
    console.log('Server running on port 5000');
});
