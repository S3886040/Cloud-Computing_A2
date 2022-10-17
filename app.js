
'use strict';

const express = require('express');
const app = express();
const session = require('express-session');
const path = require('path');

const config = require('./config.js');
process.env.NODE_ENV = config.NODE_ENV;

app.set('view engine', 'ejs');

app.use(session({
    secret: 'secret123',
    resave: false,
    saveUninitialized: true,
    maxAge: 60000
}));
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));
app.use(express.static(path.join(__dirname, 'public')));

//const createTable = require('./ddb_createtable.js');
//const writeTable = require('./ddb_writeFile.js');
//const uploadImage = require('./ddb_imageUploader.js');
const ddb_getUser = require('./ddb_loginUser.js');



app.get('/', (req, res) => {
    if (!req.session.loggedin) {
        res.render('login');
    } else {
        res.render('user-page', {
            user: req.session.user
        });
    }

});

app.get('/register', (req, res) => {
    if (req.session.loggedin) {
        res.redirect('/userArea');
    } else {
        res.render('register');
    }

});

app.get('/login', (req, res) => {
    if (req.session.loggedin) {
        res.redirect('/userArea');
    } else {
        res.render('login');
    }
});
app.post('/login', (req, res) => {
    console.log(req.body);
    ddb_getUser.getUser(req.body.user_name).then(data => {
        console.log(data);
        if (data.password === req.body.password) {
            console.log(data);
        } else {
            res.render('login', {error: "Password or user name is incorrect!"})
        };
    }).catch(err => {
        console.log(err);
    });
});

const PORT = parseInt(process.env.PORT) || 8080;
app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
    console.log(process.env.NODE_ENV);
    console.log('Press Ctrl+C to quit.');
});


module.exports = app;
