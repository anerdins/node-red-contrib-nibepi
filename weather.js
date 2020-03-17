
module.exports = function(RED) {
     function nibeWeather(config) {
        RED.nodes.createNode(this,config);
        const server = RED.nodes.getNode(config.server);
        let system = config.system.replace('s','S');
        const startUp = () => {
            this.status({ fill: 'yellow', shape: 'dot', text: `System ${system}` });
            let conf = server.nibe.getConfig();
            if(conf.weather===undefined) {
                conf.weather = {};
                server.nibe.setConfig(conf);
            }
            let arr = [
                {topic:"outside",source:"nibe"},
                {topic:"heatcurve_"+config.system,source:"nibe"}
            ];
            if(conf.home.inside_sensors===undefined) {
                conf.home.inside_sensors = [];
                server.nibe.setConfig(conf);
            }
            
            if(conf.weather['sensor_'+config.system]===undefined || conf.weather['sensor_'+config.system]=="Ingen") {
                arr.push({topic:"inside_"+config.system,source:"nibe"});
            } else {
                let index = conf.home.inside_sensors.findIndex(i => i.name == conf.weather['sensor_'+config.system]);
                if(index!==-1) {
                    var insideSensor = Object.assign({}, conf.home.inside_sensors[index]);
                    //let insideSensor = conf.home.inside_sensors[index];
                    arr.push(insideSensor);
                }
            }
            if(conf.weather['enable_'+config.system]!==true) arr = [];
                server.initiatePlugin(arr,'weather',config.system).then(result => {
                    this.status({ fill: 'green', shape: 'dot', text: `System ${system}` });
                    this.send({enabled:true});
                },(reject => {
                    this.status({ fill: 'red', shape: 'dot', text: `System ${system}` });
                    this.send({enabled:false});
                }));
        
        }
        
        if(server.nibe.core!==undefined && server.nibe.core.connected!==undefined && server.nibe.core.connected===true) {
            startUp();
        } else {
            server.nibeData.on('ready', (data) => {
                startUp();
            })
        }
        this.on('input', function(msg) {
            let conf = server.nibe.getConfig();
            if(msg.topic=="update") {
                server.updateData(true);
                return;
            }
            if(msg.payload!==undefined && msg.topic!==undefined && msg.topic!=="") {
                let req = msg.topic.split('/');
                if(conf[req[0]][req[1]+'_'+config.system]!==msg.payload) {
                    conf[req[0]][req[1]+'_'+config.system] = msg.payload;
                    server.nibe.setConfig(conf);
                    startUp();
                }
            }
            
        });
        server.nibeData.on(this.id, (data) => {
            if(data.changed===true) {
                config.system = data.system;
                if(server.nibe.core!==undefined && server.nibe.core.connected!==undefined && server.nibe.core.connected===true) {
                    startUp();
                }
            }
        })
        server.nibeData.on('pluginWeather', (data) => {
            if(data.system===config.system) {
                let outside = data['outside'];
                //server.nibeData.emit('forecast_1',arr,config.system);
                this.send({topic:"Utomhustemperatur",payload:outside.data});
                this.send({topic:"Kurvjustering",payload:data.weatherOffset});
                //if(data.predictedNow!==undefined) this.send({topic:"Nuvarande prognos",payload:data.predictedNow.payload,timestamp:data.predictedNow.timestamp});
                if(data.predictedLater!==undefined) this.send({topic:"Prognos",payload:data.predictedLater.payload,timestamp:data.predictedLater.timestamp});
                if(data.unfiltredTemp!==undefined) this.send({topic:"Ojusterad Prognos",payload:data.unfiltredTemp.payload,timestamp:data.unfiltredTemp.timestamp});
                this.send([null,{topic:"Vindgraf",payload:data.windGraph}]);
            }
        })
        this.on('close', function() {
            server.nibeData.removeAllListeners();
            this.status({ fill: 'yellow', shape: 'dot', text: `System ${system}` });
        });
    }
    RED.nodes.registerType("nibe-weather",nibeWeather);
}
