var Spider = require('./spider.js').spider;
var spider = new Spider('http://reaktor.fi');

spider.on("image", function(img) {
	console.log('got image: ' + img.url);
});

spider.crawl();
