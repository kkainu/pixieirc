var request = require('request');
var cheerio = require('cheerio');
var async = require('async');
var _ = require('underscore');
var urls = require('url');
var util = require('util');
var EventEmitter = require('events').EventEmitter;

var Spider = function() {
	var self = this;
	this.handled = {};
	this.queue = async.queue(parseImagesAndLinks, 5);

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
					self.handled[task.url] = true;
				}
			} catch(e) {
				console.log('Exception: ' + e.stack);
			}
			callback(task);
		});
	}

	function shouldHandle(url) {
		return url !== undefined && !_.has(self.handled, url);
	}

	function isFromSameDomain(url, base) {
		return url !== undefined && (url.search(/(f|ht)tps?:\/\//) != 0 || url.indexOf(base) == 0);
	}

	function handleLink(url, base) {
		if(isFromSameDomain(url,base)) self.queue.push({url: urls.resolve(base,url)}, processedCallback);
	}

	function handleImage(url, base) {
		var imageUrl = isFromSameDomain(url, base) ? urls.resolve(base,url) : url;
		self.emit("image", {url: imageUrl});
	}

	function processedCallback(task) {
		//console.log('finished processing url: ' + task.url);
	}
}

util.inherits(Spider, EventEmitter);

Spider.prototype.crawl = function(url) {
	this.queue.push([{url: url}], this.processedCallback);	
}

exports.spider = Spider;


