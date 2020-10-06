"use strict";

var fs = require('fs');
var path = require('path');
var http = require('http');

var mimes = require("./mimes.json")
var staticBasePath = './http';

var staticServe = function (req, res) {
    var resolvedBase = path.resolve(staticBasePath);
    var safeSuffix = path.normalize(req.url).replace(/^(\.\.[\/\\])+/, '');
    var fileLoc = path.join(resolvedBase, safeSuffix);

    fs.readFile(fileLoc, function (err, data) {
        if (err) {
            res.writeHead(404, 'Not Found');
            res.write('404: File Not Found!');
            return res.end();
        }
        var extension = req.url.substring(
            req.url.lastIndexOf(".")
        );

        var type = mimes[extension];
        if (type) {
            res.setHeader("content-type", type);
        }
        res.statusCode = 200;

        res.write(data);
        return res.end();
    });
};

var httpServer = http.createServer(staticServe);
var io = require('socket.io').listen(httpServer);
io.sockets.on('connection', function (socket) {
    socket.emit('news', { hello: 'world' });
    socket.on('my other event', function (data) {
        console.log(data);
    });
});
httpServer.listen(8090);