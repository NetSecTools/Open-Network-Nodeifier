var packets = document.getElementById('packets');
var socket = new WebSocket("ws://" + window.location.host +"/ws/webapp");
socket.onopen = function (evt) {
    console.log('connection opened');
}
socket.onerror = function (evt) {
    console.log("connection error");
}
socket.onmessage = function (evt) {
    var p = evt.data;
    addPacket(JSON.parse(p));
}

socket.onclose = function (evt) {
    console.log("connection closed");
}
function addPacket(data) {
    var node = document.createElement('li');
    var txt = document.createTextNode(JSON.stringify(data));
    node.appendChild(txt);
    packets.appendChild(node);
}