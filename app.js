const express = require('express');
const socketIo = require('socket.io');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const path = require('path');
const flash = require('connect-flash');
const app = express();
const server = require('http').createServer(app);
const authRoutes = require('./auth');
const io = socketIo(server, {
    debug: true,
    cors: {
        origin: "*"
    }
});
//Make it globals!
global.io = io;
const { Task, User, ServiceBus, Message, sequelize } = require('./models');
const { emitMessages, sendMessageToBus } = require('./messageFunctions');

require('dotenv').config();
const APP_PORT = process.env.APP_PORT || 50000;
const SECRET_KEY = process.env.SECRET_KEY;

app.use(cors());
app.use(session({
    secret: SECRET_KEY,
    resave: false,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({ extended: true }));
app.use(flash());
app.use(authRoutes);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
    res.locals.activeTab = req.path;
    if (req.isAuthenticated() && req.user) {
        res.locals.username = req.user.firstname + ' ' + req.user.lastname;
    }
    next();
});

io.on('connection', async (socket) => {
    try {
        await ServiceBus.initialize();
        ServiceBus.createTopic('messages:north');
        sendMessageToBus(io, 'messages:north', 'Connected to home base.');
        emitMessages(io, "messages:north", "update-message");
    } catch (error) {
        console.error('Error initializing ServiceBus:', error);
    }

    socket.on('send_message', (data) => {
        io.emit('receive_message', data);
    });
});

sequelize.authenticate()
    .then(() => {
        sequelize.sync().catch(err => {
                console.error('Error syncing database:', err);
            });
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    });

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}

app.get('/', ensureAuthenticated, (req, res) => {
    res.render('base', {
    title: 'Home', 
    content: 'index',
    messages: req.flash('error'),
    isAuthenticated: req.isAuthenticated()
    });
});

app.get('/program', ensureAuthenticated, (req, res) => {
    //Get datbase.
    Task.findAll().then(tasks => {
        res.render('base', {
            title: 'Program', 
            content: 'program',
            messages: req.flash('error'),
            isAuthenticated: req.isAuthenticated(),
            data: tasks,
            additionalStyles: ['/css/program.css'],
           // additionalScripts: ['/js/specific.js']
        });
    });
});

app.get('/agents', ensureAuthenticated, (req, res) => {
    res.render('base', {
    title: 'Home', 
    content: 'agent',
    messages: req.flash('error'),
    isAuthenticated: req.isAuthenticated()
    });
});

app.post('/setup', (req, res) => {
    // ... Your setup logic here ...
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Start the server
server.listen(APP_PORT, () => {
    console.log(`Server is running on port ${APP_PORT}`);
});