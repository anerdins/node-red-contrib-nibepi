
module.exports = function(RED) {
    function nibeRMU(config) {
        RED.nodes.createNode(this,config);
        const server = RED.nodes.getNode(config.server);
        const startUp = () => {
            let system = config.system.replace('s','S');
            this.status({ fill: 'yellow', shape: 'dot', text: `RMU 40 ${system}` });
            const arr = [
            ];
            let conf = server.nibe.getConfig();
            if(conf.rmu===undefined) {
                conf.rmu = {};
                server.nibe.setConfig(conf);
            }
            if(conf.home.inside_sensors===undefined) {
                conf.home.inside_sensors = [];
                server.nibe.setConfig(conf);
            }
            if(conf.rmu['sensor_'+config.system]===undefined || conf.rmu['sensor_'+config.system]=="Ingen") {
                arr.push({topic:"inside_"+config.system,source:"nibe"});
            } else {
                let index = conf.home.inside_sensors.findIndex(i => i.name == conf.rmu['sensor_'+config.system]);
                if(index!==-1) {
                    var insideSensor = Object.assign({}, conf.home.inside_sensors[index]);
                    //let insideSensor = conf.home.inside_sensors[index];
                    arr.push(insideSensor);
                }
            }
        server.initiatePlugin(arr,'rmu',config.system).then(data => {
            this.status({ fill: 'green', shape: 'dot', text: `RMU 40 ${system}` });
            server.sendError('RMU 40',`RMU 40 ${system} ${server.text.sys_connected}`);
            this.send({enabled:true});
        },(reject => {
            this.status({ fill: 'red', shape: 'dot', text: `RMU 40 ${system}` });
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
        if(server.rmu_ready===true) {
            startUp();
        } else {
            server.nibeData.on('rmu_ready', (data) => {
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
        server.nibeData.on('pluginRMU', (data) => {
            if(data.system===config.system) {
                this.send({topic:"Inomhustemperatur",payload:data.rmuSensor.data});
            }
        })

        this.on('close', function() {
            let system = config.system.replace('s','S');
            server.nibeData.removeAllListeners();
            this.status({ fill: 'yellow', shape: 'dot', text: `RMU 40 ${system}` });
        });
    }
    RED.nodes.registerType("nibe-rmu",nibeRMU);
}