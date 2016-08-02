require("jsdom").env("", function(err, window) {
  if (err) {
    console.error(err);
    return;
  }
 
  var $ = require("jquery")(window);


var Botkit = require('botkit')
//var Witbot = require('witbot')
var analytics =  require('./analytics')()
var token = process.env.SLACK_TOKEN
var witToken = process.env.WIT_TOKEN
//var witbot = Witbot(witToken)
var return_data = {};
var output_path
var output_stats
var wit = require('botkit-middleware-witai')({
    token: witToken
});

var controller = Botkit.slackbot({
  // reconnect to Slack RTM when connection goes bad
  retry: Infinity,
  debug: false
})

controller.middleware.receive.use(wit.receive);


// Assume single team mode if we have a SLACK_TOKEN
if (token) {
  console.log('Starting in single-team mode')
  controller.spawn({
    token: token
  }).startRTM(function (err, bot, payload) {
    if (err) {
      throw new Error(err)
    }

    console.log('Connected to Slack RTM')
  })


// Otherwise assume multi-team mode - setup beep boop resourcer connection
} else {
  console.log('Starting in Beep Boop multi-team mode')
  require('beepboop-botkit').start(controller, { debug: true })
}

controller.on('bot_channel_join', function (bot, message) {
  bot.reply(message, "I'm here!")
})


controller.hears(['hello', 'hi'], 'direct_message,direct_mention,mention', function(bot, message) {

    bot.api.reactions.add({
        timestamp: message.ts,
        channel: message.channel,
        name: 'robot_face',
    }, function(err, res) {
        if (err) {
            bot.botkit.log('Failed to add emoji reaction :(', err);
        }
    });


    controller.storage.users.get(message.user, function(err, user) {
        if (user && user.name) {
            bot.reply(message, 'Hello ' + user.name + '!!');
        } else {
            bot.reply(message, 'Hello.');
        }
    });
});

controller.hears(['call me (.*)', 'my name is (.*)'], 'direct_message,direct_mention,mention', function(bot, message) {
    var name = message.match[1];
    controller.storage.users.get(message.user, function(err, user) {
        if (!user) {
            user = {
                id: message.user,
            };
        }
        user.name = name;
        controller.storage.users.save(user, function(err, id) {
            bot.reply(message, 'Got it. I will call you ' + user.name + ' from now on.');
        });
    });
});


controller.hears('.*', 0.5, function (bot, message) {
  witbot.process(message.text, bot, message)
})

function getAnalytics(){
  console.log('markus get analtyics test');
}

controller.hears('.*', 'direct_message,direct_mention,mention', wit.hears,function(bot, message) {

  console.log(message);
  getAnalytics()

  bot.reply(message, 'Give me a second... Calculating...');
  var replies = [];
    
  analytics.get('hellobeautiful.com', function (error, data) {
          
    //console.log(data.pages);
    data.pages.forEach(function(el, i){
      var reply = {
        'text': '-'+el.title+'('+el.path+') *People:* '+ el.stats.people +' *Read:* '+ el.stats.read+' *Visits:* '+el.stats.visits+'<br />'
      }

      bot.reply(message, '*'+el.title+'*' +'('+el.path+') People: '+ el.stats.people +' Read: '+ el.stats.read+' Visits '+el.stats.visits+'<br />');
    })

  }); 
});



controller.on('channel_joined',function(bot,message) {

});


});