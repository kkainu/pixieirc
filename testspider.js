var Spider = require('./spider.js').spider;
var spider = new Spider();

console.log(spider);

spider.on("image", function(img) {
	console.log('got image: ' + img.url);
});

spider.crawl('http://reaktor.fi');
