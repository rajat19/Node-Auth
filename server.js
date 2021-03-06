var express = require('express')
var mongoose = require('mongoose')
var passport = require('passport')
var flash = require('connect-flash')

var morgan = require('morgan')
var cookieParser = require('cookie-parser')
var bodyParser = require('body-parser')
var session = require('express-session')

var configDB = require('./config/database')
var configPassport = require('./config/passport')
var routes = require('./app/routes')

var app = express()
var port = process.env.PORT || 8080

mongoose.connect(configDB.url)

configPassport(passport)

app.use(morgan('dev'))
app.use(cookieParser())
app.use(bodyParser())
app.use(express.static('./public'))

app.set('view engine', 'ejs')

app.use(session({secret: 'rajatkomalmansiprashant'}))
app.use(passport.initialize())
app.use(passport.session())
app.use(flash())

routes(app, passport)

app.listen(port)
console.log('Magic @port ' + port)