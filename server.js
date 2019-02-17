const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');
const postgres = knex({
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


postgres.select('*').from('users');

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
    bcrypt.compare("apples", '$2a$10$LLwKGuBR94BhdzxnD/r59.b1VnpO.9qjKaawVOCUuGudQqTafCNWO', function(err, res) {
        console.log('first guess', res);
    });

    bcrypt.compare("veggies", '$2a$10$LLwKGuBR94BhdzxnD/r59.b1VnpO.9qjKaawVOCUuGudQqTafCNWO', function(err, res) {
        console.log('second guess', res);
    });
    if(req.body.email === database.users[0].email &&
        req.body.password === database.users[0].password){
            res.json(database.users[0]);
        }
    else{
        res.status(400).json('error logging in');
    }

})

app.post('/register', (req, res) =>{
    const {email, name, password } = req.body;

    database.users.push({
        id :'125',
        name: name,
        email: email,
        entries : 0,
        joined : new Date(),
    });
    res.json(database.users[database.users.length-1]);
});

app.get('/profile/:id', (req, res) =>{
    const {id} = req.params;
    let found = false;
    
    database.users.forEach(user =>{
        if(user.id === id){
            found=true;
            return res.json(user);
        }
    });

    if(!found){        
        res.status(404).json('no such user');
    }
})

app.put('/image', (req, res) =>{
    const {id} = req.body;
    let found = false;
    
    database.users.forEach(user =>{
        if(user.id === id){
            found=true;
            user.entries ++;
            return res.json(user.entries);
        }
    });
    
    if(!found){        
        res.status(404).json('no such user');
    }
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
