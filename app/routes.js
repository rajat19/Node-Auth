module.exports = function(app, passport) {

	app.get('/', function(req, res) {
		res.render('index.ejs')
	})

	app.get('/login', function(req, res) {
		res.render('login.ejs', {message: req.flash('loginMessage') })
	})

	app.post('/login', passport.authenticate('local-login', {
		successRedirect: '/profile',
		failureRedirect: '/login',
		failureFlash: true
	}))

	app.get('/signup', function(req, res) {
		res.render('signup.ejs', {message: req.flash('signupMessage') })
	})

	app.post('/signup', passport.authenticate('local-signup', {
		successRedirect: '/profile',
		failureRedirect: '/signup',
		failureFlash: true
	}))

	app.get('/profile', isLoggedIn, function(req, res) {
		res.render('profile.ejs', {user: req.user} )
	})

	// google routes
	app.get('/auth/google', passport.authenticate('google', {
		scope: ['profile', 'email']
	}))

	app.get('/auth/google/callback', passport.authenticate('google', {
		successRedirect: '/profile',
		failureRedirect: '/'
	}))

	// facebook routes
	app.get('/auth/facebook', passport.authenticate('facebook', {
		scope: 'email'
	}))

	app.get('/auth/facebook/callback', passport.authenticate('facebook', {
		successRedirect: '/profile',
		failureRedirect: '/'
	}),
	// on succes
   function(req,res) {
       // return the token or you would wish otherwise give eg. a succes message
       res.render('json', {data: JSON.stringify(req.user.access_token)});
   },

   // on error; likely to be something FacebookTokenError token invalid or already used token,
   // these errors occur when the user logs in twice with the same token
   function(err,req,res,next) {
       // You could put your own behavior in here, fx: you could force auth again...
       // res.redirect('/auth/facebook/');
       if(err) {
           res.status(400);
           res.render('error', {message: err.message});
       }
   })

	app.get('/logout', function(req, res) {
		req.logout()
		res.redirect('/')
	})
}

function isLoggedIn (req, res, next) {
	if(req.isAuthenticated())
		return next()

	res.redirect('/')
}
