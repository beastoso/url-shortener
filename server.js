'use strict';

var urlLib = require('./url-library.js')
var fs = require('fs');
var express = require('express');
var app = express();


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

app.route('/new/*').get(function(req, res, next) {
  var url = req.url.substr(5);
  if (!urlLib.validateUrl(url)) {
    return res.send("Invalid URL");
  }
  urlLib.storeUrl(url, function(err, id) {
    if (err) return res.send(err);
    var result = {
      'original_url': url,
      'short_url': 'https://fanatical-earth.glitch.me/'+id
    };
    res.send(JSON.stringify(result));
  });    
});

app.route('/:id').get(function(req, res, next){
  var id = req.params.id;
  if (!id || isNaN(id)) {
    return res.send('Invalid short URL');
  }
  urlLib.fetchUrl(id, function(err, url) {
    if (err) return res.send(err);
    if (url === false) return res.send("Short URL not found");
    else res.redirect(url);
  });
  
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

