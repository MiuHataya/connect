const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const app = express();

// MySQL接続
const db = mysql.createConnection({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  port: process.env.MYSQL_PORT,
});

// 接続確認
db.connect((err) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Connected to MySQL');
  }
});

//リクエストを JSON 形式として処理する
app.use(bodyParser.json());


// POSTリクエストでユーザー情報をデータベースに保存
app.post('/user', (req, res) => {
  res.status(400).json({ message: 'User のページです！' });
  
  const { name, email } = req.body;
  if (!name || !email) {
    return res.status(401).json({ message: 'Name and email are required' });
  }

  const query = 'INSERT INTO users (name, email) VALUES (?, ?)';
  db.query(query, [name, email], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Error inserting user', error: err });
    }
    res.status(501).json({ message: 'User created', userId: results.insertId });
  });
});

app.get('/', (req, res, next) => {
  res.status(200).json({ message: 'User inputは必要です！' });
});


// ポートの設定
const port = process.env.PORT || 8080;

// サーバー起動
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
