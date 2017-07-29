var mongo = require("mongodb");

var connectionStr = "mongodb://beastoso:hard24get@ds129013.mlab.com:29013/fcc-beastoso";

module.exports = {
  validateUrl: function(url) {
    if (url && url.length > 17) {

      var newUrl = url.substr(5);
      var protocol = newUrl.substr(0, newUrl.indexOf("://"));
      if (!protocol) {
        return false;
      }
      if (protocol !== 'http' || protocol !== 'https') {
        return false;
      }

      var hostname = newUrl.substr(protocol.length+3);
      var parts = hostname.split(".");
      if (parts.length < 3) {
        return false;
      }
      return true;
    }
    return false;
  },
   checkUrl: function(url, callback) {
     mongo.connect(connectionStr, function(err, db) {
      if (err) return callback(err, null);
      var collection = db.collection('urls');
      collection.find(
        {'url': url},
        {'id':1,'url':0}
      ).toArray(function(error, urls) {
        if (error) return callback(error, null);
        db.close();
        if (urls.length === 0) return callback(null, false);
        callback(null, urls[0].id);
      });
    });
   },
  storeUrl: function(url, callback) {
    mongo.connect(connectionStr, function(err, db) {
      if (err) return callback(err, null);
      
      this.checkUrl(url, function(findErr, id) {
        if (findErr) return callback(findErr, null);
        if (!id) {
          var collection = db.collection('urls');
          var obj = { 'url' : url };
          console.log(JSON.stringify(obj));
          collection.insert(url,function(error, urls) {
            if (error) return callback(error, null);
            db.close();
            return callback(null, urls[0].id);
          });
        }
        return callback(null, id);
      });
      
    });
  },
  fetchUrl: function(id, callback) {
    mongo.connect(connectionStr, function(err, db) {
      if (err) return callback(err, null);
      var collection = db.collection('urls');
      collection.find(
        {'id': parseInt(id)},
        {'url':1,'id':0}
      ).toArray(function(error, urls) {
        if (error) return callback(error, null);
        db.close();
        if (urls.length == 0) return callback(null, false);
        else return callback(null, urls[0].url);
      });
    });
  }
}
