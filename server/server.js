const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const url = require('url');

const app = express();
const server = http.createServer(app);
const wss_agents = new WebSocket.Server({noServer: true});
const wss_webapp = new WebSocket.Server({noServer: true});

var packets = [];
var sockets = new Set();

app.get('/', function(req, res) {
    res.sendFile(__dirname+'/public/index.html');
});

app.get('/packets', function(req, res) {
    res.send(packets);
});

server.on('upgrade', (request, socket, head) => {
    const pathname = url.parse(request.url).pathname;
    /* WebSocket code for the deployed agents */
    if(pathname === '/ws/agents') {
        wss_agents.handleUpgrade(request, socket, head, (ws) => {
            wss_agents.emit('connection', ws);
            console.log("agent connection opened");
            ws.on('message', function(data){
                console.log('agents', data);
                packets.push(data);
                for(let item of sockets){
                    item.send(data);
                }
            });
            ws.onclose = function() {
                console.log("agent connection closed");
            }
        });
    /* WebSocket code for the webapp clients */
    } else if(pathname === '/ws/webapp') {
        wss_webapp.handleUpgrade(request, socket, head, (ws) => {
            wss_webapp.emit('connection', ws);
            console.log("webapp connection opened");
            for(let item of packets) {
                ws.send(item);
            }
            sockets.add(ws);
            ws.on('message', function(data) {
                console.log('webapp', data);
            })
            ws.onclose = function(evt) {
                sockets.delete(evt.target);
                console.log("webapp connection closed");
            }
        });
    } else {
        socket.destroy();
    }
});

server.listen(8000, function listening() {
    console.log('listening on 8000');
});