var irc = require('irc')
var Bacon = require('baconjs').Bacon
var app = require('http').createServer().listen(1337)
var io = require('socket.io').listen(app)

var client = new irc.Client('localhost', 'pixie', { channels: ['#pixie'] });

var messages = Bacon.fromEventTarget(client, 'message', function(from, to, message) { return message; });

io.sockets.on('connection', function (socket) {
	messages.onValue(function(value) { 
		socket.emit('messages', { message: value });
	});
});