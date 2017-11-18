# Open-Network-Nodeifier (ON2)
Open Network Nodeifier (ON2) will digest packet captures (live or replayed) and create network topologies consisting of the connections between IPs. The network administrator will then be able to color and group the nodes based on different criteria. For example you could color the range of IPs in your DMZ green and the internal devices only supposed to connect to the DMZ red to quickly see if they are connecting to anything other than a green colored node. There is a simple alerting based on certain groups connecting to eachother. We will be using d3.js (along with node.js for a simple web server) for parts of the visualization and tshark for the capturing or replaying of packets, and alertify.js for alerting.

Authors: Bryson McIver and Ohan Fillbach


# Deployment

## Collection Server Deployment

### Requirements
- nodejs
- npm

1. Copy the server folder onto your collection box.
2. Run `npm install` to install necessary packages.
3. Edit the rules.json file (see examples) to create filtering and coloring rules. Group 9001 is for dropping traffic.
4. Run `node server.js` to launch the server on port 8000.
5. Optionally edit parameters at the top of the graph.js file
6. Open web broswer to your server's ip port 8000


## Agent Deployment

### Requirements
- python3
- pyshark
- websocket-client

1. Copy the agent.py file to the (only linux is supported currently) agent you want to collect from.
2. Run `ageny.py nodeserverip` to start collecting on the agent's interfaces

# Development

If you would like to add more rule processing function, look at comments in server.js and add to the packet processing.
While it's not the cleanest to add these, it is realitively easy to tie them in if you follow the format.
