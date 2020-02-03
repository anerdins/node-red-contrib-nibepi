
module.exports = function(RED) {
    function nibeIndoor(config) {
        RED.nodes.createNode(this,config);
        const server = RED.nodes.getNode(config.server);
        const startUp = () => {
            let system = config.system.replace('s','S');
            this.status({ fill: 'yellow', shape: 'dot', text: `System ${system}` });
            const arr = [
                //{topic:"inside_"+config.system,source:"nibe"},
                {topic:"inside_set_"+config.system,source:"nibe"},
                {topic:"inside_enable_"+config.system,source:"nibe"},
                {topic:"inside_factor_"+config.system,source:"nibe"},
                {topic:"dM",source:"nibe"},
                {topic:"dMstart",source:"nibe"},
                {topic:"exhaust",source:"nibe"},
                {topic:"outside",source:"nibe"}
            ];
            let conf = server.nibe.getConfig();
            if(conf.indoor===undefined) {
                conf.indoor = {};
                server.nibe.setConfig(conf);
            }
            if(conf.home.inside_sensors===undefined) {
                conf.home.inside_sensors = [];
                server.nibe.setConfig(conf);
            }
            if(conf.indoor['sensor_'+config.system]===undefined || conf.indoor['sensor_'+config.system]=="Ingen") {
                arr.push({topic:"inside_"+config.system,source:"nibe"});
            } else {
                let index = conf.home.inside_sensors.findIndex(i => i.name == conf.indoor['sensor_'+config.system]);
                if(index!==-1) {
                    var insideSensor = Object.assign({}, conf.home.inside_sensors[index]);
                    //let insideSensor = conf.home.inside_sensors[index];
                    arr.push(insideSensor);
                }
            }
        server.initiatePlugin(arr,'indoor',config.system).then(data => {
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
                server.updateData();
                return;
            }
            if(msg.payload!==undefined && msg.topic!==undefined && msg.topic!=="") {
                let req = msg.topic.split('/');
                if(conf[req[0]]===undefined) conf[req[0]] = {};
                if(conf[req[0]][req[1]+'_'+config.system]!==msg.payload) {
                    conf[req[0]][req[1]+'_'+config.system] = msg.payload;
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
        server.nibeData.on('pluginIndoor', (data) => {
            if(data.system===config.system) {
                let outside = data['outside'];
                let dM = data.dM;
                let inside = data.indoorSensor;
                if(inside===undefined) inside = data['inside_'+data.system];
                if(inside!==undefined && inside.data>-3276) {
                    this.send({topic:"Inomhustemperatur",payload:inside.data});
                }
                if(data.indoorOffset!==undefined) {
                    this.send({topic:"Kurvjustering",payload:data.indoorOffset});
                }
                this.send({topic:"Utomhustemperatur",payload:outside.data});
                this.send({topic:"Gradminuter",payload:dM.data});
                this.send({topic:"Tid",payload:dM.timestamp});
                this.send({topic:"Avvikelse",payload:data.accuracy});
            }
        })

        this.on('close', function() {
            let system = config.system.replace('s','S');
            server.nibeData.removeAllListeners();
            this.status({ fill: 'yellow', shape: 'dot', text: `System ${system}` });
        });
    }
    RED.nodes.registerType("nibe-indoor",nibeIndoor);
}