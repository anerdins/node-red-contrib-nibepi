
module.exports = function(RED) {
    function nibePrice(config) {
        RED.nodes.createNode(this,config);
        const server = RED.nodes.getNode(config.server);
        const startUp = () => {
            let system = config.system.replace('s','S');
            let conf = server.nibe.getConfig();
            this.status({ fill: 'yellow', shape: 'dot', text: `System ${system}` });
            let arr = [
                {topic:"inside_set_"+config.system,source:"nibe"},
                {topic:"outside",source:"nibe"}
            ];
            if(conf.system.pump!=="F370" && conf.system.pump!=="F470") {
                arr.push({topic:"dM",source:"nibe"});
                arr.push({topic:"dMstart",source:"nibe"})
            }
            
            if(conf.price===undefined) {
                conf.price = {};
                server.nibe.setConfig(conf);
            }
            if(conf.home.inside_sensors===undefined) {
                conf.home.inside_sensors = [];
                server.nibe.setConfig(conf);
            }
            
            if(conf.price['sensor_'+config.system]===undefined || conf.price['sensor_'+config.system]=="Ingen") {
                arr.push({topic:"inside_"+config.system,source:"nibe"});
            } else {
                let index = conf.home.inside_sensors.findIndex(i => i.name == conf.price['sensor_'+config.system]);
                if(index!==-1) {
                    var insideSensor = Object.assign({}, conf.home.inside_sensors[index]);
                    //let insideSensor = conf.home.inside_sensors[index];
                    arr.push(insideSensor);
                }
            }
            if(conf.price.enable!==true) arr = [];
                server.initiatePlugin(arr,'price',config.system).then(data => {
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
                let data = {system:config.system}
                server.updateData(data);
                return;
            } else if(msg.topic=="price/enable") {
                let req = msg.topic.split('/');
                if(conf[req[0]]===undefined) conf[req[0]] = {};
                if(conf[req[0]][req[1]]!==msg.payload) {
                    conf[req[0]][req[1]] = msg.payload;
                    server.nibe.setConfig(conf);
                }
                startUp();
            } else if(msg.payload!==undefined && msg.topic!==undefined && msg.topic!=="") {
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
        server.nibeData.on('pluginPriceGraph', (data) => {
            if(data.system===config.system) {
                this.send({topic:"Graf",payload:[]});
                this.send({topic:"Graf",payload:data.values});
            }
            
        });
        server.nibeData.on('pluginPrice', (data) => {
            if(data.system===config.system) {
                this.send({topic:"Nuvarande Elprisnivå",payload:data.price_level.data});
                this.send({topic:"Nuvarande Elpris",payload:data.price_current.data});
                this.send([null,{topic:"test",payload:data}]);
            }
        })

        this.on('close', function() {
            let system = config.system.replace('s','S');
            server.nibeData.removeAllListeners();
            this.status({ fill: 'yellow', shape: 'dot', text: `System ${system}` });
        });
    }
    RED.nodes.registerType("nibe-price",nibePrice);
}