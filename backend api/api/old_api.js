const express = require('express');
const pool = require ('./db');
const app = express();
const bodyParser = require('body-parser');
const PORT = 5000;

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*"); // Allow all origins
    res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT,DELETE"); // Allow specific methods
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization"); // Allow specific headers
    next();
});

app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send('<h1>Express JS API</h1>');
  })

app.get('/menu', async (req, res) => {
  try{
    const result = await pool.query('SELECT * FROM menu');
    res.json(result.rows);
  }catch{
    console.log(error.messege);
    res.status(500).send('Server Error');
  }
});

app.get('/menucard', async (req, res) => {
  try{
    const result = await pool.query('select menu_name,menu_price,group_name, qty_type from menu,food_group,qtymast where food_group.gid=menu.gid and qtymast.qid=menu.qid;');
      res.json(result.rows);
  }catch{
    console.log(error.messege);
    res.status(500).send('Server Error');
  }
});

//app.get('/menuid/:id'    #pass the id in url
//app.get('/menuid'        #pass the id in body
app.get('/menuid', async (req, res) => {
    try{
        const { id } = req.body;
        const result = await pool.query('select * from menu where mid=$1',[id]);
        res.json(result.rows)
      }catch(err){
      console.log(error.messege);
      res.status(500).send('Server Error');
      }
  });
  

//app.get('/addmenu'        #pass the id in body
app.post('/addmenu',async (req, res) => {
  try{
    const { menu_name,menu_price, gid, qid } = req.body;
    const result = await pool.query('insert into menu(menu_name,menu_price,gid,qid)values($1,$2,$3,$4)',
        [menu_name,menu_price, gid, qid]);
        res.json(result.rows);
  }catch{
    console.log(error.messege);
    res.status(500).send('Server Error');
  }
});

//app.get('/updmenu'        #pass the id in body
app.put('/updmenu',async (req, res) => {
  try{
      const { menu_name,menu_price, gid, qid, mid } = req.body;
      const result =await pool.query('update menu set menu_name=$1,menu_price=$2,gid=$3,qid=$4 where mid=$5',
          [menu_name,menu_price, gid, qid, mid]);
          res.json(result.rows);
    }catch{
    console.log(error.messege);
    res.status(500).send('Server Error');
  }
});

//app.get('/delmenu/:id'    #pass the id in url
//app.get('/delmenu'        #pass the id in body
app.delete('/delmenu',async (req, res) => {
  try{
        const { mid } = req.body;
        const result = await pool.query('select * from menu where mid=$1',[mid]);
          await pool.query('delete from menu where mid=$1',[mid]);
          res.json(result.rows);
    }catch{
      console.log(error.messege);
      res.status(500).send('Server Error');
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });