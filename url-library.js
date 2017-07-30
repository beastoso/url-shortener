var mongo = require("mongodb");

var connectionStr = "mongodb://beastoso:hard24get@ds129013.mlab.com:29013/fcc-beastoso";

var library = {
  validateUrl: function(url) {
    if (!url || url.length < 12) {
      return false;
    }

    var index = url.indexOf("://");
    if (index < 4) {
      return false;
    }
    var protocol = url.substr(0, index);
    if (!protocol || (protocol !== 'http' && protocol !== 'https')) {
      return false;
    }
    var hostname = url.substr(protocol.length+3);
    
    var parts = hostname.split(".");
    if (parts.length < 2) {
      return false;
    }
    return true;
  },
   checkUrl: function(url, callback) {
     mongo.connect(connectionStr, function(err, db) {
      if (err) return callback(err, null);
      var collection = db.collection('urls');
      collection.findOne(
        {'url': url},
        {'shorturl':1},
        function(error, url) {
          if (error) return callback(error, null);
          db.close();
          if (!url) return callback(null, false);
          callback(null, url.shorturl);
      });
    });
   },
  storeUrl: function(url, callback) {
    mongo.connect(connectionStr, function(err, db) {
      if (err) return callback(err, null);
      
      library.checkUrl(url, function(findErr, id) {
        if (findErr) return callback(findErr, null);
        if (id) return callback(null, id);
        
        var collection = db.collection('urls');
        var urlId = (Math.random()*10000).toFixed(0);
        var obj = { 'url' : url, 'shorturl': urlId };
        collection.insert(obj,function(error, urls) {
          if (error) return callback(error, null);
          db.close();
          return urlId;
        });
      });
      
    });
  },
  fetchUrl: function(id, callback) {
    mongo.connect(connectionStr, function(err, db) {
      if (err) return callback(err, null);
      var collection = db.collection('urls');
      collection.findOne(
        {'shorturl': id},
        {'url':1},
        function(error, url) {
          if (error) return callback(error, null);
          db.close();
          if (!url) return callback(null, false);
          return callback(null, url.url);
        }
      );
    });
  }
}

module.exports = library;
