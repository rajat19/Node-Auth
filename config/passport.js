// load all the things we need
var LocalStrategy = require('passport-local').Strategy
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy
var FacebookStrategy = require('passport-facebook').Strategy

// load up the user model
var User = require('../app/models/user')

// load the auth variables
var configAuth = require('./auth')

// expose this function to our app
module.exports = function(passport) {

	passport.serializeUser(function(user, done) {
		done(null, user.id)
	})

	passport.deserializeUser(function(id, done) {
		User.findById(id, function(err, user) {
			done(err, user)
		})
	})

	passport.use('local-signup', new LocalStrategy({
		usernameField: 'email',
		passwordField: 'password',
		passReqToCallback: true
	},
	function(req, email, password, done) {
		process.nextTick(function() {
			User.findOne({
				'local.email': email
			}, function(err, user) {
				if(err) return done(err)
				if(user)
					return done(null, false, req.flash('signupMessage', 'That email is already taken.'))
				else {

					var newUser = new User()
					newUser.local.email = email
					newUser.local.password = newUser.generateHash(password)

					newUser.save(function(err) {
						if(err)
							throw err
						return done(null, newUser)
					})
				}
			})
		})
	}))

	passport.use('local-login', new LocalStrategy({
		usernameField: 'email',
		passwordField: 'password',
		passReqToCallback: true
	},
	function(req, email, password, done) {
		User.findOne({
			'local.email': email
		}, function(err, user) {
			if(err)
				return done(err)
			if(!user)
				return done(null, false, req.flash('loginMessage', 'No user found.'))
			if(!user.validPassword(password))
				return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'))

			return done(null, user)
		})
	}))

	// Google
	// passport.use(new GoogleStrategy({
	// 	clientID: configAuth.googleAuth.clientID,
	// 	clientSecret: configAuth.googleAuth.clientSecret,
	// 	callbackURL: configAuth.googleAuth.callbackURL
	// },
	// function(token, refreshToken, profile, done) {
	// 	process.nextTick(function() {
	// 		User.findOne({
	// 			'google.id': profile.id
	// 		}, function(err, user) {
	// 			if(err)
	// 				return done(err)
	// 			if(user)
	// 				return done(null, user)
	// 			else {
	// 				var newUser = new User()
	//
	// 				newUser.google.id = profile.id
	// 				newUser.google.token = token
	// 				newUser.google.name = profile.displayName
	// 				newUser.google.email = profile.emails[0].value
	//
	// 				newUser.save(function(err) {
	// 					if(err)
	// 						throw err
	// 					return done(null, newUser)
	// 				})
	// 			}
	// 		})
	// 	})
	// }))

	// Facebook
	passport.use(new FacebookStrategy({
		clientID: configAuth.facebookAuth.clientID,
		clientSecret: configAuth.facebookAuth.clientSecret,
		callbackURL: configAuth.facebookAuth.callbackURL
	},
	function(token, refreshToken, profile, done) {
		process.nextTick(function() {
			User.findOne({
				'facebook.id': profile.id
			}, function(err, user) {
				if(err)
					return done(err)
				if(user)
					return done(null, user)
				else {
					var newUser = new User()

					newUser.facebook.id = profile.id
					newUser.facebook.token = token
					newUser.facebook.name = profile.name.givenName + ' ' + profile.name.familyName
					newUser.facebook.email = profile.emails[0].value

					newUser.save(function(err) {
						if(err)
							throw err
						return done(null, newUser)
					})
				}
			})
		})
	}))
}
