const express = require('express');
const app = express();

const jwt = require('jsonwebtoken'); //used by the login to create a token
const exjwt = require('express-jwt'); //using to validate/protect the route 
const bodyParser = require('body-parser');
const path = require('path');

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Headers', 'Content-type,Authorization');
    next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


const PORT = 3000;

const secretKey = 'My super secret key';
//This is the middleware import
const jwtMW = exjwt({
    secret: secretKey,
    algorithms: ['HS256']
});

//Dummy users for the time being since we are not working w/database
let users = [
    {
        id: 1,
        username: 'sam',
        password: '123'
    },
    {
        id: 2,
        username: 'james',
        password: '456'
    }
];

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    console.log(req.body);
    console.log('This is the username:', username, 'This is the password:', password);
    
    for (let user of users) {
        if (username == user.username && password == user.password) {
            let token = jwt.sign({ id: user.id, username: user.username }, secretKey, { expiresIn: 180 });
            res.json({
                success: true,
                err: null,
                token
            });
            break;
        }
       /* else {
            res.status(401).json({
                success: false,
                token: null,
                err: 'Username or password is incorrect'
            });
        }*/
    }
});

app.get('/api/dashboard', jwtMW, (req, res) => {
    res.json({
        success: true,
        myContent: 'Secret content that only logged in people can see.'
    });
});

app.get('/api/prices', jwtMW, (req, res) => {
    res.json({
        success: true,
        myContent: 'This is the price $3.99'
    });
});


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// This is where I am getting the settings from 
app.get('/api/settings', jwtMW, (req, res) => {
    res.json({
        success: true,
        myInfo: 'This is the settings page'
    });
});

app.use(function (err, req, res, next) {
    if (err.name === 'UnauthorizedError') {
        res.status(401).json({
            success: false,
            officialError: err,
            err: 'Username or password is incorrect 2'
        });
    }
    else {
        next(err);
    }
});

//Where I keep my time for the Secrect Key
app.use(secretKey, (res) => {
    if (secretKey >= '3m') {
        return false;
    };
}); 

app.listen(PORT, () => {
    console.log(`Serving on port ${PORT}`);
});