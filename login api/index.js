const express = require('express');
const pool = require('./db');
const app = express();
const bodyParser = require('body-parser');
const { body, validationResult } = require('express-validator');
const PORT = 5000;

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT,DELETE');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  next();
});
app.use(express.json()); 

app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('<h1>Login JS API</h1>');
})

app.get('/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM login');
    res.json({ status: "200", users: result.rows });
  } catch (error) {
    console.error('Error fetching users:', error.message);
    res.status(500).send('Server Error');
  }
});

app.post('/mobileid',[
  body('id').notEmpty().withMessage('Mobile number is required')
            .isMobilePhone().withMessage('Invalid mobile number')
],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ status: "400", error: errors.array() });
      }

      const { id } = req.body;
      const result = await pool.query('SELECT * FROM login WHERE mobile = $1', [id]);

      if (result.rows.length > 0) {
        res.json({ status: "200", message: "success", data: result.rows });
      } else {
        res.json({ status: "400", message: "no data found" });
      }
    } catch (err) {
      console.error("Server error:", err.message);
      res.status(500).json({ status: "500", message: "Internal Server Error" });
    }
  });

/*
app.post('/login', async (req, res) => {
  try {
    const {email,pass} = req.body;
    const result = await pool.query('select email,pass from login where email=$1 and pass=$2',[email,pass]);
    if(result.rows.length>0){
      res.json({status: "200", message:'login successful',user: result.rows});
    }else{
    res.json({status: "400", message:'login failed',user:'{ User Not Found }'});
    }
    //res.json({ status: "200", users: result.rows });
  } catch (error) {
    console.error('Error fetching users:', error.message);
    res.status(500).send('Server Error');
  }
});
*/

app.post('/login', async (req, res) => {
  try {
    const { email, pass } = req.body;
    
    // Check if user exists and password matches in a single query
    const result = await pool.query('SELECT * FROM login WHERE email = $1 AND pass = $2', [email, pass]);

    // If no matching user, return error
    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // User found and password matches
    const user = result.rows[0];
    res.json({ status: '200', message: 'Login successful', user: { email: user.email, pass: user.pass, id: user.id } // Include relevant user info
    });

  } catch (error) {
    console.error('Error fetching users:', error.message);
    res.status(500).send('Server Error');
  }
});

app.post('/reg', [
  body('users').notEmpty().withMessage('users is required'),
  body('email').notEmpty().withMessage('email is required'),
  body('mobile').notEmpty().withMessage('mobile is required'),
  body('pass').notEmpty().withMessage('pass is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array() });
    }

    const { users, email, mobile, pass } = req.body;

    // Optional: Check if user/email already exists
    const existingUser = await pool.query('SELECT * FROM login WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    await pool.query('INSERT INTO login(users, email, mobile, pass) VALUES($1, $2, $3, $4)', 
      [users, email, mobile, pass]);

    res.send({ status: "200", message: "Register Saved Successfully" });

  } catch (error) {
    console.log(error.message);
    res.status(500).send('Server Error');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
