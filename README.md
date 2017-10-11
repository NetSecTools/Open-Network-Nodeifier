# Open-Network-Nodeifier (ON2)
Open Network Nodeifier (ON2) will digest packet captures (live or replayed) and create network topologies consisting of the connections between IPs. The network administrator will then be able to color and group the nodes based on different criteria. For example you could color the range of IPs in your DMZ green and the internal devices only supposed to connect to the DMZ red to quickly see if they are connecting to anything other than a green colored node. If a connection is interesting then the link can be clicked on and the capture between the two devices displayed (or created as a new pcap file). Potentially there will be simple alerting based on certain groups connecting to eachother. We will be using d3.js (along with node.js for a simple web server) for parts of the visualization and tshark for the capturing or replaying of packets.
