(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "http", "fs", "url", "path"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var http = require("http");
    var fs = require("fs");
    var url = require("url");
    var path = require("path");
    var port = 8081;
    var srcFolder = 'app';
    var mimeTypes = {
        '.ico': 'image/x-icon',
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.json': 'application/json',
        '.css': 'text/css',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.svg': 'image/svg+xml',
        '.pdf': 'application/pdf',
        '.ttf': 'aplication/font-sfnt',
        '.ts': 'text/javascript'
    };
    var routes = [
        ['/node_modules/', 'node_modules', 'index.js'],
        ['/', 'app', 'index.html']
    ];
    http.createServer(function (request, response) {
        console.log(request.method + " " + request.url);
        var parsedUrl = url.parse(request.url);
        // Figure out which of the routes applies to the requested URL
        var route = routes.filter(function (r) { return r[0] == parsedUrl.pathname.substr(0, r[0].length); })[0];
        // Figure out the path of the file in the real file system
        var filePath = route[1] + '/' + parsedUrl.pathname.substr(route[0].length);
        // Check whether the file exists and whether it is actually a folder
        fs.stat(filePath, function (err, fileInfo) {
            if (err) {
                response.statusCode = 404;
                response.end("Error: " + err.message);
            }
            else {
                if (fileInfo.isDirectory())
                    filePath += '/' + route[2];
                // Read the file and send it to the user's web browser
                fs.readFile(filePath, function (err, data) {
                    if (err) {
                        response.statusCode = 404;
                        response.end("Read error: " + err.message);
                    }
                    else {
                        var ext = path.extname(filePath);
                        var mimeType = mimeTypes[ext] || 'application/octet-stream';
                        response.writeHead(200, { 'Content-Type': mimeType });
                        response.end(data);
                    }
                });
            }
        });
    }).listen(port);
    console.log("Server running: http://127.0.0.1:" + port);
});
//# sourceMappingURL=server.js.map