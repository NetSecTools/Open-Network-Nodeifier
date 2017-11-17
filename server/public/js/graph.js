﻿//Update on websocket data

var tickValue = 15000

var baseNodes = [
]
var baseLinks = [
]
var nodes = [...baseNodes]
var links = [...baseLinks]
function getNeighbors(node) {
    return baseLinks.reduce(function (neighbors, link) {
        if (link.target.id === node.id) {
            neighbors.push(link.source.id)
        } else if (link.source.id === node.id) {
            neighbors.push(link.target.id)
        }
        return neighbors
    },
        [node.id]
    )
}
function isNeighborLink(node, link) {
    return link.target.id === node.id || link.source.id === node.id
}
function getNodeColor(node, neighbors) {
    if (Array.isArray(neighbors) && neighbors.indexOf(node.id) > -1) {
        return node.level === 1 ? 'blue' : 'green'
    }
    return node.level === 1 ? 'red' : 'gray'
}
function getLinkColor(node, link) {
    return isNeighborLink(node, link) ? 'green' : '#E5E5E5'
}
function getTextColor(node, neighbors) {
    return Array.isArray(neighbors) && neighbors.indexOf(node.id) > -1 ? 'green' : 'black'
}
var width = Math.round(window.innerWidth - (window.innerWidth * .1))
var height = Math.round(window.innerHeight - (window.innerHeight * .1))
var svg = d3.select('svg')
svg.attr('width', width).attr('height', height)
var linkElements,
    nodeElements,
    textElements
// we use svg groups to logically group the elements together
var linkGroup = svg.append('g').attr('class', 'links')
var nodeGroup = svg.append('g').attr('class', 'nodes')
var textGroup = svg.append('g').attr('class', 'texts')
// we use this reference to select/deselect
// after clicking the same element twice
var selectedId
// simulation setup with all forces
var linkForce = d3
    .forceLink()
    .id(function (link) { return link.id })
    .strength(function (link) { return link.strength })
var simulation = d3
    .forceSimulation()
    .force('link', linkForce)
    .force('charge', d3.forceManyBody().strength(-120))
    .force('center', d3.forceCenter(width / 2, height / 2))
var dragDrop = d3.drag().on('start', function (node) {
    node.fx = node.x
    node.fy = node.y
}).on('drag', function (node) {
    simulation.alphaTarget(0.7).restart()
    node.fx = d3.event.x
    node.fy = d3.event.y
}).on('end', function (node) {
    if (!d3.event.active) {
        simulation.alphaTarget(0)
    }
    node.fx = null
    node.fy = null
})
// select node is called on every click
// we either update the data according to the selection
// or reset the data if the same node is clicked twice
function selectNode(selectedNode) {
    if (selectedId === selectedNode.id) {
        selectedId = undefined
        resetData()
        updateSimulation()
    } else {
        selectedId = selectedNode.id
        updateData(selectedNode)
        updateSimulation()
    }
    var neighbors = getNeighbors(selectedNode)
    // we modify the styles to highlight selected nodes
    nodeElements.attr('fill', function (node) { return getNodeColor(node, neighbors) })
    textElements.attr('fill', function (node) { return getTextColor(node, neighbors) })
    linkElements.attr('stroke', function (link) { return getLinkColor(selectedNode, link) })
}
// this helper simple adds all nodes and links
// that are missing, to recreate the initial state
function resetData() {
    var nodeIds = nodes.map(function (node) { return node.id })
    baseNodes.forEach(function (node) {
        if (nodeIds.indexOf(node.id) === -1) {
            nodes.push(node)
        }
    })
    links = baseLinks
}
// diffing and mutating the data
function updateData(selectedNode) {
    var neighbors = getNeighbors(selectedNode)
    var newNodes = baseNodes.filter(function (node) {
        return neighbors.indexOf(node.id) > -1 || node.level === 1
    })
    var diff = {
        removed: nodes.filter(function (node) { return newNodes.indexOf(node) === -1 }),
        added: newNodes.filter(function (node) { return nodes.indexOf(node) === -1 })
    }
    diff.removed.forEach(function (node) { nodes.splice(nodes.indexOf(node), 1) })
    diff.added.forEach(function (node) { nodes.push(node) })
    links = baseLinks.filter(function (link) {
        return link.target.id === selectedNode.id || link.source.id === selectedNode.id
    })
}
function updateGraph() {
    // links
    linkElements = linkGroup.selectAll('line')
        .data(links, function (link) {
            return link.target.id + link.source.id
        })
    linkElements.exit().remove()
    var linkEnter = linkElements
        .enter().append('line')
        .attr('stroke-width', 1)
        .attr('stroke', 'rgba(50, 50, 50, 0.2)')
    linkElements = linkEnter.merge(linkElements)
    // nodes
    nodeElements = nodeGroup.selectAll('circle')
        .data(nodes, function (node) { return node.id })
    nodeElements.exit().remove()
    var nodeEnter = nodeElements
        .enter()
        .append('circle')
        .attr('r', 10)
        .attr('fill', function (node) { return node.level === 1 ? 'red' : 'gray' })
        .call(dragDrop)
        // we link the selectNode method here
        // to update the graph on every click
        .on('click', selectNode)
    nodeElements = nodeEnter.merge(nodeElements)
    // texts
    textElements = textGroup.selectAll('text')
        .data(nodes, function (node) { return node.id })
    textElements.exit().remove()
    var textEnter = textElements
        .enter()
        .append('text')
        .text(function (node) { return node.label })
        .attr('font-size', 15)
        .attr('dx', 15)
        .attr('dy', 4)
    textElements = textEnter.merge(textElements)
}
function updateSimulation() {
    nodes = [...baseNodes]
    links = [...baseLinks]

    updateGraph()
    simulation.nodes(nodes).on('tick', () => {
        nodeElements
            .attr('cx', function (node) { return node.x })
            .attr('cy', function (node) { return node.y })
        textElements
            .attr('x', function (node) { return node.x })
            .attr('y', function (node) { return node.y })
        linkElements
            .attr('x1', function (link) { return link.source.x })
            .attr('y1', function (link) { return link.source.y })
            .attr('x2', function (link) { return link.target.x })
            .attr('y2', function (link) { return link.target.y })
    })
    simulation.force('link').links(links)
    simulation.alphaTarget(0.7).restart()
}
// last but not least, we call updateSimulation
// to trigger the initial render
updateSimulation()

var socket = new WebSocket("ws://" + window.location.host + "/ws/webapp");
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

/*
     "nodes": [
    {
      "id": "IPADDR",
      "group": 1
    },
    "links": [
    {
    "source": "IPSOURCE",
        "target": "IPDEST",
            "value": 1
    }
*/
function addPacket(data) {
    // How to check if it is in json list
    found = false;
    for (x = 0; x < baseNodes.length; x++){
        if (baseNodes[x].id === data.ip.src){
            found = true;
            baseNodes[x].expiration = data.expiration;
            break;
        }
    }
    //if it isn't push this into nodes
    if(!found){
        var newNode = { "id": data.ip.src, "label": data.ip.src, "level": 1, "group": 0, "expiration" : data.expiration};
        baseNodes.push(newNode)
    }
    // How to check if it is in json list
    found = false;
    for (x = 0; x < baseNodes.length; x++){
        if (baseNodes[x].id === data.ip.dst){
            found = true;
            break;
        }
    }
    //if it isn't push this into nodes
    if(!found){
        var newNode = { "id": data.ip.dst, "label": data.ip.dst, "level": 1, "group": 0 };
        baseNodes.push(newNode)
    }
    found = false
    //check if link is established
    for (x = 0; x < baseLinks.length; x++){
        if (baseLinks[x].source === data.ip.src && baseLinks[x].target === data.ip.dst){
            found = true
            break
        }
    }
    if (!found){
        //add and update if not
        baseLinks.push({"source" : data.ip.src, "target": data.ip.dst, "strength":  .1});
    }
    //otherwise graph doesn't need to change
}

function processTick(){
    //Update expiration time
    // -1 is never expire
    console.log("I'm alive")
    var x = baseNodes.length
    while(x--){
        if (baseNodes[x].expiration != -1 && !isNaN(baseNodes[x].expiration) ){
        baseNodes[x].expiration -= tickValue/1000
            if (baseNodes[x].expiration < 0){
                var i = baseLinks.length;
                while(i--){
                    if (baseLinks[i].source.id === baseNodes[x].id || baseLinks[i].target.id === baseNodes[x].id){
                        baseLinks.splice(i,i)
                    }
                }
                console.log("Node")
                console.log(JSON.parse(JSON.stringify(baseNodes[x])))
                console.log("Before")
                console.log(JSON.parse(JSON.stringify(baseNodes)))
                baseNodes.splice(x,x)
                console.log("After")
                console.log(JSON.parse(JSON.stringify(baseNodes)))
            }
        }
    }


    //Update the graph
    updateSimulation()
}

processTick()
setInterval(processTick, tickValue);
