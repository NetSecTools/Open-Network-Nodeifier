import websocket
import json
import pyshark
import os
import socket

def get_agent_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
    except:
        ip = socket.gethostbyname(socket.gethostname())
    return ip

def capture_and_send(server='localhost:8000'):
    # Assume Linux client
    interfaces = os.listdir('/sys/class/net')
    myIP = get_agent_ip()
    capture = pyshark.LiveCapture(interface=interfaces)
    print("Capturing on: {}\nDetected local address: {}\nServer Address: {}".format(interfaces, myIP, server))

# create our websocket to send data to server
    ws = websocket.create_connection('ws://{}/ws/agents'.format(server))
    for packet in capture.sniff_continuously():
        data = {}
        # ignore pure layer 2 for now
        if hasattr(packet, 'eth') and hasattr(packet, 'ip') and (packet.ip.src != myIP and packet.ip.dst != server.split(":")[0]):
            data['eth'] = {
                "src": packet.eth.src,
                "dst": packet.eth.dst
            }
            data['ip'] = {
                "src": packet.ip.src,
                "dst": packet.ip.dst,
                "src_geo": packet.ip.geosrc_country if hasattr(packet.ip, 'geosrc_country') else "Unknown",
                "dst_geo": packet.ip.geodst_country if hasattr(packet.ip, 'geodst_country') else "Unknown"
            }
            if packet.transport_layer:
                proto = packet.transport_layer
                data['transport'] = {
                    "proto": proto,
                    "src": packet[proto].srcport,
                    "dst": packet[proto].dstport
                }
            data = json.dumps(data)
            ws.send(data)
    ws.close()

if __name__=="__main__":
    capture_and_send()

"""
Sample json being sent
{
  "eth": {
     "src": "aa:bb:cc:",
     "dst": "dd:ee:ff"
  },
  "ip": {
     "src": "1.2.3.4",
     "src_geo": "United States",
     "dst": "6.7.8.9",
     "dst_geo": "None"
  },
  "transport": {
     "proto": "TCP",
     "src": "43232",
     "dst": "80"
  }
}
"""

