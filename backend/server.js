const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

const validateRackName = (rackName) => {
    // Rack name should follow the pattern: 2 letters followed by 2 digits (e.g., AE01, BD02)
    const rackNamePattern = /^[A-Z]{2}\d{2}$/;
    return rackNamePattern.test(rackName);
};

// User Management Routes

// Create a new user
app.post('/users', async (req, res) => {
    const { username, password, user_group } = req.body; // Updated to user_group
    
    try {
        // First check if user exists
        const existingUser  = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        if (existingUser .rows.length > 0) {
            return res.status(400).json({ error: 'Username already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await pool.query(
            'INSERT INTO users (username, password, user_group) VALUES ($1, $2, $3) RETURNING id, username, user_group', // Updated to user_group
            [username, hashedPassword, user_group]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Error creating user' });
    }
});

// Login a user
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Find the user by username
        const user = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        
        if (user.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Compare the password
        const isMatch = await bcrypt.compare(password, user.rows[0].password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate token and send response with user data
        const token = jwt.sign({ id: user.rows[0].id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        
        // Log what we're sending back
        console.log('Sending user data:', {
            id: user.rows[0].id,
            username: user.rows[0].username,
            user_group: user.rows[0].user_group
        });

        res.json({
            token,
            user: {
                id: user.rows[0].id,
                username: user.rows[0].username,
                user_group: user.rows[0].user_group
            }
        });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ error: 'Error logging in' });
    }
});

// Update a user
app.put('/users/:id', async (req, res) => {
    const { id } = req.params;
    const { username, password, user_group } = req.body; // Updated to user_group
    
    try {
        // Check if new username already exists for a different user
        if (username) {
            const existingUser  = await pool.query(
                'SELECT * FROM users WHERE username = $1 AND id != $2',
                [username, id]
            );
            if (existingUser .rows.length > 0) {
                return res.status(400).json({ error: 'Username already exists' });
            }
        }

        let result;
        if (password) {
            // Update with new password
            const hashedPassword = await bcrypt.hash(password, 10);
            result = await pool.query(
                'UPDATE users SET username = $1, password = $2, user_group = $3 WHERE id = $4 RETURNING id, username, user_group', // Updated to user_group
                [username, hashedPassword, user_group, id]
            );
        } else {
            // Update without changing password
            result = await pool.query(
                'UPDATE users SET username = $1, user_group = $2 WHERE id = $3 RETURNING id, username, user_group', // Updated to user_group
                [username, user_group, id]
            );
        }

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User  not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating user:', error);
        res .status(500).json({ error: 'Error updating user' });
    }
});

// Get all users
app.get('/users', async (req, res) => {
    try {
        const result = await pool.query('SELECT id, username, user_group FROM users'); // Updated to user_group
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching users' });
    }
});

// Delete a user
app.delete('/users/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM users WHERE id = $1', [id]);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Error deleting user' });
    }
});

// Rooms
app.get('/rooms', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM rooms');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching rooms' });
    }
});

app.post('/rooms', async (req, res) => {
    const { name } = req.body;
    try {
        const result = await pool.query('INSERT INTO rooms (name) VALUES ($1) RETURNING *', [name]);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Error creating room' });
    }
});

app.post('/racks', async (req, res) => {
    const { room_id, name, owner, PDU_leva, PDU_desna } = req.body;
    try {
         // Validate rack name format
         if (!validateRackName(name)) {
            return res.status(400).json({ 
                error: 'Invalid rack name format. Name must be 2 uppercase letters followed by 2 digits (e.g., AE01)' 
            });
        }
        const result = await pool.query(
            'INSERT INTO racks (room_id, name, owner, PDU_leva, PDU_desna) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [room_id, name, owner, PDU_leva, PDU_desna]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Error creating rack' });
    }
});

// Equipment
app.get('/equipment', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM equipment');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching equipment' });
    }
});

app.post('/equipment', async (req, res) => {
    const { rack_id, name, size, start_unit } = req.body;
    try {
        // Check for conflicts
        const overlaps = await pool.query(
            `SELECT * FROM equipment WHERE rack_id = $1 AND 
            (($2 BETWEEN start_unit AND start_unit + size - 1) OR 
            ($2 + $3 - 1 BETWEEN start_unit AND start_unit + size - 1))`,
            [rack_id, start_unit, size]
        );
        if (overlaps.rows.length > 0) {
            return res.status(400).json({ error: 'Equipment placement conflicts with existing equipment' });
        }

        const result = await pool.query(
            'INSERT INTO equipment (rack_id, name, size, start_unit) VALUES ($1, $2, $3, $4) RETURNING *',
            [rack_id, name, size, start_unit]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Error creating equipment' });
    }
});

// Rooms - Add these routes
app.put('/rooms/:id', async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    try {
        const result = await pool.query(
            'UPDATE rooms SET name = $1 WHERE id = $2 RETURNING *',
            [name, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Room not found' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Error updating room' });
    }
});

app.delete('/rooms/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM rooms WHERE id = $1', [id]);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Error deleting room' });
    }
});

app.put('/racks/:id', async (req, res) => {
    const { id } = req.params;
    const { room_id, name, owner, PDU_leva, PDU_desna } = req.body;
    try {
        // Validate rack name format
        if (!validateRackName(name)) {
            return res.status(400).json({ 
                error: 'Invalid rack name format. Name must be 2 uppercase letters followed by 2 digits (e.g., AE01)' 
            });
        }
        const result = await pool.query(
            'UPDATE racks SET room_id = $1, name = $2, owner = $3, PDU_leva = $4, PDU_desna = $5 WHERE id = $6 RETURNING *',
            [room_id, name.toUpperCase(), owner, PDU_leva, PDU_desna, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Rack not found' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Error updating rack' });
    }
});

app.delete('/racks/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM racks WHERE id = $1', [id]);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Error deleting rack' });
    }
});

// Equipment - Add these routes
app.put('/equipment/:id', async (req, res) => {
    const { id } = req.params;
    const { rack_id, name, size, start_unit } = req.body;
    try {
        // Check for conflicts, excluding the current equipment being updated
        const overlaps = await pool.query(
            `SELECT * FROM equipment WHERE rack_id = $1 AND id != $2 AND 
            (($3 BETWEEN start_unit AND start_unit + size - 1) OR 
            ($3 + $4 - 1 BETWEEN start_unit AND start_unit + size - 1))`,
            [rack_id, id, start_unit, size]
        );
        if (overlaps.rows.length > 0) {
            return res.status(400).json({ error: 'Equipment placement conflicts with existing equipment' });
        }

        const result = await pool.query(
            'UPDATE equipment SET rack_id = $1, name = $2, size = $3, start_unit = $4 WHERE id = $5 RETURNING *',
            [rack_id, name, size, start_unit, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Equipment not found' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Error updating equipment' });
    }
});

app.delete('/equipment/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM equipment WHERE id = $1', [id]);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Error deleting equipment' });
    }
});

// Get racks for specific user
app.get('/user-racks/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const result = await pool.query(`
            SELECT r.* FROM racks r
            INNER JOIN user_racks ur ON r.id = ur.rack_id
            WHERE ur.user_id = $1
        `, [userId]);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching user racks' });
    }
});

// Update user's rack permissions
app.get('/racks', async (req, res) => {
    const userId = req.query.userId;
    const userGroup = req.query.userGroup;

    if (!userId || !userGroup) {
        return res.status(400).json({ error: 'Missing userId or userGroup' });
    }

    try {
        let result;

        if (userGroup === 'admin') {
            result = await pool.query('SELECT * FROM racks');
        } else {
            result = await pool.query(`
                SELECT DISTINCT r.* 
                FROM racks r
                INNER JOIN user_racks ur ON r.id = ur.rack_id
                WHERE ur.user_id = $1
            `, [userId]);
        }

        console.log('Racks returned for user:', result.rows); // Add this line
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching racks:', error.message);
        res.status(500).json({ error: 'An error occurred while fetching racks' });
    }
});

app.post('/user-racks/:userId', async (req, res) => {
    const { userId } = req.params;
    const { rackIds } = req.body;

    if (!userId || !Array.isArray(rackIds)) {
        return res.status(400).json({ error: 'Invalid userId or rackIds' });
    }

    try {
        await pool.query('BEGIN');

        // Delete existing rack permissions for user
        await pool.query('DELETE FROM user_racks WHERE user_id = $1', [userId]);

        // Insert new rack permissions using parameterized queries
        if (rackIds.length > 0) {
            const insertValues = rackIds.map((rackId, index) => `($1, $${index + 2})`).join(',');
            await pool.query(
                `INSERT INTO user_racks (user_id, rack_id) VALUES ${insertValues}`,
                [userId, ...rackIds]
            );
        }

        await pool.query('COMMIT');
        res.status(200).json({ message: 'Rack permissions updated successfully' });
    } catch (error) {
        console.error('Error updating rack permissions:', error.message);
        try {
            await pool.query('ROLLBACK');
        } catch (rollbackError) {
            console.error('Error during rollback:', rollbackError.message);
        }
        res.status(500).json({ error: 'An error occurred while updating rack permissions' });
    }
});


app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});