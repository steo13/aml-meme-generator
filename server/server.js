'use strict';

const express = require('express');
const morgan = require('morgan'); // logging middleware
const { check, validationResult } = require('express-validator'); // validation middleware

const passport = require('passport'); // auth middleware
const LocalStrategy = require('passport-local').Strategy; // username and password for login
const session = require('express-session'); // enable sessions

const memeDao = require('./meme-dao'); // module for accessing the DB
const userDao = require('./user-dao'); // module for accessing the users in the DB

/*** Set up Passport ***/
// set up the "username and password" login strategy
// by setting a function to verify username and password
passport.use(new LocalStrategy(
  function (username, password, done) {
    userDao.getUser(username, password).then((user) => {
      if (!user)
        return done(null, false, { message: 'Incorrect username and/or password.' });

      return done(null, user);
    })
  }
));

// serialize and de-serialize the user (user object <-> session)
// we serialize the user id and we store it in the session: the session is very small in this way
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// starting from the data in the session, we extract the current (logged-in) user
passport.deserializeUser((id, done) => {
  userDao.getUserById(id)
    .then(user => {
      done(null, user); // this will be available in req.user
    }).catch(err => {
      done(err, null);
    });
});

const errorFormatter = ({ location, msg, param, value, nestedErrors }) => {
  // Format express-validate errors as strings
  return `${location}[${param}]: ${msg}`;
};

// init express
const app = new express(); // FIXME: should we use new?
const PORT = 3001;

// set-up the middlewares
app.use(morgan('dev'));
app.use(express.json());

// custom middleware: check if a given request is coming from an authenticated user
const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated())
    return next();

  return res.status(401).json({ error: 'Not authenticated' });
}

// set up the session
app.use(session({
  // by default, Passport uses a MemoryStore to keep track of the sessions
  secret: '- lorem ipsum dolor sit amet -',
  resave: false,
  saveUninitialized: false
}));

// then, init passport
app.use(passport.initialize());
app.use(passport.session());


/*** APIs ***/

app.get('/api/memes/public', async (req, res) => {
  try {
    setTimeout(async ()=>{
        memeDao.publicMemes()
            .then(memes =>{ res.json(memes); memes.length === 0 ? res.status(204).end() : ''})
            .catch(() => res.status(500).end())
    }, 500);
  }catch(err){
      res.status(500).end();
  }
})

app.get('/api/memes/protected', isLoggedIn, async (req, res) => {
  try {
    setTimeout(async ()=>{
        memeDao.protectedMemes()
            .then(memes =>{ res.json(memes); memes.length === 0 ? res.status(204).end() : ''})
            .catch(() => res.status(500).end())
    }, 500);
  }catch(err){
      res.status(500).end();
  }
});

app.get('/api/image', async (req, res) => {
  try {
    setTimeout(async ()=>{
        memeDao.getImage(req.query.id)
            .then(images =>{ res.json(images); images.length === 0 ? res.status(204).end() : ''})
            .catch(() => res.status(500).end())
    }, 500);
  }catch(err){
      res.status(500).end();
  }
})

app.get('/api/images', async (req, res) => {
  try {
    setTimeout(async ()=>{
        memeDao.getImages()
            .then(images =>{ res.json(images); images.length === 0 ? res.status(204).end() : ''})
            .catch(() => res.status(500).end())
    }, 500);
  }catch(err){
      res.status(500).end();
  }
})

app.get('/api/creator', async (req, res) => {
  try {
    setTimeout(async ()=>{
        memeDao.getCreator(req.query.id)
            .then(crs =>{ res.json(crs); crs.length === 0 ? res.status(204).end() : ''})
            .catch(() => res.status(500).end())
    }, 500);
  }catch(err){
      res.status(500).end();
  }
})

app.get('/api/texts', async (req, res) => {
  try {
    setTimeout(async ()=>{
        memeDao.getTexts(req.query.meme)
            .then(txts =>{ res.json(txts); txts.length === 0 ? res.status(204).end() : ''})
            .catch(() => res.status(500).end())
    }, 500);
  }catch(err){
      res.status(500).end();
  }
})

app.post('/api/meme', isLoggedIn, 
    check('title').isLength({min: 1}),
    check('private').isNumeric({min: 0, max: 1}),
    check('image').isNumeric(),
    check('creator').isNumeric(),
    check('font').isNumeric(),
    check('colour').isLength({min: 1}),
    (req, res) => {
        
        if(!validationResult(req).isEmpty())
            return res.status(400).json({errors: validationResult(req).array()});

        if(req.user.id !== req.body.creator)
            return res.status(401).json({error: 'not authorized'});

        let body = req.body;
        memeDao.addMeme(body.creator, body.image, body.private, body.title, body.font, body.colour)
            .then(id => res.json({id}))
            .catch(() => res.status(500).end());
});

app.post('/api/text', isLoggedIn, 
    check('meme').isNumeric(),
    check('image').isNumeric(),
    check('text').isLength({min: 1}),
    check('position').isNumeric(),
    (req, res) => {
        if(!validationResult(req).isEmpty())
            return res.status(400).json({errors: validationResult(req).array()});

        let body = req.body;
        memeDao.addText(body.meme, body.image, body.text, body.position)
            .then(id => res.json({id}))
            .catch(() => res.status(500).end());
});

//DELETE /api/meme/:id
app.delete('/api/meme/:id', isLoggedIn,
    check('id').isNumeric(),
    async (req, res) => {
        if(!validationResult(req).isEmpty())
            return res.status(400).json({errors: validationResult(req).array()});

        await memeDao.getMeme(req.params.id, req.user.id)
          .then(obj => { if(obj.error) req.user.id = null; })
          .catch(() => res.status(500).end());
        
        if(!req.user.id)
            return res.status(500).json({error: 'not authorized or meme not present'});

        memeDao.deleteMeme(req.params.id)
            .then(() => res.status(200).end())
            .catch(() => res.status(500).end());
});

//DELETE /api/texts/:id
app.delete('/api/texts/:id', isLoggedIn,
    check('id').isNumeric(),
    async (req, res) => {

        if(!validationResult(req).isEmpty())
            return res.status(400).json({errors: validationResult(req).array()});

        await memeDao.getTexts(req.params.id)
          .then(obj => { if(obj.error) req.user.id = null; })
          .catch(() => res.status(500).end());

        if(!req.user.id)
            return res.status(500).json({error: 'not authorized or texts not present'});

        memeDao.deleteTexts(req.params.id)
            .then(() => res.status(200).end())
            .catch(() => res.status(500).end());
});

/*** USER APIs ***/

// Login --> POST /sessions
app.post('/api/sessions', function (req, res, next) {
  passport.authenticate('local', (err, user, info) => {
    if (err)
      return next(err);
    if (!user) {
      // display wrong login messages
      return res.status(401).json(info);
    }
    // success, perform the login
    req.login(user, (err) => {
      if (err)
        return next(err);

      // req.user contains the authenticated user, we send all the user info back
      // this is coming from userDao.getUser()
      return res.json(req.user);
    });
  })(req, res, next);
});

// Logout --> DELETE /sessions/current 
app.delete('/api/sessions/current', (req, res) => {
  req.logout();
  res.end();
});

// GET /sessions/current
// check whether the user is logged in or not
app.get('/api/sessions/current', (req, res) => {
  if(req.isAuthenticated()) {
    res.status(200).json(req.user);}
  else
    res.status(401).json({error: 'Unauthenticated user!'});;
});


/*** Other express-related instructions ***/

// Activate the server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}/`));

