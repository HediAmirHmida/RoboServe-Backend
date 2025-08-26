const express = require("express");
const mysql = require('mysql');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'hedi23873499&',
    port: 3306,
    database: 'testrobo' // Add the database name here
});

// Connect to MySQL
db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL database:', err);
        return;
    }
    console.log('Connected to MySQL database...');
});


app.get('/get-commandes', (req, res) => {
   
    const selectCommandesQuery = `SELECT * FROM commandes`;

    
    db.query(selectCommandesQuery, (err, results) => {
        if (err) {
            console.error('Error fetching commandes:', err);
            return res.status(500).json({ error: 'Failed to fetch commandes' });
        }
       
        const commandes = results.map(commande => ({
            num: commande.id, // Use the ID as the 'num' property
            text: commande.text,
            note: commande.note,
            tableNumber: commande.tableNumber,
            currentState: commande.currentState
        }));
        
        res.status(200).json(commandes);
    });
});
app.delete('/delete-commande/:id', (req, res) => {
    const commandeId = req.params.id;
    const deleteCommandeQuery = `DELETE FROM commandes WHERE id = ?`;
    db.query(deleteCommandeQuery, [commandeId], (err, result) => {
        if (err) {
            console.error('Error deleting commande:', err);
            return res.status(500).json({ error: 'Failed to delete commande' });
        }
        console.log('Commande deleted successfully');
        res.status(200).json({ message: 'Commande deleted successfully' });
    });
});
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const selectUserQuery = `SELECT * FROM users WHERE username = ? AND password = ?`;

    db.query(selectUserQuery, [username, password], (err, results) => {
        if (err) {
            console.error('Error fetching user:', err);
            return res.status(500).json({ error: 'Failed to authenticate user' });
        }

        if (results.length === 0) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        // User authenticated successfully
        res.status(200).json({ message: 'Login successful' });
    });
});
// Update the state of a commande
app.put('/update-commande/:id', (req, res) => {
    const commandeId = req.params.id;
    const newState = req.body.currentState;
    const updateCommandeQuery = `UPDATE commandes SET currentState = ? WHERE id = ?`;
    
    db.query(updateCommandeQuery, [newState, commandeId], (err, result) => {
        if (err) {
            console.error('Error updating commande state:', err);
            return res.status(500).json({ error: 'Failed to update commande state' });
        }
        console.log('Commande state updated successfully');
        res.status(200).json({ message: 'Commande state updated successfully' });
    });
});
app.post('/signup', (req, res) => {
    const { username, password } = req.body;
    
    // Check if username already exists
    db.query('SELECT * FROM users WHERE username = ?', [username], (err, results) => {
        if (err) {
            console.error('Error checking username:', err);
            return res.status(500).json({ error: 'Failed to sign up user' });
        }
        
        // If username exists, return error
        if (results.length > 0) {
            return res.status(400).json({ error: 'Username already exists' });
        }

        // Insert new user into the database
        db.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, password], (err, result) => {
            if (err) {
                console.error('Error inserting user:', err);
                return res.status(500).json({ error: 'Failed to sign up user' });
            }
            console.log('User signed up successfully');
            res.status(200).json({ message: 'Sign up successful' });
        });
    });
});
app.post('/reset-password', (req, res) => {
    const { username, newPassword } = req.body;
    const updatePasswordQuery = `UPDATE users SET password = ? WHERE username = ?`;

    db.query(updatePasswordQuery, [newPassword, username], (err, result) => {
        if (err) {
            console.error('Error resetting password:', err);
            return res.status(500).json({ error: 'Failed to reset password' });
        }

        if (result.affectedRows === 0) {
            // No rows were affected (username not found)
            return res.status(404).json({ error: 'User not found' });
        }

        // Password reset successful
        console.log('Password reset successfully');
        res.status(200).json({ message: 'Password reset successful' });
    });
});



const PORT = 3000;

//app.listen(PORT, () => {
  //  console.log(`Server is running on port ${PORT}`);
//});
const HOST = '192.168.1.66'; // Bind to this IP address

app.listen(PORT, HOST, () => {
    console.log(`Server is running on http://${HOST}:${PORT}`);
});
