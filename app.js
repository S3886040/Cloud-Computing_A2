
'use strict';

const express = require('express');
const app = express();
const session = require('express-session');
const path = require('path');

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

const PORT = parseInt(process.env.PORT) || 8080;
app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
    console.log(process.env);
    console.log('Press Ctrl+C to quit.');
});


module.exports = app;
