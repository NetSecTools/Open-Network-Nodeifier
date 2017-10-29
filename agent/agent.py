import websocket
import json
import pyshark
import os

def capture_and_send(server='localhost:8000'):
    # Assume Linux client
    interfaces = os.listdir('/sys/class/net')
    capture = pyshark.LiveCapture(interface=interfaces)


# create our websocket to send data to server
    ws = websocket.create_connection('ws://{}/ws/agents'.format(server))
    for packet in capture.sniff_continuously():
        #print('Just arrived:', packet.eth)
        data = {}
        if hasattr(packet, 'eth'):
            data['eth'] = {
                "src": packet.eth.src,
                "dst": packet.eth.dst
            }
        if hasattr(packet, 'ip'):
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