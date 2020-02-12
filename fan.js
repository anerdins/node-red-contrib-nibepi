
module.exports = function(RED) {
    function nibeFan(config) {
        RED.nodes.createNode(this,config);
        const server = RED.nodes.getNode(config.server);
        const startUp = () => {
            let system = config.system.replace('s','S');
            this.status({ fill: 'yellow', shape: 'dot', text: `System ${system}` });
            const arr = [
                /*{topic:"bs1_flow",source:"nibe"},
                {topic:"fan_speed",source:"nibe"},
                {topic:"alarm",source:"nibe"},
                {topic:"vented",source:"nibe"},
                {topic:"cpr_set",source:"nibe"},
                {topic:"cpr_act",source:"nibe"}*/
            ];
            let conf = server.nibe.getConfig();
            if(conf.fan===undefined) {
                conf.fan = {};
                server.nibe.setConfig(conf);
            }
            /*
            if(conf.home.inside_sensors===undefined) {
                conf.home.inside_sensors = [];
                server.nibe.setConfig(conf);
            }
            if(conf.fan.sensor===undefined || conf.fan.sensor=="Ingen") {
                
            } else {
                let index = conf.home.inside_sensors.findIndex(i => i.name == conf.fan.sensor);
                if(index!==-1) {
                    var co2Sensor = Object.assign({}, conf.home.inside_sensors[index]);
                    arr.push(co2Sensor);
                }
            }*/
        server.initiatePlugin(arr,'fan',config.system).then(data => {
            this.status({ fill: 'green', shape: 'dot', text: `System ${system}` });
            this.send({enabled:true});
        },(reject => {
            this.status({ fill: 'red', shape: 'dot', text: `System ${system}` });
            this.send({enabled:false});
        }));
        }
        this.on('input', function(msg) {
            let conf = server.nibe.getConfig();
            if(msg.topic=="update") {
                server.runFan();
                return;
            }
            if(msg.payload!==undefined && msg.topic!==undefined && msg.topic!=="") {
                let req = msg.topic.split('/');
                if(conf[req[0]]===undefined) conf[req[0]] = {};
                if(conf[req[0]][req[1]]!==msg.payload) {
                    conf[req[0]][req[1]] = msg.payload;
                    server.nibe.setConfig(conf);
                }
                startUp();
            }
            
        });
        if(server.nibe.core!==undefined && server.nibe.core.connected!==undefined && server.nibe.core.connected===true) {
            startUp();
        } else {
            server.nibeData.on('ready', (data) => {
                startUp();
            })
        }
        server.nibeData.on(this.id, (data) => {
            if(data.changed===true) {
                config.system = data.system;
                if(server.nibe.core!==undefined && server.nibe.core.connected!==undefined && server.nibe.core.connected===true) {
                    startUp();
                }
            }
        })
        server.nibeData.on('pluginFan', (data) => {
                let co2 = data.co2Sensor;
                if(co2!==undefined && co2.data!==undefined && co2.data.data>0) {
                    this.send({topic:"CO2",payload:co2.data.data});
                }
                this.send({topic:"Fläkthastighet",payload:data.fan_speed.data});
                this.send({topic:"Luftflöde",payload:data.bs1_flow.data});
                this.send({topic:"Luftflöde Börvärde",payload:data.setpoint});
        })

        this.on('close', function() {
            let system = config.system.replace('s','S');
            server.nibeData.removeAllListeners();
            this.status({ fill: 'yellow', shape: 'dot', text: `System ${system}` });
        });
    }
    RED.nodes.registerType("nibe-fan",nibeFan);
}