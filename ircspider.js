var irc = require('irc');
var util = require('util');
var Bacon = require('baconjs').Bacon;
var EventEmitter = require('events').EventEmitter;

var Irc = function(url) {
        var self = this;
        this.imageUrlRegExp = /(f|ht)tps?:\/\/.+?(jpg|png)(\s|$)/gi;
        this.client = new irc.Client('localhost', 'pixie', {
            channels: ['#pixie']
        });

        var images = Bacon.fromEventTarget(self.client, 'message', function(from, to, message) {
            return message;
        }).filter(function(message) {
            var isImage = self.imageUrlRegExp.test(message);
            self.imageUrlRegExp.lastIndex = 0;
            return isImage;
        }).map(function(message) {
            return message.match(self.imageUrlRegExp);
        });

        images.onValue(function(pics) {
            pics.forEach(function(pic) {
                console.log('pic: ' + pic)
                self.emit('image', {
                    url: pic.trim()
                });
            })
        });
    }

util.inherits(Irc, EventEmitter);
exports.ircspider = Irc;