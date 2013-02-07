var request = require('request');
var cheerio = require('cheerio');
var async = require('async');
var _ = require('underscore');
var urls = require('url');
var util = require('util');
var EventEmitter = require('events').EventEmitter;

var Spider = function(url) {
	var self = this;
	this.handled = {};
	this.queue = async.queue(parseImagesAndLinks, 1);
	this.base = urls.parse(url).protocol + '//' + urls.parse(url).host;
	this.initialUrl = url;

	function parseImagesAndLinks(task, callback) {
		setTimeout(function() {request({uri: task.url}, handlePage(task, callback));},1000)
	}

	function handlePage(task, callback) {
		return function(error, response, body) {
			try {
				if(isFromSameDomain(task.url)) {
					console.log("handling url: " + task.url)
					var $ = cheerio.load(body);

					$("a").each(function() {
						handleLink($(this).attr('href'));
					});
					$("img").each(function() {
						handleImage($(this).attr('src'));
					});
				}
			} catch(e) {
				console.log('Exception: ' + e.stack);
			}
			callback(task);
		}
	}

	function handled(url) {
		return url == undefined || _.has(self.handled, url);
	}

	function isFromSameDomain(url) {
		return url !== undefined && (url.search(/(f|ht)tps?:\/\//) != 0 || url.indexOf(self.base) == 0);
	}

	function handleLink(url) {
		if(!handled(url)) {
			self.queue.push({url: urls.resolve(self.base,url)}, processedCallback);
			self.handled[url] = true;
		}
	}

	function handleImage(url) {
		if(!handled(url)) {
			var imageUrl = isFromSameDomain(url) ? urls.resolve(self.base,url) : url;
			self.emit("image", {url: imageUrl});
			self.handled[url] = true;
		}
	}

	function processedCallback(task) {}
}

util.inherits(Spider, EventEmitter);

Spider.prototype.crawl = function() {
	this.queue.push([{url: this.initialUrl}], this.processedCallback);	
}

exports.spider = Spider;


