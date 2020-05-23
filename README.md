# node-red-contrib-nibepi
Node-RED plugins for NibePi interface for connecting to Nibe F series heatpump
Link to downloadable image: 
Download the NibePi clean image file. Burn it to a 16GB SD-card and load it to the Raspberry Pi with the RS485 transciever.
The image file contains a Raspbian setup, MQTT Broker (no auth), Node-RED, preinstalled NibePi nodes for Node-RED with a read-only filesystem (writemode is possible from Node-RED)<br>
Please edit the wpa_supplicant.conf file on the boot partion with your country and wifi credentials.<br>
The Node-RED interface will be available on http://IP_ADDRESS:1880 or http://nibepi:1880<br>

Example flow here:<br>

```
[
    {
        "id": "c2626870.6a52c8",
        "type": "tab",
        "label": "Example",
        "disabled": false,
        "info": ""
    },
    {
        "id": "c2a66540.4f6c28",
        "type": "nibe-config",
        "z": "",
        "mqtt": true,
        "mqtt_discovery": false,
        "mqtt_topic": "nibe/modbus/",
        "mqtt_host": "127.0.0.1",
        "mqtt_port": "1883",
        "mqtt_user": "",
        "mqtt_pass": "",
        "readonly": true,
        "connection_series": "fSeries",
        "connection": "serial",
        "serial_port": "/dev/ttyAMA0",
        "tcp_server": "",
        "tcp_port": ""
    },
    {
        "id": "df78f47a.a51968",
        "type": "mqtt-broker",
        "z": "",
        "name": "NibePi",
        "broker": "127.0.0.1",
        "port": "1883",
        "clientid": "",
        "usetls": false,
        "compatmode": true,
        "keepalive": "60",
        "cleansession": true,
        "birthTopic": "",
        "birthQos": "0",
        "birthPayload": "",
        "closeTopic": "",
        "closeQos": "0",
        "closePayload": "",
        "willTopic": "",
        "willQos": "0",
        "willPayload": ""
    },
    {
        "id": "8c65f770.eb8d08",
        "type": "nibe-request",
        "z": "c2626870.6a52c8",
        "server": "c2a66540.4f6c28",
        "name": "40004",
        "x": 310,
        "y": 700,
        "wires": [
            [
                "1827f654.dda3da"
            ],
            [
                "562698f4.9ee208"
            ]
        ]
    },
    {
        "id": "b25667f9.794ea8",
        "type": "nibe-input",
        "z": "c2626870.6a52c8",
        "server": "c2a66540.4f6c28",
        "name": "40004",
        "add": false,
        "x": 100,
        "y": 420,
        "wires": [
            [
                "bf0de12f.f51dc"
            ],
            [
                "626f648.4ede99c"
            ]
        ]
    },
    {
        "id": "9a818749.c99058",
        "type": "nibe-output",
        "z": "c2626870.6a52c8",
        "server": "c2a66540.4f6c28",
        "name": "47260",
        "x": 345,
        "y": 847,
        "wires": [
            [
                "dc6484bf.e07ab8"
            ]
        ]
    },
    {
        "id": "bf0de12f.f51dc",
        "type": "debug",
        "z": "c2626870.6a52c8",
        "name": "Get only updated values in msg.payload",
        "active": false,
        "tosidebar": true,
        "console": false,
        "tostatus": false,
        "complete": "true",
        "targetType": "full",
        "x": 392,
        "y": 420,
        "wires": []
    },
    {
        "id": "626f648.4ede99c",
        "type": "debug",
        "z": "c2626870.6a52c8",
        "name": "Always updates when messages comes msg.payload",
        "active": false,
        "tosidebar": true,
        "console": false,
        "tostatus": false,
        "complete": "true",
        "targetType": "full",
        "x": 432,
        "y": 462,
        "wires": []
    },
    {
        "id": "37fbfd1e.6971c2",
        "type": "inject",
        "z": "c2626870.6a52c8",
        "name": "",
        "topic": "",
        "payload": "Original message",
        "payloadType": "str",
        "repeat": "",
        "crontab": "",
        "once": false,
        "onceDelay": 0.1,
        "x": 123,
        "y": 700,
        "wires": [
            [
                "8c65f770.eb8d08"
            ]
        ]
    },
    {
        "id": "1827f654.dda3da",
        "type": "debug",
        "z": "c2626870.6a52c8",
        "name": "msg.40004 is updated with the payload msg.40004_raw contains all json info",
        "active": true,
        "tosidebar": true,
        "console": false,
        "tostatus": false,
        "complete": "true",
        "targetType": "full",
        "x": 738,
        "y": 700,
        "wires": []
    },
    {
        "id": "562698f4.9ee208",
        "type": "debug",
        "z": "c2626870.6a52c8",
        "name": "msg.payload is updated with the request.",
        "active": true,
        "tosidebar": true,
        "console": false,
        "tostatus": false,
        "complete": "true",
        "targetType": "full",
        "x": 630,
        "y": 735,
        "wires": []
    },
    {
        "id": "61f75660.8a4878",
        "type": "comment",
        "z": "c2626870.6a52c8",
        "name": "Input node, first output only updates when the value is changed, the second output always updates, msg.raw contains the whole JSON with more information",
        "info": "",
        "x": 570,
        "y": 364,
        "wires": []
    },
    {
        "id": "b212730b.d53a3",
        "type": "comment",
        "z": "c2626870.6a52c8",
        "name": "Request node, request a updated value from the heatpump, the first output will add the message to msg.40004 (example), the second output adds it to the msg.payload",
        "info": "",
        "x": 600,
        "y": 644,
        "wires": []
    },
    {
        "id": "31a8d9c5.6981b6",
        "type": "inject",
        "z": "c2626870.6a52c8",
        "name": "",
        "topic": "",
        "payload": "0",
        "payloadType": "num",
        "repeat": "",
        "crontab": "",
        "once": false,
        "onceDelay": 0.1,
        "x": 100,
        "y": 847,
        "wires": [
            [
                "9a818749.c99058"
            ]
        ]
    },
    {
        "id": "dc6484bf.e07ab8",
        "type": "debug",
        "z": "c2626870.6a52c8",
        "name": "Confirmation from the heatpump that the message has been ACKED and the new value is returned",
        "active": false,
        "tosidebar": true,
        "console": false,
        "tostatus": false,
        "complete": "true",
        "targetType": "full",
        "x": 824,
        "y": 847,
        "wires": []
    },
    {
        "id": "41f4ab59.2f0d34",
        "type": "comment",
        "z": "c2626870.6a52c8",
        "name": "Output node, sets the selected register to the value in msg.payload",
        "info": "",
        "x": 290,
        "y": 791,
        "wires": []
    },
    {
        "id": "ee2894e7.83c318",
        "type": "nibe-input",
        "z": "c2626870.6a52c8",
        "server": "c2a66540.4f6c28",
        "name": "",
        "add": false,
        "x": 110,
        "y": 553,
        "wires": [
            [
                "4000c971.6d68c8"
            ],
            [
                "249a6ce6.a39d24"
            ]
        ]
    },
    {
        "id": "167e9574.2f7b9b",
        "type": "comment",
        "z": "c2626870.6a52c8",
        "name": "Unnamed node gets all the updates from every register that has been added or in the LOG.SET",
        "info": "",
        "x": 380,
        "y": 504,
        "wires": []
    },
    {
        "id": "4000c971.6d68c8",
        "type": "debug",
        "z": "c2626870.6a52c8",
        "name": "Only updated values",
        "active": false,
        "tosidebar": true,
        "console": false,
        "tostatus": false,
        "complete": "true",
        "targetType": "full",
        "x": 374,
        "y": 546,
        "wires": []
    },
    {
        "id": "249a6ce6.a39d24",
        "type": "debug",
        "z": "c2626870.6a52c8",
        "name": "Every value, the same or not",
        "active": false,
        "tosidebar": true,
        "console": false,
        "tostatus": false,
        "complete": "true",
        "targetType": "full",
        "x": 394,
        "y": 588,
        "wires": []
    },
    {
        "id": "e2d6010c.b657b",
        "type": "nibe-output",
        "z": "c2626870.6a52c8",
        "server": "c2a66540.4f6c28",
        "name": "",
        "x": 365,
        "y": 959,
        "wires": [
            [
                "db4d7e3a.27941"
            ]
        ]
    },
    {
        "id": "db4d7e3a.27941",
        "type": "debug",
        "z": "c2626870.6a52c8",
        "name": "Confirmation from the heatpump that the message has been ACKED and the new value is returned",
        "active": true,
        "tosidebar": true,
        "console": false,
        "tostatus": false,
        "complete": "true",
        "targetType": "full",
        "x": 838,
        "y": 959,
        "wires": []
    },
    {
        "id": "8bd15965.08a3f8",
        "type": "inject",
        "z": "c2626870.6a52c8",
        "name": "",
        "topic": "47260",
        "payload": "2",
        "payloadType": "num",
        "repeat": "",
        "crontab": "",
        "once": false,
        "onceDelay": 0.1,
        "x": 110,
        "y": 959,
        "wires": [
            [
                "e2d6010c.b657b"
            ]
        ]
    },
    {
        "id": "210aa2e4.0c50fe",
        "type": "comment",
        "z": "c2626870.6a52c8",
        "name": "No name in output node takes register from msg.topic, and the value from msg.payload",
        "info": "",
        "x": 350,
        "y": 910,
        "wires": []
    },
    {
        "id": "c73554e.4583fa8",
        "type": "exec",
        "z": "c2626870.6a52c8",
        "command": "sudo mount -o remount,ro /",
        "addpay": false,
        "append": "",
        "useSpawn": "false",
        "timer": "",
        "oldrc": false,
        "name": "Set READ-ONLY filesystem",
        "x": 920,
        "y": 220,
        "wires": [
            [],
            [],
            []
        ]
    },
    {
        "id": "fc6019a2.379148",
        "type": "inject",
        "z": "c2626870.6a52c8",
        "name": "Start",
        "topic": "",
        "payload": "",
        "payloadType": "date",
        "repeat": "",
        "crontab": "",
        "once": false,
        "onceDelay": 0.1,
        "x": 710,
        "y": 220,
        "wires": [
            [
                "c73554e.4583fa8"
            ]
        ]
    },
    {
        "id": "b4a28289.aeca2",
        "type": "exec",
        "z": "c2626870.6a52c8",
        "command": "sudo mount -o remount,rw /",
        "addpay": false,
        "append": "",
        "useSpawn": "false",
        "timer": "",
        "oldrc": false,
        "name": "Set READ/WRITE filesystem",
        "x": 920,
        "y": 280,
        "wires": [
            [],
            [],
            []
        ]
    },
    {
        "id": "46a6b81d.816838",
        "type": "inject",
        "z": "c2626870.6a52c8",
        "name": "Start",
        "topic": "",
        "payload": "",
        "payloadType": "date",
        "repeat": "",
        "crontab": "",
        "once": false,
        "onceDelay": 0.1,
        "x": 710,
        "y": 280,
        "wires": [
            [
                "b4a28289.aeca2"
            ]
        ]
    },
    {
        "id": "5a2aae0a.fc23a",
        "type": "comment",
        "z": "c2626870.6a52c8",
        "name": "Double click a NibePi node and add a server, the MQTT broker is running in the background, if you want NibePi to publish values to it, enable it. Set serialport etc.",
        "info": "",
        "x": 570,
        "y": 80,
        "wires": []
    },
    {
        "id": "ca5fa578.ff4248",
        "type": "comment",
        "z": "c2626870.6a52c8",
        "name": "The MQTT Broker is running at 127.0.0.1:1883 with no auth.",
        "info": "",
        "x": 260,
        "y": 122,
        "wires": []
    },
    {
        "id": "c6bd5ead.c97e4",
        "type": "comment",
        "z": "c2626870.6a52c8",
        "name": "In the input node, you can easily add registers by checking the box, NibePi will request them regulary, the more registers added, the longer it will take for each message.",
        "info": "",
        "x": 590,
        "y": 164,
        "wires": []
    },
    {
        "id": "99fbe0b.f0e772",
        "type": "inject",
        "z": "c2626870.6a52c8",
        "name": "",
        "topic": "removeRegister",
        "payload": "47260",
        "payloadType": "num",
        "repeat": "",
        "crontab": "",
        "once": false,
        "onceDelay": 0.1,
        "x": 140,
        "y": 256,
        "wires": [
            [
                "df31bf9e.12a3f"
            ]
        ]
    },
    {
        "id": "1856e3af.d0724c",
        "type": "inject",
        "z": "c2626870.6a52c8",
        "name": "",
        "topic": "addRegister",
        "payload": "47260",
        "payloadType": "num",
        "repeat": "",
        "crontab": "",
        "once": false,
        "onceDelay": 0.1,
        "x": 130,
        "y": 298,
        "wires": [
            [
                "df31bf9e.12a3f"
            ]
        ]
    },
    {
        "id": "df31bf9e.12a3f",
        "type": "nibe-output",
        "z": "c2626870.6a52c8",
        "server": "c2a66540.4f6c28",
        "name": "",
        "x": 376,
        "y": 277,
        "wires": [
            []
        ]
    },
    {
        "id": "2cb52bd8.777394",
        "type": "comment",
        "z": "c2626870.6a52c8",
        "name": "Remove or add register with the output node, set the topic as in the example.",
        "info": "",
        "x": 310,
        "y": 214,
        "wires": []
    },
    {
        "id": "8e3d51e6.e5956",
        "type": "debug",
        "z": "c2626870.6a52c8",
        "name": "MQTT ALL",
        "active": false,
        "tosidebar": true,
        "console": false,
        "tostatus": false,
        "complete": "payload",
        "targetType": "msg",
        "x": 390,
        "y": 1060,
        "wires": []
    },
    {
        "id": "4265c026.fe34b",
        "type": "mqtt in",
        "z": "c2626870.6a52c8",
        "name": "MQTT IN : nibe/modbus/#",
        "topic": "nibe/modbus/#",
        "qos": "2",
        "datatype": "auto",
        "broker": "df78f47a.a51968",
        "x": 164,
        "y": 1060,
        "wires": [
            [
                "8e3d51e6.e5956"
            ]
        ]
    },
    {
        "id": "986b14a8.cf5b88",
        "type": "comment",
        "z": "c2626870.6a52c8",
        "name": "If MQTT is activated, messages will come here",
        "info": "",
        "x": 224,
        "y": 1011,
        "wires": []
    },
    {
        "id": "9cb59e8d.d998a",
        "type": "mqtt out",
        "z": "c2626870.6a52c8",
        "name": "MQTT Out",
        "topic": "",
        "qos": "",
        "retain": "false",
        "broker": "df78f47a.a51968",
        "x": 460,
        "y": 1305,
        "wires": []
    },
    {
        "id": "4efe2494.f25bcc",
        "type": "inject",
        "z": "c2626870.6a52c8",
        "name": "",
        "topic": "nibe/modbus/47260/set",
        "payload": "2",
        "payloadType": "num",
        "repeat": "",
        "crontab": "",
        "once": false,
        "onceDelay": 0.1,
        "x": 164,
        "y": 1263,
        "wires": [
            [
                "9cb59e8d.d998a"
            ]
        ]
    },
    {
        "id": "d0917bf.7880088",
        "type": "inject",
        "z": "c2626870.6a52c8",
        "name": "",
        "topic": "nibe/modbus/47260/set",
        "payload": "0",
        "payloadType": "num",
        "repeat": "",
        "crontab": "",
        "once": false,
        "onceDelay": 0.1,
        "x": 164,
        "y": 1312,
        "wires": [
            [
                "9cb59e8d.d998a"
            ]
        ]
    },
    {
        "id": "2489accf.d8f284",
        "type": "inject",
        "z": "c2626870.6a52c8",
        "name": "",
        "topic": "nibe/modbus/47260/get",
        "payload": "true",
        "payloadType": "bool",
        "repeat": "",
        "crontab": "",
        "once": false,
        "onceDelay": 0.1,
        "x": 174,
        "y": 1361,
        "wires": [
            [
                "9cb59e8d.d998a"
            ]
        ]
    },
    {
        "id": "5eca8eef.35781",
        "type": "mqtt in",
        "z": "c2626870.6a52c8",
        "name": "MQTT IN : nibe/modbus/47260",
        "topic": "nibe/modbus/47260",
        "qos": "2",
        "datatype": "auto",
        "broker": "df78f47a.a51968",
        "x": 184,
        "y": 1109,
        "wires": [
            [
                "d7003a71.6ac5a8"
            ]
        ]
    },
    {
        "id": "70b75416.77deac",
        "type": "mqtt in",
        "z": "c2626870.6a52c8",
        "name": "MQTT IN : nibe/modbus/47260/raw",
        "topic": "nibe/modbus/47260/raw",
        "qos": "2",
        "datatype": "auto",
        "broker": "df78f47a.a51968",
        "x": 194,
        "y": 1158,
        "wires": [
            [
                "e86dfd41.0bc2d"
            ]
        ]
    },
    {
        "id": "9f17fb63.355578",
        "type": "mqtt in",
        "z": "c2626870.6a52c8",
        "name": "MQTT IN : nibe/modbus/47260/json",
        "topic": "nibe/modbus/47260/json",
        "qos": "2",
        "datatype": "auto",
        "broker": "df78f47a.a51968",
        "x": 194,
        "y": 1207,
        "wires": [
            [
                "53dab2da.1afa0c"
            ]
        ]
    },
    {
        "id": "d7003a71.6ac5a8",
        "type": "debug",
        "z": "c2626870.6a52c8",
        "name": "MQTT",
        "active": false,
        "tosidebar": true,
        "console": false,
        "tostatus": false,
        "complete": "payload",
        "targetType": "msg",
        "x": 405,
        "y": 1109,
        "wires": []
    },
    {
        "id": "e86dfd41.0bc2d",
        "type": "debug",
        "z": "c2626870.6a52c8",
        "name": "MQTT RAW",
        "active": true,
        "tosidebar": true,
        "console": false,
        "tostatus": false,
        "complete": "payload",
        "targetType": "msg",
        "x": 432,
        "y": 1158,
        "wires": []
    },
    {
        "id": "53dab2da.1afa0c",
        "type": "debug",
        "z": "c2626870.6a52c8",
        "name": "MQTT JSON",
        "active": true,
        "tosidebar": true,
        "console": false,
        "tostatus": false,
        "complete": "payload",
        "targetType": "msg",
        "x": 432,
        "y": 1207,
        "wires": []
    },
    {
        "id": "6540a3be.8a232c",
        "type": "inject",
        "z": "c2626870.6a52c8",
        "name": "",
        "topic": "nibe/modbus/47260/add",
        "payload": "true",
        "payloadType": "bool",
        "repeat": "",
        "crontab": "",
        "once": false,
        "onceDelay": 0.1,
        "x": 174,
        "y": 1410,
        "wires": [
            [
                "9cb59e8d.d998a"
            ]
        ]
    },
    {
        "id": "c82d49fd.a65a48",
        "type": "inject",
        "z": "c2626870.6a52c8",
        "name": "",
        "topic": "nibe/modbus/47260/remove",
        "payload": "true",
        "payloadType": "bool",
        "repeat": "",
        "crontab": "",
        "once": false,
        "onceDelay": 0.1,
        "x": 184,
        "y": 1459,
        "wires": [
            [
                "9cb59e8d.d998a"
            ]
        ]
    },
    {
        "id": "998dbdec.aa7f6",
        "type": "exec",
        "z": "c2626870.6a52c8",
        "command": "sudo reboot",
        "addpay": false,
        "append": "",
        "useSpawn": "false",
        "timer": "",
        "oldrc": false,
        "name": "Reboot NibePi hardware",
        "x": 990,
        "y": 440,
        "wires": [
            [],
            [],
            []
        ]
    },
    {
        "id": "82316f38.199e2",
        "type": "inject",
        "z": "c2626870.6a52c8",
        "name": "Start",
        "topic": "",
        "payload": "",
        "payloadType": "date",
        "repeat": "",
        "crontab": "",
        "once": false,
        "onceDelay": 0.1,
        "x": 790,
        "y": 440,
        "wires": [
            [
                "998dbdec.aa7f6"
            ]
        ]
    },
    {
        "id": "a434e28.575d82",
        "type": "inject",
        "z": "c2626870.6a52c8",
        "name": "Start",
        "topic": "",
        "payload": "",
        "payloadType": "date",
        "repeat": "",
        "crontab": "",
        "once": false,
        "onceDelay": 0.1,
        "x": 790,
        "y": 500,
        "wires": [
            [
                "a69d43bb.f7373"
            ]
        ]
    },
    {
        "id": "a69d43bb.f7373",
        "type": "exec",
        "z": "c2626870.6a52c8",
        "command": "sudo shutdown now",
        "addpay": false,
        "append": "",
        "useSpawn": "false",
        "timer": "",
        "oldrc": false,
        "name": "Shutdown NibePi hardware",
        "x": 1000,
        "y": 500,
        "wires": [
            [],
            [],
            []
        ]
    },
    {
        "id": "88732c48.ab2f5",
        "type": "comment",
        "z": "c2626870.6a52c8",
        "name": "NibePi will automatically discover the heatpump and load the registers when the right serialport is selected",
        "info": "",
        "x": 400,
        "y": 40,
        "wires": []
    }
]
```
