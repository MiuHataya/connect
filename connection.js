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
  const { user_name, email, password } = req.body;

  // リクエストボディのデータをコンソールに表示
  console.log('Received data:');
  console.log(`User Name: ${user_name}`);
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);
  
   // パスワードをハッシュ化
  const hashedPassword = await bcrypt.hash(password, 3);

  // user の追加
  const query = 'INSERT INTO user_table (user_name, email, password) VALUES (?, ?, ?)';
  db.query(query, [user_name, email, hashedPassword], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Error inserting user', error: err });
    }
    res.status(501).json({ message: 'User created successfully', userId: results.insertId });
  });
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;

  // データベースからユーザーを取得
  const query = 'SELECT * FROM user_table WHERE email = ?';
  db.query(query, [email], async (err, results) => {
    if (err || results.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    const user = results[0];
    // 入力したパスワードとデータベースのハッシュ化されたパスワードを比較
    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      res.status(600).json({ message: 'Login successful' });
    } else {
      res.status(601).json({ message: 'Invalid password' });
    }
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
