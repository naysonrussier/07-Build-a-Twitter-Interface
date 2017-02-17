'use strict';
/******************TWITTER INTERFACE******************
  An application that will let you fetch your tweets, 
             friends and direct messages
    To start this application, you must introduce 
       your credentials into the config.js file
    Then you can user npm start to start the server
*****************************************************/

/*
Variables 
number is the number of element to return by twitter
friends will contain all the friends to show on the interface
timline will contain all the tweets to show on the interface
messagesR and messagesS will contain messages sent and received
messages will be a mixed of messagesR and messagesS, filter by a specific user
filter will contain the id a user, to filter messages
userList will contain all the user we have sent messages, or from whom we have received messages
account will contain informations about our twitter account
errMessage will contain the errors
*/
var number = 10;
var friends;
var timeline = [];
var messagesR;
var messagesS;
var messages;
var filter = 0;
var userList;
var account;
var errMessage;
var port = 4567;

var timeline = require(__dirname + '/mock/timeline.json');
var message = require(__dirname + '/mock/message.json');
var follow = require(__dirname + '/mock/following.json');
var config = require(__dirname + '/config.js');
var functions = require('./functions.js');

var express = require('express');
var bodyParser	= require('body-parser');
var Twit = require('twit');
var app = express();

var T = new Twit(config);

/************************************
           SERVER RUNNING
************************************/

/*******Setting up the server*******/

app.use('/static', express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'pug');
app.set('views', __dirname + '/templates');

/*******Setting up the routes*******/

app.get('/', function(req, res){
	start();
  if(account.error != null) {
    errMessage = account.error;
    res.redirect('/error');
  } else {
	 res.render('index', {account: account});
  }
});

app.get('/error', function(req, res) {
  res.render('error', {error: errMessage})
});
  
app.get('/timeline', function(req, res) {
  if (timeline.error != null) {
    res.render('error', {error: timeline.error.message});
  } else {
    res.render('./partials/_timeline.pug', {timelines: timeline});
  }
});

app.get('/follow', function(req, res) {
  if (friends.error != null) {
    res.render('error', {error: friends.error.message});
  } else {
    res.render('./partials/_follow.pug', {followings: friends.users});
  }
});

app.get('/messages', function(req, res) {
  if (messages.error != null) {
    res.render('error', {error: messages.error.message});
  } else {
    res.render('./partials/_messages.pug', {messages: messages, userList: userList, filter: filter});
  }
});

/*Getting "POST" method from clients*/

app.post('/', function(req, res) {
  var message = req.body.tweet;
  T.post('statuses/update', { status: message }, function(err, data, response) {
    if (err) {
		errMessage = err.message;
		res.send('Error');
	} else {
    Ttimeline();
		res.send("Success");
	}
  });
});

app.post('/userlist', function(req,res) {
  filter = req.body.user;
  Tfunction();
  res.send('Success');
});

/***********Starting server***********/

app.listen(port, function() {
  start();
	console.log("The frontend server is running on port " + port);
});



/**************************************
             TWITTER API
**************************************/

function start() {
	Ttimeline();
	Tfollow();
	Tmessages();
  Taccount();
}

//Fetch the timeine of the log user
function Ttimeline() {
  T.get('statuses/home_timeline', {count: number}, function (err, data, response) {
    if(err) {
      timeline = {error: err};
    } else {
      timeline = functions.timeline(data);
    }
  });
}

//Fetch the friends of the log user
function Tfollow() {
  T.get('friends/list', {count: number}, function (err, data, response) {
  if(err) {
    friends = {error: err};
  } else {
    friends = data;
  }
  });
}

//Fetch the messages of the log user, sent and received
function Tmessages() {
  T.get('direct_messages', { count: number}, function (err, data, response) {
  if(err) {
    messagesR = {error: err};
  } else {
    messagesR = data;
    Tfunction();
  }
  });
  
  T.get('direct_messages/sent', { count: number}, function (err, data, response) {
  if(err) {
    messagesS = {error: err};
  } else {
    messagesS = data;
    Tfunction();
  }
  });
}

//Fetch the log user account information
function Taccount() {
  T.get('account/verify_credentials', function (err, data, response) {
    if(err) {
      account = {error: err};
    } else {
     account = data;
    }
  });
}

//This function will execute functions in function.js, to extract 'messages', and 'userlist'
function Tfunction() {
  if(messagesR != null && messagesS != null) {
    if(messagesR.error != null) {
      messages = messagesR;
    } else if (messagesS.error != null) {
      messages = messagesS;
    } else {
      messages = functions.messages(messagesR,messagesS,filter);
      userList = functions.list(messagesR, messagesS);
    }
  }
}