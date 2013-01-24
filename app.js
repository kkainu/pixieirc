var irc = require('irc')
var Bacon = require('baconjs').Bacon
var app = require('http').createServer().listen(1337)
var io = require('socket.io').listen(app)

var imageUrlRegExp = /(f|ht)tps?:\/\/.+?(jpg|png)(\s|$)/gi

var client = new irc.Client('localhost', 'pixie', { channels: ['#pixie'] })

var images = Bacon.fromEventTarget(client, 'message', function(from, to, message) { return message })
					.filter(function(message) {
						return imageUrlRegExp.test(message)	
					})
					.map(function(message) {
						return message.match(imageUrlRegExp)
					})

io.sockets.on('connection', function (socket) {
	images.onValue(function(images) {
		images.forEach(function(image) {
		    socket.emit('images', { url: image })	
		})
	})
})