var irc = require('irc')
var Bacon = require('baconjs').Bacon
var app = require('http').createServer().listen(1337)
var io = require('socket.io').listen(app)

var imageUrlRegExp = /(https?:\/\/.*\.(?:png|jpg))/i

var client = new irc.Client('localhost', 'pixie', { channels: ['#pixie'] })

var images = Bacon.fromEventTarget(client, 'message', function(from, to, message) { return message })
					.filter( function(message) {
						return imageUrlRegExp.test(message)	
					})

io.sockets.on('connection', function (socket) {
	images.onValue(function(value) { 
		socket.emit('images', { url: value })
	})
})