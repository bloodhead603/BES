const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(express.static(__dirname));

const USERS_FILE = path.join(__dirname, 'users.json');

// Serve login.html for /login.html and /
app.get(['/', '/login.html'], (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

// Serve index.html for /index.html
app.get('/index.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

function readUsers() {
    if (!fs.existsSync(USERS_FILE)) return [];
    return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
}

function writeUsers(users) {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

app.post('/register', (req, res) => {
    const { username, password, email } = req.body;
    if (!username || !password || !email) return res.status(400).json({ error: 'Missing fields' });
    if (!email.endsWith('@gmail.com')) return res.status(400).json({ error: 'Email must be Gmail' });
    let users = readUsers();
    if (users.find(u => u.username === username)) {
        return res.status(409).json({ error: 'User already exists' });
    }
    users.push({ username, password, email });
    writeUsers(users);
    res.json({ success: true });
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    let users = readUsers();
    const user = users.find(u => u.username === username && u.password === password);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    res.json({ success: true });
});

// API endpoint for leaderboard data (GET and POST)
const LEADERBOARD_FILE = path.join(__dirname, 'leaderboard.json');

function readLeaderboard(username) {
    const file = username ? path.join(__dirname, `leaderboard_${username}.json`) : LEADERBOARD_FILE;
    if (!fs.existsSync(file)) return [];
    return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeLeaderboard(username, data) {
    const file = username ? path.join(__dirname, `leaderboard_${username}.json`) : LEADERBOARD_FILE;
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// Get leaderboard for a user
app.get('/api/leaderboard', (req, res) => {
    const username = req.query.username;
    const data = readLeaderboard(username);
    res.json(data);
});

// Save leaderboard for a user
app.post('/api/leaderboard', (req, res) => {
    const username = req.body.username;
    const leaderboard = req.body.leaderboard;
    if (!username || !leaderboard) return res.status(400).json({ error: 'Missing fields' });
    writeLeaderboard(username, leaderboard);
    res.json({ success: true });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
