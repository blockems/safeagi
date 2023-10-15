// auth.js
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const { User } = require('./models');
const express = require('express');
const router = express.Router();

passport.use(new LocalStrategy(
    { usernameField: 'email' },
    async (email, password, done) => {
        try {
            const user = await User.authenticate(email, password);
            if (!user) {
                return done(null, false, { message: 'Invalid email or password.' });
            }
            return done(null, user);
        } catch (err) {
            return done(err);
        }
    }
));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.load(id);
        done(null, user);
    } catch (err) {
        done(err);
    }
});

module.exports = passport;

router.get('/login', (req, res) => {
    res.render('base', { 
        title: 'Log In',
        content: 'login',
        messages: req.flash('error'),
        isAuthenticated: req.isAuthenticated()
    });
});

router.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}));

router.get('/logout', function(req, res, next) {
    req.logout(function(err) {
      if (err) { return next(err); }
      res.redirect('/');
    });
  });

router.get('/signup', (req, res) => {
    res.render('base', {
        title: 'Sign Up', 
        content: 'signup',
        messages: req.flash('error'),
        isAuthenticated: req.isAuthenticated()
    });
});

router.post('/signup', async (req, res) => {
    try {
        const { email, password, firstname, lastname } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            // Handle the case where the email is already taken
            return res.status(400).send('Email already in use.');
        }

        // Create the user
        const user = await User.create({
            email,
            password: password,
            firstname,
            lastname
        });

        // Log the user in or redirect to login page
        req.login(user, (err) => {
            if (err) {
                return next(err);
            }
            return res.redirect('/');
        });

    } catch (error) {
        console.error('Error during signup:', error);
        res.status(500).send('Internal server error');
    }
});

module.exports = router;