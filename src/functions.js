var moment = require('moment');
/*
This function will mix all the messages, sent and received (S for sent, and R for received)
It will then filter messages by a specific user
It will finally reorder messages
*/
function messages(messagesR, messagesS, filter) {
  var message = [];
  for (var i = 0; i <messagesR.length; i ++) {
    messagesR[i].me = false;
    messagesR[i].time = time(messagesR[i].created_at);
      //check if the message match 'filter'
      if(messagesR[i].sender.id == filter) {
        message.push(messagesR[i]);
      }
  }
  for (var i = 0; i <messagesS.length; i ++) {
    messagesS[i].me = true;
    messagesS[i].time = time(messagesS[i].created_at);
      //check if the message match 'filter'
      if(messagesS[i].recipient.id == filter) {
        message.push(messagesS[i]);
      }
  }
  //Sorting messages
  message.sort(function (a, b) {
    return b.id - a.id;
  })
  return message;
}

/*
This function will catch the timeline of the user
And will add a time to the message
*/
function timeline(timeline) {
  for (var i = 0; i < timeline.length; i ++) {
    timeline[i].time = time(timeline[i].created_at)
  }
  return timeline;
}

/*
This function will extract each user from messages.
It will the create a list of all users concerned by direct_messages
*/
function list(messagesR, messagesS) {
  var userlist = [];
  var messages = messagesR.concat(messagesS);
  
  //push the user to the userlist
  for (var i = 0; i <messages.length; i ++) {
    var template = {name:'', screen_name:'', id:''};
    var number = 0;
    template.name = messages[i].sender.name;
    template.screen_name = messages[i].sender.screen_name;
    template.id = messages[i].sender.id;
    userlist.push(template);
  }
  //Delete all duplicated users
  for(var i=0; i<userlist.length; ++i) {
    for(var j=i+1; j<userlist.length; ++j) {
      if(userlist[i].id === userlist[j].id)
        userlist.splice(j--, 1);
    }
  }
  return userlist;
}

/*
This function will transform the date provided by twitter, into a "... hours ago / ... minutes ago"
*/
function time(time) {
  return moment(time, 'ddd MMM DD hh:mm:ss Z YYYY').fromNow();
}

//export each function
module.exports.messages = messages;
module.exports.list = list;
module.exports.timeline = timeline;