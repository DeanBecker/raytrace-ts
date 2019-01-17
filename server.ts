import * as http from 'http';
import * as fs from 'fs';
import * as url from 'url';
import * as path from 'path';

const port = 8081;
const srcFolder = 'app';
const mimeTypes: {[mimeType: string]: string} = {
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

const routes = [
    ['/node_modules/', 'node_modules', 'index.js'],
    ['/', 'app', 'index.html']
];

http.createServer(function (request, response) {
    console.log(`${request.method} ${request.url}`);

    let parsedUrl = url.parse(request.url!);
    // Figure out which of the routes applies to the requested URL
    let route = routes.filter(r => r[0] == parsedUrl.pathname!.substr(0, r[0].length))[0];
    // Figure out the path of the file in the real file system
    let filePath = route[1] + '/' + parsedUrl.pathname!.substr(route[0].length);
    // Check whether the file exists and whether it is actually a folder
    fs.stat(filePath, (err, fileInfo) => {
        if (err) {
            response.statusCode = 404;
            response.end("Error: " + err.message);
        } else {
            if (fileInfo.isDirectory())
                filePath += '/' + route[2];

            // Read the file and send it to the user's web browser
            fs.readFile(filePath, (err, data) => {
                if (err) {
                    response.statusCode = 404;
                    response.end("Read error: " + err.message);
                } else {
                    let ext = path.extname(filePath);
                    let mimeType = mimeTypes[ext] || 'application/octet-stream';
                    response.writeHead(200, { 'Content-Type': mimeType });
                    response.end(data);
                }
            });
        }
    });
}).listen(port);

console.log(`Server running: http://127.0.0.1:${port}`);