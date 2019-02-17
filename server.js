const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');
const db = knex({
    client: 'pg',
    connection: {
    host : '127.0.0.1',
    user : '',
    password : '',
    database : 'smart-brain'
    }
})
/* const knex = require('knex')({
    client: 'pg',
    connection: {
    host : '127.0.0.1',
    user : '',
    password : '',
    database : 'smart-brain'
    }
}) */
/* or
 knex({
    client: 'mysql',
    connection: {
    host : '127.0.0.1',
    user : 'your_database_user',
    password : 'your_database_password',
    database : 'myapp_test'
    }
})
*/


db.select('*').from('users') //this returns a promise
.then(data => console.log(data));

const app = express();

const database ={
    users: [
        {
            id :'123',
            name:'John',
            email:'john@gmail.com',
            password:'cookies',
            entries : 0,
            joined : new Date(),
        },
        
        {
            id :'124',
            name:'Sally',
            email:'sally@gmail.com',
            password:'bananas',
            entries : 0,
            joined : new Date(),
        }
    ]
};

app.use(bodyParser.json())
app.use(cors())

app.get('/', (req, res) =>{
    res.send(database.users);
})

app.post('/signin', (req, res) =>{
    db.select('email', 'hash').from('login')
        .where('email','=', req.body.email)
        .then(data =>{
            const isValid=bcrypt.compareSync(req.body.password, data[0].hash);
            if(isValid){
                return db.select('*').from('users').where('email', '=', req.body.email)
                .then(user=>{
                    console.log('user : '+ user);
                    res.json(user[0])
                })
                .catch(err=>res.status(400).json('unable to get user'))
            }else{
                res.status(400).json('wrong credentials')
            }
        })
        .catch(err=>res.status(400).json('wrong credentials'))
})

app.post('/register', (req, res) =>{
    const {email, name, password } = req.body;
    const hash = bcrypt.hashSync(password);
    db.transaction(trx =>{
        trx.insert({
            hash: hash,
            email : email
        })
        .into('login')
        .returning('email')
        .then(loginEmail =>{
            return trx('users')
                .returning('*')
                .insert({
                    email : loginEmail[0],
                    name: name,
                    joined : new Date()
                })
                .then(user =>{
                    res.json(user[0]);
                })
         })
         .then(trx.commit)
         .catch(trx.rollback);
    })
    
    .catch(err => res.status(400).json('unable to register'))
});

app.get('/profile/:id', (req, res) =>{
    const {id} = req.params;
    
    db.select('*').from('users').where({id})
    .then(user=>{
        if(user.length){
            res.json(user[0]);
        }else{
            res.status(400).json('Not Found')
        }
    })
    .catch(err=>res.status(400).json('error getting user'))
})

app.put('/image', (req, res) =>{
    const {id} = req.body;
    db('users').where('id', '=', id)
    .increment('entries', 1)
    .returning('entries')
    .then(entries=>{
        res.json({'entries':  entries[0]});
    })
    .catch(err => res.status(400).json('unable to get entries'))
});

app.listen(3000, ()=>{
    console.log("app is running on port 3000");
})

bcrypt.hash("bacon", null, null, function(err, hash) {
   
});

// Load hash from your password DB.
// bcrypt.compare("bacon", hash, function(err, res) {
//     // res == true
// });
// bcrypt.compare("veggies", hash, function(err, res) {
//     // res = false
// });

/*
    / --> res = this is working
    /signin --> POST = success/fail
    /register --> POST = user
    /profile/:userId --> GET = user
    /image --> PUT --> user
*/
