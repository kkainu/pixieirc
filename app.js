var app 	= require('http').createServer().listen(1337);
var io 		= require('socket.io').listen(app);
var spider 	= new (require('./webspider').webspider)('http://www.reaktor.fi');
var irc 	= new (require('./ircspider').ircspider);

io.sockets.on('connection', function (socket) {
	irc.on('image', function(image) {
		socket.emit('image', {url: image.url});
	});
});

