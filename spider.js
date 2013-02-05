var request = require('request');
var cheerio = require('cheerio');
var async = require('async');
var _ = require('underscore');
var urls = require('url');

var handled = {};

var q = async.queue(parseImagesAndLinks, 5);

q.push([{url: 'http://www.aalto.fi/fi/'}], processed);

function parseImagesAndLinks(task, callback) {
	request({
		uri: task.url,
	}, function(error, response, body) {
		try {
			if(shouldHandle(task.url)) {
				var $ = cheerio.load(body);
				var url = urls.parse(task.url);
				var base = url.protocol + '//' + url.host;

				$("a").each(function() {
					handleLink($(this).attr('href'), base);
				});
				$("img").each(function() {
					handleImage($(this).attr('src'), base);
				});
				handled[task.url] = true;
			}
		} catch(e) {
			console.log('Exception: ' + e.stack);
		}
		callback(task);
	});
}

function shouldHandle(url) {
	return url !== undefined && !_.has(handled, url);
}

function isFromSameDomain(url, base) {
	return url !== undefined && (url.search(/(f|ht)tps?:\/\//) != 0 || url.indexOf(base) == 0);
}

function handleLink(url, base) {
	if(isFromSameDomain(url,base)) {
		q.push({url: urls.resolve(base,url)}, processed);
	}
}

function handleImage() {

}

function processed(task) {
	console.log('finished processing url: ' + task.url);
}
