const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const app = express();

// MySQL接続
const db = mysql.createConnection({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  port: process.env.MYSQL_PORT,
});

db.connect((err) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Connected to MySQL');
  }
});

//リクエストを JSON 形式として処理する
app.use(bodyParser.json());


// ユーザー登録
app.post('/user', async (req, res) => {
  const { user_name, email, password } = req.body;

  console.log('Received data:');
  console.log(`User Name: ${user_name}`);
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);

  // パスワードをハッシュ化
  const hashedPassword = await bcrypt.hash(password, 5);

  const query = 'INSERT INTO user_table (user_name, email, password) VALUES (?, ?, ?)';
  db.query(query, [user_name, email, hashedPassword], (err, results) => {
    if (err) {
      return res.status(401).json({ message: 'Error inserting user', error: err });
    }
    res.status(201).json({ message: 'User created successfully', userId: results.insertId });
  });
});


// ログイン処理
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  console.log('Received data:');
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);

  const query = 'SELECT * FROM user_table WHERE email = ?';
  db.query(query, [email], async (err, results) => {
    if (err || results.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      res.status(200).json({ message: 'Login successful' , userId: user.user_id, userName: user.user_name});
    } else {
      res.status(401).json({ message: 'Incorrect password' });
    }
  });
});

// ログイン処理
app.get('/story', (req, res) => {
  const { user_ID } = req.query;

  console.log('Received data:');
  console.log(`ID: ${user_ID}`);

  const query = 'SELECT * FROM story_table WHERE user_id = ?';
  db.query(query, [user_ID], async (err, results) => {
    if (err) {
      return res.status(404).json({ message: 'User not found' });
    } else if (results.length === 0){
      return res.status(401).json({ message: 'No story yet' });
    }

    res.status(200).json({
      message: 'Story successful',
      stories: results.map(story => ({
        prompt: story.prompt,
        generated: story.story
      }))
    });
  });
});


// デフォルトメッセージ
app.get('/', (req, res) => {
  res.status(200).json({ message: 'User inputは必要です！' });
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
