var irc = require('irc');
var Bacon = require('baconjs').Bacon;
var app = require('http').createServer().listen(1337);
var io = require('socket.io').listen(app);
var Spider = require('./spider.js').spider
var spider = new Spider('http://www.reaktor.fi');

var imageUrlRegExp = /(f|ht)tps?:\/\/.+?(jpg|png)(\s|$)/gi

var client = new irc.Client('localhost', 'pixie', { channels: ['#pixie'] })

// var images = Bacon.fromEventTarget(client, 'message', function(from, to, message) { 
// 	return message 
// })
// .filter(function(message) {
// 	var isImage = imageUrlRegExp.test(message)
// 	imageUrlRegExp.lastIndex = 0
// 	return isImage
// })
// .map(function(message) {
// 	return message.match(imageUrlRegExp)
// })

var images = Bacon.fromEventTarget(spider, 'image', function(img) { 
	return img.url
})
.filter(function(url) {
	var isImage = imageUrlRegExp.test(url)
	imageUrlRegExp.lastIndex = 0
	return isImage
})
.map(function(url) {
	return url.match(imageUrlRegExp)
})

io.sockets.on('connection', function (socket) {
	images.onValue(function(pics) {
		pics.forEach(function(pic) {
		    socket.emit('images', { url: pic.trim() })
		})
	})
})

spider.crawl()

setInterval(function() { console.log('aasdf') }, 500)