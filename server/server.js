const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({server});

var packets = [];

app.get('/', function(req, res) {
    res.sendFile(__dirname+'/public/index.html');
});

app.get('/packets', function(req, res) {
    res.send(packets);
});

wss.on('connection', function connection(ws, req) {
    ws.on('message', function incoming(message) {
        console.log(message);
        packets.push(JSON.parse(message));
    });
    ws.send('received');
});

server.listen(8000, function listening() {
    console.log('listening on 8000');
});