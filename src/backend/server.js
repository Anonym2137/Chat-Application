import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import mysql from 'mysql2';
import bcrypt from 'bcrypt';
import multer from 'multer';
import path from 'path';
import connection from './db.js';
import { fileURLToPath } from 'url';
import { format } from 'date-fns';
import { sendPasswordResetEmail } from './email.js';
import dotenv from 'dotenv';
import crypto from 'crypto'

dotenv.config();

const app = express();
const port = process.env.VITE_API_PORT || 3000;
const jwtSecret = process.env.VITE_API_JWT_SECRET;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    jwt.verify(token, jwtSecret, (err, user) => {
      if (err) {
        return res.status(403).send('Invalid token');
      }
      req.user = user;
      next();
    });
  } else {
    res.status(401).send('Token required');
  }
};

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication error'));
  }
  jwt.verify(token, jwtSecret, (err, user) => {
    if (err) {
      return next(new Error('Authentication error'));
    }
    socket.user = user;
    next();
  });
});

app.post('/register', async (req, res) => {
  const { username, password, email, name, surname } = req.body;
  if (!username || !password || !email || !name || !surname) {
    return res.status(400).send('All fields are required');
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = 'INSERT INTO users (username, password, email, name, surname) VALUES (?, ?, ?, ?, ?)';
    connection.query(query, [username, hashedPassword, email, name, surname], (err, results) => {
      if (err) {
        return res.status(500).send('Server error');
      }
      const newUser = { id: results.insertId, username, email, name, surname };
      const token = jwt.sign({ id: newUser.id, username: newUser.username }, jwtSecret, { expiresIn: '1h' });
      res.status(201).json({ message: 'User registered successfully', token, user: newUser });
    });
  } catch (error) {
    res.status(500).send('Server error');
  }
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).send('Username and password are required');
  }

  try {
    const query = 'SELECT * FROM users WHERE username = ?';
    connection.query(query, [username], async (err, results) => {
      if (err) {
        return res.status(500).send('Server error');
      }

      if (results.length === 0) {
        return res.status(400).send('Invalid username or password');
      }

      const user = results[0];
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(400).send('Invalid username or password');
      }

      const token = jwt.sign({ id: user.id, username: user.username }, jwtSecret, { expiresIn: '1h' });
      res.status(200).json({ message: 'Login successful', token, user: { id: user.id, username: user.username } });
    });
  } catch (error) {
    res.status(500).send('Server error');
  }
});

app.put('/profile', authenticateJWT, (req, res) => {
  const { id, name, surname } = req.body;
  if (!id || !name || !surname) {
    return res.status(400).send('All fields are required');
  }

  const query = 'UPDATE users SET name = ?, surname = ? WHERE id = ?';
  connection.query(query, [name, surname, id], (err, results) => {
    if (err) {
      return res.status(500).send('Server error');
    }
    res.send('Profile updated successfully');
  });
});

app.post('/reset-password', async (req, res) => {
  const { email } = req.body;

  const query = 'select * from users where email = ?';
  connection.query(query, [email], (err, results) => {
    if (err) {
      return res.status(500).send('Server error');
    }
    if (results.length === 0) {
      return res.status(404).send('User not found');
    }

    const token = crypto.randomBytes(32).toString('hex');
    const resetQuery = 'insert into password_resets (email, token) values (?, ?)';
    connection.query(resetQuery, [email, token], (err, results) => {
      if (err) {
        return res.status(500).send('Server error');
      }
      sendPasswordResetEmail(email, token);
      res.status(200).send({ message: 'Password reset link has been sent to your email' });
    });
  });
});

app.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  const query = 'select * from password_resets where token = ?';
  connection.query(query, [token], async (err, results) => {
    if (err) {
      return res.status(500).send('Server error');
    }

    if (results.length === 0) {
      return res.status(400).send('Invalid or expired token');
    }

    const { email } = results[0];
    const hashedPassword = await bcrypt.hash(password, 10);
    const updateQuery = 'update users set password = ? where email = ?';
    connection.query(updateQuery, [hashedPassword, email], (err, results) => {
      if (err) {
        return res.status(500).send('Server error');
      }

      res.status(200).send({ message: 'Password has been reset' });
    });
  });
});

app.post('/create-chat-room', authenticateJWT, (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).send('Chat room name is required');
  }

  const query = 'INSERT INTO chatrooms (name) VALUES (?)';
  connection.query(query, [name], (err, results) => {
    if (err) {
      return res.status(500).send('Server error');
    }
    res.status(201).send('Chat room created successfully');
  });
});

app.post('/join-chat-room', authenticateJWT, (req, res) => {
  const { user_id, chat_room_id } = req.body;
  if (!user_id || !chat_room_id) {
    return res.status(400).send('User ID and chat room ID are required');
  }

  const query = 'INSERT INTO userchatrooms (user_id, chat_room_id) VALUES (?, ?)';
  connection.query(query, [user_id, chat_room_id], (err, results) => {
    if (err) {
      return res.status(500).send('Server error');
    }
    res.status(201).send('User joined chat room successfully');
  });
});

app.get('/chat-room-users/:chat_room_id', authenticateJWT, (req, res) => {
  const { chat_room_id } = req.params;
  const query = `
    SELECT users.id, users.username, users.name, users.surname 
    FROM users 
    JOIN userchatrooms ON users.id = userchatrooms.user_id 
    WHERE userchatrooms.chat_room_id = ?
  `;
  connection.query(query, [chat_room_id], (err, results) => {
    if (err) {
      return res.status(500).send('Server error');
    }
    res.status(200).json(results);
  });
});

app.get('/user-messages', authenticateJWT, (req, res) => {
  const userId = req.user.id;

  const query = 'SELECT * FROM messages WHERE user_id = ?';
  connection.query(query, [userId], (err, results) => {
    if (err) {
      return res.status(500).send('Server error');
    }
    res.status(200).json(results);
  });
});

app.post('/send-message', authenticateJWT, (req, res) => {
  const { chat_room_id, user_id, message } = req.body;
  if (!chat_room_id || !user_id || !message) {
    return res.status(400).send('Chat room ID, user ID, and message are required');
  }

  const sentAt = new Date();
  const query = 'INSERT INTO messages (chat_room_id, user_id, message, sent_at) VALUES (?, ?, ?, ?)';
  connection.query(query, [chat_room_id, user_id, message, sentAt], (err, results) => {
    if (err) {
      return res.status(500).send('Server error');
    }

    const sentMessage = { chat_room_id, user_id, message, sent_at: sentAt };
    io.to(chat_room_id).emit('new_message', sentMessage);
    res.status(201).json(sentMessage);
  });
});

app.get('/chat-history/:chat_room_id', authenticateJWT, (req, res) => {
  const { chat_room_id } = req.params;
  const query = 'SELECT * FROM messages WHERE chat_room_id = ? ORDER BY sent_at ASC';
  connection.query(query, [chat_room_id], (err, results) => {
    if (err) {
      return res.status(500).send('Server error');
    }
    res.status(200).json(results);
  });
});

app.post('/refresh-token', (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res.status(401).send('Token required');
  }

  jwt.verify(token, jwtSecret, (err, user) => {
    if (err) {
      return res.status(403).send('Invalid token');
    }

    const newToken = jwt.sign({ id: user.id, username: user.username }, jwtSecret, { expiresIn: '1h' });
    res.status(200).json({ token: newToken });
  });
});

app.get('/profile/:id', authenticateJWT, (req, res) => {
  const { id } = req.params;

  const query = 'SELECT id, username, email, name, surname, note, avatar FROM users WHERE id = ?';
  connection.query(query, [id], (err, results) => {
    if (err) {
      return res.status(500).send('Server error');
    }

    if (results.length === 0) {
      return res.status(404).send('User not found');
    }

    res.status(200).json(results[0]);
  });
});

app.put('/update-profile', authenticateJWT, upload.single('avatar'), async (req, res) => {
  const { id, username, password, email, name, surname, note } = req.body;
  const avatar = req.file ? `/uploads/${req.file.filename}` : undefined;

  if (!id || !username || !email || !name || !surname) {
    return res.status(400).send('All fields except password are required');
  }
  try {
    let hashedPassword;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    const query = `UPDATE users SET username = ?, email = ?, name = ?, surname = ?, note = ? ${password ? ', password = ?' : ''} ${avatar ? ', avatar = ?' : ''} WHERE id = ?`;
    const queryParams = [username, email, name, surname, note, ...(password ? [hashedPassword] : []), ...(avatar ? [avatar] : []), id];
    connection.query(query, queryParams, (err, results) => {
      if (err) {
        console.error('Database query error: ', err);
        return res.status(500).send('Server error');
      }
      res.status(200).send('Profile updated successfully');
    });
  }
  catch (err) {
    console.error('Error updating profile: ', err);
    res.status(500).send('Server error');
  }
});

app.get('/chat-rooms', authenticateJWT, (req, res) => {
  const query = 'SELECT id, name FROM chatrooms';
  connection.query(query, (err, results) => {
    if (err) {
      return res.status(500).send('Server error');
    }
    res.status(200).send(results);
  });
});

app.get('/user-chat-rooms/:userId', authenticateJWT, (req, res) => {
  const { userId } = req.params;
  const query = `
    SELECT chatrooms.id, chatrooms.name 
    FROM chatrooms 
    JOIN userchatrooms ON chatrooms.id = userchatrooms.chat_room_id 
    WHERE userchatrooms.user_id = ?
  `;
  connection.query(query, [userId], (err, results) => {
    if (err) {
      return res.status(500).send('Server error');
    }
    res.status(200).json(results);
  });
});

app.post('/create-user-chatroom', authenticateJWT, (req, res) => {
  const { user_id } = req.body;
  const current_user_id = req.user.id;

  const checkRoomQuery = `
    SELECT chat_room_id 
    FROM userchatrooms 
    WHERE chat_room_id IN (
      SELECT chat_room_id 
      FROM userchatrooms 
      WHERE user_id = ?
    ) 
    AND user_id = ?
  `;

  connection.query(checkRoomQuery, [current_user_id, user_id], (err, results) => {
    if (err) {
      return res.status(500).send('Server error');
    }

    if (results.length > 0) {
      res.status(200).json({ chat_room_id: results[0].chat_room_id });
    } else {
      const chat_room_id = Math.floor(Math.random() * 1000000);
      const chat_room_name = `Chat Room ${chat_room_id}`;

      const insertRoomQuery = 'INSERT INTO chatrooms (id, name) VALUES (?, ?)';
      connection.query(insertRoomQuery, [chat_room_id, chat_room_name], (err) => {
        if (err) {
          return res.status(500).send('Server error');
        }

        const insertUserChatroomQuery = 'INSERT INTO userchatrooms (chat_room_id, user_id) VALUES (?, ?), (?, ?)';
        connection.query(insertUserChatroomQuery, [chat_room_id, current_user_id, chat_room_id, user_id], (err) => {
          if (err) {
            return res.status(500).send('Server error');
          }

          res.status(201).json({ chat_room_id });
        });
      });
    }
  });
});

app.post('/send-user-message', authenticateJWT, (req, res) => {
  const { chat_room_id, message } = req.body;
  const user_id = req.user.id;

  if (!chat_room_id || !message) {
    return res.status(400).send('Chat room id and message are required');
  }

  const sentAt = new Date();
  const query = 'INSERT INTO messages (chat_room_id, user_id, message, sent_at) VALUES (?, ?, ?, ?)';
  connection.query(query, [chat_room_id, user_id, message, sentAt], (err, results) => {
    if (err) {
      return res.status(500).send('Server error');
    }
    const sentMessage = { chat_room_id, user_id, message, sent_at: sentAt };
    io.to(chat_room_id).emit('new_message', sentMessage);
    res.status(201).json(sentMessage);
  });
});

app.get('/user-messages/:chat_room_id', authenticateJWT, (req, res) => {
  const { chat_room_id } = req.params;
  const user_id = req.user.id;

  const query = `
    SELECT messages.*, users.username, users.avatar 
    FROM messages 
    JOIN users ON messages.user_id = users.id 
    WHERE messages.chat_room_id = ? 
    ORDER BY messages.sent_at ASC
  `;
  connection.query(query, [chat_room_id], (err, results) => {
    if (err) {
      return res.status(500).send('Server error');
    }
    res.status(200).json(results);
  });
});

app.get('/users', authenticateJWT, (req, res) => {
  const userId = req.user.id;

  const query = 'SELECT id, username FROM users WHERE id != ?';
  connection.query(query, [userId], (err, results) => {
    if (err) {
      return res.status(500).send('Server error');
    }
    res.status(200).json(results);
  });
});

app.get('/search-users', authenticateJWT, (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).send('Query is required');
  }
  const userId = req.user.id;
  const searchQuery = 'SELECT id, username FROM users WHERE username LIKE ? AND id != ?';
  connection.query(searchQuery, [`%${query}%`, userId], (err, results) => {
    if (err) {
      return res.status(500).send('Server error');
    }
    res.status(200).json(results);
  });
});

app.get('/direct-chats', authenticateJWT, (req, res) => {
  const userId = req.user.id;

  const query = `
    SELECT DISTINCT u.id, u.username 
    FROM users u 
    JOIN messages m ON m.user_id = u.id OR m.user_id = ? 
    WHERE u.id != ? AND m.chat_room_id IN (
      SELECT chat_room_id FROM messages WHERE user_id = ?
    )
  `;
  connection.query(query, [userId, userId, userId], (err, results) => {
    if (err) {
      return res.status(500).send('Server error');
    }
    res.status(200).json(results);
  });
});

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('joinRoom', (room) => {
    socket.join(room);
    console.log(`User joined room: ${room}`);
  });

  socket.on('chatMessage', (msg) => {
    const { chat_room_id, user_id, username, message } = msg;
    const sent_at = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
    console.log('Message received from client:', msg);
    const query = 'INSERT INTO messages (chat_room_id, user_id, message, sent_at) VALUES (?, ?, ?, ?)';
    connection.query(query, [chat_room_id, user_id, message, sent_at], (err, results) => {
      if (err) {
        console.error('Database query error:', err);
        return;
      }
      const sentMessage = { chat_room_id, user_id, username, message, sent_at };
      console.log('Message sent:', sentMessage);
      io.to(chat_room_id).emit('New_message', sentMessage);
    });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
