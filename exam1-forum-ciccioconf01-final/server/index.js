'use strict';

const express = require('express');
const morgan = require('morgan');  
const { check, validationResult, query, param } = require('express-validator'); 
const cors = require('cors');

const postsDao = require('./dao-posts'); 
const userDao = require('./dao-users'); 


const app = new express();
const port = 3001;


app.use(morgan('dev'));
app.use(express.json());


const corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true,
};
app.use(cors(corsOptions));


/** Authentication-related imports **/
const passport = require('passport');                              
const LocalStrategy = require('passport-local');         

const base32 = require('thirty-two');
const TotpStrategy = require('passport-totp').Strategy; 

/** Set up authentication strategy **/
passport.use(new LocalStrategy(async function verify(username, password, callback) {
  const user = await userDao.getUser(username, password)
  if(!user)
    return callback(null, false, 'Incorrect username or password');  
    
  return callback(null, user);
}));


passport.serializeUser(function (user, callback) {
  callback(null, user);
});


passport.deserializeUser(function (user, callback) { 

  return callback(null, user); 
});

/** Creating the session */
const session = require('express-session');

app.use(session({
  secret: "session_secret",
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.authenticate('session'));

passport.use(new TotpStrategy(
  function (user, done) {
   
    return done(null, base32.decode(user.secret), 30); 
  })
);


/** Defining authentication verification middleware **/
const isLoggedIn = (req, res, next) => {
  if(req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({error: 'Not authorized'});
}

function isTotp(req, res, next) {
  if(req.session.method === 'totp')
    return next();
  return res.status(401).json({ error: 'Missing TOTP authentication'});
}


// This function is used to format express-validator errors as strings
const errorFormatter = ({ location, msg, param, value, nestedErrors }) => {
  return `${location}[${param}]: ${msg}`;
};



/***  APIs ***/

// 1. Retrieve the list of all the posts.
// GET /api/posts
app.get('/api/posts',
  (req, res) => {
    
    postsDao.listPosts()
      .then(posts => res.json(posts))
      .catch((err) => res.status(500).json(err)); 
  }
);

// 2. Create a new post, by providing all relevant information.
// POST /api/posts
app.post('/api/posts', isLoggedIn,
  [
    check('title').isLength({min: 1}).matches(/[^\s]/).withMessage('Title must contain at least one visible character'), 
    check('text').isLength({min: 1}).matches(/[^\s]/).withMessage('Content must contain at least one visible character'), 
    check('maximum_comments').isInt({min: 0}).optional(),
  ], 
  async (req, res) => {
    const errors = validationResult(req).formatWith(errorFormatter); 
    if (!errors.isEmpty()) {
      return res.status(422).json( errors.errors );
    }
    
    const post = {
      title: req.body.title,
      timestamp: null,  //the timestamp will be added in the dao before the insertion in the db
      text: req.body.text,
      maximum_comments: req.body.maximum_comments,
      authorID: req.user.id
    };
    
    try {

      const post_in_db = await postsDao.getPostByTitle(post.title);
      if (post_in_db.error !== 'Post not found.') {
        return res.status(409).json({ error: 'A post with this title already exists' });
      }

    
      const result = await postsDao.createPost(post);
      res.json(result);
    } catch (err) {
      console.log(err); 
      res.status(503).json({ error: 'Database error' }); 
    }
  }
);




// 3. Retrieve all the comments associated to a post title
// GET /api/posts/:postTitle/comments
app.get('/api/posts/:postTitle/comments',
  check('postTitle').isLength({min: 1}), 
  async (req, res) => {
    const errors = validationResult(req).formatWith(errorFormatter); 
    if (!errors.isEmpty()) {
      return res.status(422).json( errors.errors );
    }
    try {
      let result;
      let interestingComment = [];
      let number_of_likes = [];

      const postInfo = await postsDao.getPostByTitle(req.params.postTitle);
      const number_of_comments = await postsDao.getCommentsNumber(req.params.postTitle);

      if (req.isAuthenticated && req.isAuthenticated()) {
        // Utente autenticato
        number_of_likes = await postsDao.getCommentLikeCountsByPostTitle(req.params.postTitle);
        result = await postsDao.getPostComments(req.params.postTitle);
        interestingComment = await postsDao.getPostLikes(req.params.postTitle, req.user.id);
      } else {
        // Utente non autenticato
        result = await postsDao.getPostCommentsAnonymous(req.params.postTitle);
      }

      const diz = {"postInfo" : postInfo, "number_of_likes" : number_of_likes, "comments" : result, "likeOfAuthUser" : interestingComment, "commentsNumber" : number_of_comments}
      if (result.error || postInfo.error || number_of_likes.error || interestingComment.error || number_of_comments.error)
        res.status(404).json(diz);
      else
        res.json(diz);

    } catch (err) {
      console.error(err); 
      res.status(500).end();
    }
  }
);


// 4. Create a new comment, by providing all relevant information.
// POST /api/comments
app.post('/api/comments',
  [
    check('text').isLength({min: 1}).matches(/[^\s]/).withMessage('Comment must contain at least one visible character'),
    check('postTitle').isLength({min: 1}), 
    
  ], 
  async (req, res) => {
    const errors = validationResult(req).formatWith(errorFormatter); 
    if (!errors.isEmpty()) {
      return res.status(422).json( errors.errors );
    }

    
 
    const comment = {
      text: req.body.text,
      timestamp: null,  //the timestamp will be added in the dao before the insertion
      postTitle: req.body.postTitle,
      authorID: req.user ? req.user.id : null
    };

    try {

      //check if the comment is associated to a existing post
      let post = await postsDao.getPostByTitle(comment.postTitle);
      if((!post || post.error)){
        return res.status(422).json({ error: "The post associated to the comment does not exist" });
      }

      //check if we reach the maximum number of comment or not
      const commentsAlreadyPresent = await postsDao.getPostComments(comment.postTitle);
      
      
      const maximum_comments = post.maximum_comments;
      if (maximum_comments != null){
          if (commentsAlreadyPresent.length >= maximum_comments){
            return res.status(422).json({ error: "Too many comments" });
          }
      }

      //insert the comment
      const result = await postsDao.createComment(comment); 
      res.json(result);
    } catch (err) {
      console.log(err);  
      res.status(503).json({ error: 'Database error' }); 
    }
  }
);



// 5. Delete an existing post, given its "title"
// DELETE /api/posts/<title>
app.delete('/api/posts/:title', isLoggedIn, 
  [ check('title').isLength({min: 1}), ],
  async (req, res) => {
    try {
      
      let numChanges;

      if(req.user.admin == true && req.session.method === 'totp'){
        numChanges = await postsDao.deletePostAdmin(req.params.title);
      }
      else{
        numChanges = await postsDao.deletePost(req.user.id, req.params.title);
      }
      
      res.status(200).json(numChanges);
    } catch (err) {
      console.log(err);
      res.status(503).json({ error: err });
    }
  }
);


// 6. Delete an existing comment, given its "id"
// DELETE /api/comments/<id>
app.delete('/api/comments/:id', isLoggedIn, 
  [ check('id').isInt({min: 1}) ],
  async (req, res) => {
    try {

      let numChanges;
      if(req.user.admin == true && req.session.method === 'totp'){
        numChanges = await postsDao.deleteCommentAdmin(req.params.id);
      }
      else{
        numChanges = await postsDao.deleteComment(req.user.id, req.params.id);
      }
      
      
      res.status(200).json(numChanges);
    } catch (err) {
      console.log(err);  
      res.status(503).json({ error: err });
    }
  }
);

// 7. Update an existing comment
// PUT /api/comments/<id>
app.put('/api/comments/:id', isLoggedIn,
  [
    check('id').isInt({min: 1}), 
    check('text').isLength({min: 1}).matches(/[^\s]/).withMessage('Content must contain at least one visible character'),
    
  ],
  async (req, res) => {
    const errors = validationResult(req).formatWith(errorFormatter);
    if (!errors.isEmpty()) {
      return res.status(422).json( errors.errors );
    }

    
     // Is the id in the body present? If yes, is it equal to the id in the url?
    if (req.body.id && req.body.id != req.params.id) {
      return res.status(422).json({ error: 'URL and body id mismatch' });
    }
    
    try {

      let result;

      if(req.user.admin == true && req.session.method === 'totp'){
        result = await postsDao.updateCommentAdmin(req.body.id, req.body.text);
      }
      else{
        result = await postsDao.updateComment(req.user.id, req.body.id, req.body.text);
      }
      
      res.json(result);
    } catch (err) {
      if (err.error === 'Not Authorized') {
        res.status(403).json(err);
      } else {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  } 
  
);



// 8. Insert a new like.
// POST <postTitle>/comments/likes
app.post('/api/:postTitle/comments/likes', isLoggedIn,
  [
    check('commentID').isInt({min: 1}), 
    check('postTitle').isLength({min: 1}), 
    
  ], 
  async (req, res) => {


    const errors = validationResult(req).formatWith(errorFormatter); 
    if (!errors.isEmpty()) {
      return res.status(422).json( errors.errors ); 
    }

    const like = {
      commentID: req.body.commentID,
      postTitle: req.body.postTitle,
      authorID: req.user.id
    };


    try {
      //check if the like is associated to a existing post
      let post = await postsDao.getPostByTitle(like.postTitle);
      if((!post || post.error)){
        return res.status(422).json({ error: "The post associated to the like does not exist" });
      }

      //check if the like is associated to a existing comment
      let comment = await postsDao.getCommentById(like.commentID);
      if((!comment || comment.error)){
        return res.status(422).json({ error: "The comment associated to the like does not exist" });
      }


      //insert the like
      const result = await postsDao.createLike(like); 
      res.json(result);
    } catch (err) {
      console.log(err);
      res.status(503).json({ error: err }); 
    }
  }
);


// 9. Delete a like.
// DELETE /api/:postTitle/comments/likes?commentID=123
app.delete('/api/:postTitle/comments/likes', isLoggedIn, [
  param('postTitle').isLength({ min: 1 }),
  query('commentID').isInt({ min: 1 }),
], async (req, res) => {
  const errors = validationResult(req).formatWith(errorFormatter);
  if (!errors.isEmpty()) {
    return res.status(422).json(errors.errors);
  }

  const like = {
    commentID: parseInt(req.query.commentID),
    postTitle: req.params.postTitle,
    authorID: req.user.id,
  };

  try {
    const result = await postsDao.deleteLike(like);
    if (result.error) {
      return res.status(404).json(result);
    }
    res.status(200).json(result);
  } catch (err) {
    console.log(err);
    res.status(503).json({ error: err });
  }
});



/*** Users APIs ***/

function clientUserInfo(req) {
  const user=req.user;
	return {id: user.id, username: user.username, name: user.name, canDoTotp: user.admin == true ? true : false, isTotp: req.session.method === 'totp'};
}

// POST /api/sessions 
// This route is used for performing login.
app.post('/api/sessions', function(req, res, next) {
  passport.authenticate('local', (err, user, info) => { 
    if (err)
      return next(err);
      if (!user) {
        // display wrong login messages
        return res.status(401).json({ error: info});
      }
      // success, perform the login and extablish a login session
      req.login(user, (err) => {
        if (err)
          return next(err);
        
        // req.user contains the authenticated user, we send all the user info back
        // this is coming from userDao.getUser() in LocalStratecy Verify Fn
        return res.json(clientUserInfo(req));
      });
  })(req, res, next);
});

app.post('/api/login-totp', isLoggedIn,
  // DEBUG: function(req,res,next){ console.log('DEBUG2: '+JSON.stringify(req.user)); next();},
  passport.authenticate('totp'),   // passport expect the totp value to be in: body.code
  function(req, res) {

    req.session.method = 'totp';
    res.json({otp: 'authorized'});
  }
);

// GET /api/sessions/current
// This route checks whether the user is logged in or not.
app.get('/api/sessions/current', (req, res) => {
  if(req.isAuthenticated()) {
    res.status(200).json(clientUserInfo(req));}
  else
    res.status(401).json({error: 'Not authenticated'});
});

// DELETE /api/session/current
// This route is used for loggin out the current user.
app.delete('/api/sessions/current', (req, res) => {
  req.logout(() => {
    res.status(200).json({});
  });
});


// activate the server
app.listen(port, (err) => {
  if (err)
    console.log(err);
  else 
    console.log(`Server listening at http://localhost:${port}`);
}); 
