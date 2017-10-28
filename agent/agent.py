import websocket
import json

#websocket.enableTrace(True)
ws = websocket.create_connection('ws://localhost:8000/ws/agents')

print('sending 1')
ws.send(json.dumps({'packet': 'fake_frame'}))

print('sending 2')
ws.send(json.dumps({'packet': 'frame_2'}))

ws.close()