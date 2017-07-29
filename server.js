'use strict';

var fs = require('fs');
var express = require('express');
var app = express();


function validateUrl(url) {
  if (req.url && req.url.length > 17) {
    
    var newUrl = req.url.substr(5);
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
}

if (!process.env.DISABLE_XORIGIN) {
  app.use(function(req, res, next) {
    var allowedOrigins = ['https://narrow-plane.gomix.me', 'https://www.freecodecamp.com'];
    var origin = req.headers.origin || '*';
    if(!process.env.XORIG_RESTRICT || allowedOrigins.indexOf(origin) > -1){
         console.log(origin);
         res.setHeader('Access-Control-Allow-Origin', origin);
         res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    }
    next();
  });
}

app.use('/public', express.static(process.cwd() + '/public'));

app.route('/_api/package.json')
  .get(function(req, res, next) {
    console.log('requested');
    fs.readFile(__dirname + '/package.json', function(err, data) {
      if(err) return next(err);
      res.type('txt').send(data.toString());
    });
  });
  
app.route('/')
    .get(function(req, res) {
		  res.sendFile(process.cwd() + '/views/index.html');
    });

app.route('/new/:longurl').get(function(req, res, next) {
  var url = req.url.substr(5);
  if (!validateUrl(url)) {
    return res.send("Invalid URL");
  }
    
    
    var urlId = '';
    var result = {
      'original_url': url,
      'short_url': 'https://fanatical-earth.glitch.me/'+urlId
    };
    res.send(JSON.stringify(result));
});

app.route('/:id').get(function(req, res, next){
  res.send("Short URL not found");
  var newUrl = '';
  res.redirect(newUrl);
});


// Respond not found to all the wrong routes
app.use(function(req, res, next){
  res.status(404);
  res.type('txt').send('Not found');
});

// Error Middleware
app.use(function(err, req, res, next) {
  if(err) {
    res.status(err.status || 500)
      .type('txt')
      .send(err.message || 'SERVER ERROR');
  }  
})

app.listen(process.env.PORT, function () {
  console.log('Node.js listening ...');
});

