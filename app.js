var app = require('http').createServer().listen(1337);
var io = require('socket.io').listen(app);
var webChannel = new(require('./webchannel').webspider)('http://www.reaktor.fi');
var ircChannel = new(require('./ircchannel').ircspider);
var bacon = require('baconjs').Bacon;

var ircImages = bacon.fromEventTarget(ircChannel, 'image');
var webImages = bacon.fromEventTarget(webChannel, 'image');

var images = ircImages.merge(webImages);

io.sockets.on('connection', function(socket) {
    images.onValue(function(data) {
        socket.emit('image', {url: data.url});
    });
});

webChannel.start();