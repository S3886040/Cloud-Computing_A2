
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

// Used only for creation and assessment criteria
//const createTable = require('./ddb_createtable.js');
//const writeFile = require('./ddb_writeFile.js');
//const uploadImage = require('./ddb_imageUploader.js');

// For use within app.js
const ddb_getUser = require('./ddb_loginUser.js');
const ddb_writeUser = require('./ddb_writeUser.js');
const ddb_queryMusicTable = require('./ddb_queryMusicTable.js');
const ddb_addSubscription = require('./ddb_addSubscription.js');
const ddb_getSubscriptions = require('./ddb_getSubscriptions.js');
const ddb_unSubscribe = require('./ddb_unSubscribe.js');



app.get('/', (req, res) => {
    if (!req.session.loggedIn) {
        res.render('login');
    } else {
        res.render('user-page', {
            user: req.session.user
        });
    }

});

app.get('/register', (req, res) => {
    if (req.session.loggedIn) {
        res.redirect('/userArea');
    } else {
        res.render('register');
    }

});

app.get('/login', (req, res) => {
    if (req.session.loggedIn) {
        res.redirect('/userArea');
    } else {
        res.render('login');
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.render('login');
});

app.get('/userArea', (req, res) => {
    if (!req.session.loggedIn) {
        res.redirect('/login');
    } else {
        res.render('user-area', { user: req.session.user });
    }
});

app.get('/subscriptions', (req, res) => {
    if (!req.session.loggedIn) {
        res.redirect('/login');
    } else {
        ddb_getSubscriptions.getSubscriptions(req.session.user.user_name).then(data => {
            res.render('subscriptions', {
                user: req.session.user,
                subscriptions: data
            });
        }).catch(err => {
            console.log(err);
        });;
    }
});

app.get('/query', (req, res) => {
    if (!req.session.loggedIn) {
        res.redirect('/login');
    } else {
        res.render('query', { user: req.session.user });
    }
});

app.post('/login', (req, res) => {
    ddb_getUser.getUser(req.body.user_name).then(data => {
        if (data.password === req.body.password) {
            req.session.user = {
                user_name: data.user_name,
                email: data.email
            };
            req.session.loggedIn = true;
            res.redirect('userArea');
        } else {
            res.render('login', { error: "Password or user name is incorrect!" });
        };
    }).catch(err => {
        console.log(err);
    });
});

app.post('/register', (req, res) => {
    ddb_getUser.getUser(req.body.user_name).then(data => {
        if (Object.keys(data).length != 0) {
            res.render('register', { error: "User Name already exists" })
        } else {
            ddb_writeUser.addUser(req.body.user_name, req.body.email, req.body.password).then(data => {
                res.redirect('login');
            });
        };
    }).catch(err => {
        console.log(err);
    });
});

app.post('/query', (req, res) => {
    ddb_queryMusicTable.queryMusicTable(req.body.artist, req.body.title, req.body.year).then(data => {
        if (data.length == 0) {
            res.render('query', {
                error: "No Results Found",
                user: req.session.user
            });
        } else {
            res.render('query', {
                results: data,
                user: req.session.user
            });
        }
        
    }).catch(err => {
        console.log(err);
    });
});

app.post('/unSubscribe', (req, res) => {
    ddb_unSubscribe.unSubscribe(req.body.count, req.session.user.user_name).then(() => {
        res.redirect('/subscriptions');
    }).catch(err => {
        console.log(err);
    });;
});

app.post('/subscribe', (req, res) => {
    ddb_addSubscription.addSubscription(req.body, req.session.user.user_name).then(() => {
        res.redirect('/subscriptions');
    }).catch(err => {
        console.log(err);
    });;
});

const PORT = config.PORT || 8080;
app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
    console.log(process.env.NODE_ENV); 
    console.log('Press Ctrl+C to quit.');
});


module.exports = app;
