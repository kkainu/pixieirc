var request = require('request');
var cheerio = require('cheerio');
var async = require('async');
var _ = require('underscore');

var links = {};
var images = {};

var q = async.queue(parseImagesAndLinks, 5);

q.push([{url: 'http://www.hut.fi'}, {url: 'http://www.hs.fi'}], function (err) {
	console.log('finished processing foo');
});

function parseImagesAndLinks(task, callback) {
	request({
		uri: task.url,
	}, function(error, response, body) {
		var $ = cheerio.load(body);
		$("a").each(function() {
			addIfNotPresent(links, $(this).attr('href'));
		});
		$("img").each(function() {
			addIfNotPresent(images, $(this).attr('src'));
		});
		console.log(links);
		console.log(images);
	});
}

function addIfNotPresent(index, object) {
	if(!_.has(index, object)) {
		index[object] = true;
	}
}
