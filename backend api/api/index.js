const express = require('express');
const pool = require('./db');
const app = express();
const bodyParser = require('body-parser');
const { body, validationResult } = require('express-validator');
const PORT = 3000;

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*"); // Allow all origins
  res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT,DELETE"); // Allow specific methods
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization"); // Allow specific headers
  next();
});

app.use(express.json());
app.use(bodyParser.json());
app.get('/', (req, res) => {
  res.send('<h1>Express JS API</h1>');
});



app.post('/orders', [
  body('table_number').isInt({ min: 1 }).withMessage('Table number must be a positive integer.'),
  body('menu_id').isInt().withMessage('Menu ID must be an integer.'),
  body('quantity').optional().isInt({ min: 1 }).withMessage('Quantity must be a positive integer.'),
  body('ordered_menu_name').notEmpty().withMessage('Menu name is required.'),
  body('ordered_menu_price').isFloat().withMessage('Price must be a float value.'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log("Validation errors:", errors.array());
    return res.status(400).json({ status: "400", errors: errors.array() });
  }

  const { table_number, menu_id, quantity = 1, ordered_menu_name, ordered_menu_price } = req.body;
  console.log("Received order request:", req.body);

  try {
    const menuCheck = await pool.query('SELECT mid FROM menu WHERE mid = $1', [menu_id]);
    if (!menuCheck.rows.length) {
      console.warn(`Menu item with ID ${menu_id} not found.`);
      return res.status(404).json({ status: "404", message: "Menu item not found." });
    }

    const insertRes = await pool.query(
      `INSERT INTO orders (table_number, menu_id, quantity, ordered_menu_name, ordered_menu_price, status)
        VALUES ($1, $2, $3, $4, $5, 'pending') RETURNING *`,
      [table_number, menu_id, quantity, ordered_menu_name, ordered_menu_price]
    );
    console.log("Order inserted:", insertRes.rows[0]);

    res.json({ status: "200", message: "Order item added successfully." });
  } catch (err) {
    console.error('Error adding order item:', err);
    res.status(500).json({ status: "500", message: "Server Error adding order item." });
  }
});


app.get('/orders/:tableNumber', async (req, res) => {
  const { tableNumber } = req.params;
  if (isNaN(tableNumber) || parseInt(tableNumber) < 1) {
    return res.status(400).json({ status: "400", message: "Invalid table number." });
  }
  try {
    const result = await pool.query(
      `SELECT o.*, fg.group_name, qm.qty_type
       FROM orders o
       JOIN menu m ON o.menu_id = m.mid
       JOIN food_group fg ON m.gid = fg.gid
       JOIN qtymast qm ON m.qid = qm.qid
       WHERE o.table_number = $1 AND o.status IN ('pending', 'billed')
       ORDER BY o.order_time ASC`,
      [tableNumber]
    );
    res.json({ status: result.rows.length ? "200" : "404", data: result.rows });
  } catch (err) {
    console.error('Error fetching table orders:', err.message);
    res.status(500).json({ status: "500", message: "Server Error fetching table orders." });
  }
});

app.get('/allorders', async (_, res) => {
  try {
    const result = await pool.query(
      `SELECT o.*, fg.group_name, qm.qty_type
       FROM orders o
       JOIN menu m ON o.menu_id = m.mid
       JOIN food_group fg ON m.gid = fg.gid
       JOIN qtymast qm ON m.qid = qm.qid
       WHERE o.status IN ('pending', 'billed')
       ORDER BY o.table_number, o.order_time`
    );
    const grouped = result.rows.reduce((acc, row) => {
      acc[row.table_number] = acc[row.table_number] || [];
      acc[row.table_number].push(row);
      return acc;
    }, {});
    res.json({ status: Object.keys(grouped).length ? "200" : "404", data: grouped });
  } catch (err) {
    console.error('Error fetching all orders:', err.message);
    res.status(500).json({ status: "500", message: "Server Error fetching all orders." });
  }
});

app.put('/orders/bill/:tableNumber', async (req, res) => {
  const { tableNumber } = req.params;
  if (isNaN(tableNumber)) return res.status(400).json({ status: "400", message: "Invalid table number." });

  try {
    const result = await pool.query(
      "UPDATE orders SET status = 'billed' WHERE table_number = $1 AND status = 'pending' RETURNING *",
      [tableNumber]
    );
    res.json({ status: result.rows.length ? "200" : "404", message: result.rows.length ? `Bill generated for Table ${tableNumber}.` : `No pending orders.` });
  } catch (err) {
    res.status(500).json({ status: "500", message: err.message });
  }
});

app.put('/orders/paid/:tableNumber', async (req, res) => {
  const { tableNumber } = req.params;
  if (isNaN(tableNumber)) return res.status(400).json({ status: "400", message: "Invalid table number." });

  try {
    const result = await pool.query(
      "UPDATE orders SET status = 'paid' WHERE table_number = $1 AND status IN ('pending', 'billed') RETURNING *",
      [tableNumber]
    );
    res.json({ status: result.rows.length ? "200" : "404", message: result.rows.length ? `Marked as paid.` : `No orders to update.` });
  } catch (err) {
    res.status(500).json({ status: "500", message: err.message });
  }
});





app.get('/menu', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM menu');
    res.json({ status: "200", Menu_List: result.rows });
  } catch {
    console.log(error.messege);
    res.status(500).send('Server Error');
  }
});

app.post('/menuid',
  [body('id').notEmpty().withMessage('id is required')],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: error.array() });
      } else {
        const { id } = req.body;
        const result = await pool.query('select * from menu where mid=$1', [id]);
        if (result.rows.length > 0) {
          res.json({ status: "200", message: "success", data: result.rows })
        }
        else {
          res.json({ status: "400", message: "no data found" })
        }
      }
    } catch (err) {
      console.log(error.messege);
      res.status(500).send('Server Error');
    }
  });

// ✅ Final /menucard API in index.js
app.get('/menucard', async (_, res) => {
  try {
    const result = await pool.query(`
      SELECT m.mid, m.menu_name, m.menu_price, fg.group_name, qm.qty_type
      FROM menu m
      JOIN food_group fg ON m.gid = fg.gid
      JOIN qtymast qm ON m.qid = qm.qid
    `);
    res.json({ status: "200", data: result.rows });
  } catch (err) {
    console.error("Error fetching menu:", err.message);
    res.status(500).json({ status: "500", message: "Server error fetching menu" });
  }
});


app.post('/addmenu', [
  body('menu_name').notEmpty().withMessage('menu_name is require'),
  body('menu_price').notEmpty().withMessage('menu_price is require'),
  body('gid').notEmpty().withMessage('gid is require'),
  body('qid').notEmpty().withMessage('qid is require')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: error.array() });
    } else {
      const { menu_name, menu_price, gid, qid } = req.body;
      const result = await pool.query('SELECT * FROM menu');
      if (result.rows.length > 0) {
        await pool.query('insert into menu(menu_name,menu_price,gid,qid)values($1,$2,$3,$4)',
          [menu_name, menu_price, gid, qid]);
        res.send({ status: "200", message: "Menu List Save Successfully" });
      } else {
        res.send({ status: "400", message: "Menu List Save Failed" });
      }
    }
  } catch {
    console.log(error.messege);
    res.status(500).send('Server Error');
  }
});

app.put('/updmenu', [
  body('menu_name').notEmpty().withMessage('menu_name is require'),
  body('menu_price').notEmpty().withMessage('menu_price is require'),
  body('gid').notEmpty().withMessage('gid is require'),
  body('qid').notEmpty().withMessage('qid is require'),
  body('mid').notEmpty().withMessage('mid is require')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: error.array() });
    } else {
      const { menu_name, menu_price, gid, qid, mid } = req.body;
      const result = await pool.query('select * from menu where mid=$1', [mid]);
      if (result.rows.length > 0) {
        await pool.query('update menu set menu_name=$1,menu_price=$2,gid=$3,qid=$4 where mid=$5',
          [menu_name, menu_price, gid, qid, mid]);
        res.send({ status: "200", message: "Menu List Update Successfully" });
      } else {
        res.send({ status: "400", message: "Menu List Not Found Update Failed" });
      }
    }
  } catch {
    console.log(error.messege);
    res.status(500).send('Server Error');
  }
});

app.delete('/delmenu',
  [body('mid').notEmpty().withMessage('id is require')],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: error.array() });
      } else {
        const { mid } = req.body;
        const result = await pool.query('select * from menu where mid=$1', [mid]);
        if (result.rows.length > 0) {
          await pool.query('delete from menu where mid=$1', [mid]);
          res.send({ status: "200", message: "Menu List Delete Successfully" });
        } else {
          res.send({ status: "400", message: "Menu List Not Found Delete Failed" });
        }
      }
    } catch {
      console.log(error.messege);
      res.status(500).send('Server Error');
    }
  });


///////////////////////////food_group///////////////////////////

// ✅ GET all food groups
app.get('/food_group', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM food_group');
    res.json({ status: "200", food_group: result.rows });
  } catch (error) {
    console.log(error.message);
    res.status(500).send('Server Error');
  }
});

// ✅ GET food group by ID (not used in frontend currently)
app.get('/foodgroupid', [
  body('gid').notEmpty().withMessage('id is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array() });
    }

    const { gid } = req.body;
    const result = await pool.query('SELECT * FROM food_group WHERE gid = $1', [gid]);

    if (result.rows.length > 0) {
      res.json({ status: "200", message: "success", data: result.rows });
    } else {
      res.json({ status: "400", message: "no data found" });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).send('Server Error');
  }
});

// ✅ POST add new food group
app.post('/addfoodgroup', [
  body('group_name').notEmpty().withMessage('group_name is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array() });
    }

    const { group_name } = req.body;

    await pool.query('INSERT INTO food_group (group_name) VALUES ($1)', [group_name]);
    res.send({ status: "200", message: "Food Group Save Successfully" });

  } catch (error) {
    console.log(error.message);
    res.status(500).send('Server Error');
  }
});

// ✅ PUT update existing food group
app.put('/updfoodgroup', [
  body('group_name').notEmpty().withMessage('group_name is required'),
  body('gid').notEmpty().withMessage('gid is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array() });
    }

    const { group_name, gid } = req.body;
    const result = await pool.query('SELECT * FROM food_group WHERE gid=$1', [gid]);

    if (result.rows.length > 0) {
      await pool.query('UPDATE food_group SET group_name=$1 WHERE gid=$2', [group_name, gid]);
      res.send({ status: "200", message: "Food Group Update Successfully" });
    } else {
      res.send({ status: "400", message: "Food Group Not Found. Update Failed" });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).send('Server Error');
  }
});

// ✅ DELETE a food group
app.delete('/delfoodgroup', [
  body('gid').notEmpty().withMessage('gid is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array() });
    }

    const { gid } = req.body;
    const result = await pool.query('SELECT * FROM food_group WHERE gid=$1', [gid]);

    if (result.rows.length > 0) {
      await pool.query('DELETE FROM food_group WHERE gid=$1', [gid]);
      res.send({ status: "200", message: "Food Group Delete Successfully" });
    } else {
      res.send({ status: "400", message: "Food Group Not Found. Delete Failed" });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).send('Server Error');
  }
});


/////////////////////////qtymast////////////////////////////

app.get('/qtymast', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM qtymast');
    res.json({ status: "200", qtymast: result.rows });
  } catch {
    console.log(error.messege);
    res.status(500).send('Server Error');
  }
});

app.get('/qtymastid',
  [body('qid').notEmpty().withMessage('qid is required')],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: error.array() });
      } else {
        const { qid } = req.body;
        const result = await pool.query('select * from qtymast where qid=$1', [qid]);
        if (result.rows.length > 0) {
          res.json({ status: "200", message: "success", data: result.rows })
        }
        else {
          res.json({ status: "400", message: "no data found" })
        }
      }
    } catch (err) {
      console.log(error.messege);
      res.status(500).send('Server Error');
    }
  });

app.post('/addqtymast', [
  body('qty_type').notEmpty().withMessage('qty_type is require')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: error.array() });
    } else {
      const { qty_type } = req.body;
      const result = await pool.query('SELECT * FROM qtymast');
      if (result.rows.length > 0) {
        await pool.query('insert into qtymast(qty_type)values($1)',
          [qty_type]);
        res.send({ status: "200", message: "qtymast Save Successfully" });
      } else {
        res.send({ status: "400", message: "qtymast Save Failed" });
      }
    }
  } catch {
    console.log(error.messege);
    res.status(500).send('Server Error');
  }
});

app.put('/updqtymast', [
  body('qty_type').notEmpty().withMessage('qty_type is require'),
  body('qid').notEmpty().withMessage('qid is require')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: error.array() });
    } else {
      const { qty_type, qid } = req.body;
      const result = await pool.query('select * from qtymast where qid=$1', [qid]);
      if (result.rows.length > 0) {
        await pool.query('update qtymast set qty_type=$1 where qid=$2',
          [qty_type, qid]);
        res.send({ status: "200", message: "qtymast Update Successfully" });
      } else {
        res.send({ status: "400", message: "qtymast Not Found Update Failed" });
      }
    }
  } catch {
    console.log(error.messege);
    res.status(500).send('Server Error');
  }
});

app.delete('/delqtymast',
  [body('qid').notEmpty().withMessage('qid is require')],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: error.array() });
      } else {
        const { qid } = req.body;
        const result = await pool.query('select * from qtymast where qid=$1', [qid]);
        if (result.rows.length > 0) {
          await pool.query('delete from qtymast where qid=$1', [qid]);
          res.send({ status: "200", message: "qtymast Delete Successfully" });
        } else {
          res.send({ status: "400", message: "qtymast Not Found Delete Failed" });
        }
      }
    } catch {
      console.log(error.messege);
      res.status(500).send('Server Error');
    }
  });

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});