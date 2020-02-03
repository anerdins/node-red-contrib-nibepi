
module.exports = function(RED) {
    function nibeOutput(config) {
        RED.nodes.createNode(this,config);
        var timer = {};
        this.server = RED.nodes.getNode(config.server);
        const nibe = this.server.nibe;
        if (this.server) {
            
            this.on('input', function(msg) {
                let register = config.name;
            if(this.server.hP[config.name]!==undefined) {
                register = this.server.hP[config.name]
            }
            if(config.name===undefined || config.name=="") {
                register = msg.topic
                if(this.server.hP[msg.topic]!==undefined) {
                    register = this.server.hP[msg.topic]
                }
            }
                if(msg.topic=="getConfig" || config.name=="getConfig") {
                    nibe.getConfig();
                } else if(msg.topic=="setConfig" || config.name=="setConfig") {
                   nibe.setConfig(msg.payload);
                } else if(msg.topic=="addSensor" || config.name=="addSensor") {
                    nibe.addSensor(msg.payload);
                } else if(msg.topic=="removeSensor" || config.name=="removeSensor") {
                    nibe.removeSensor(msg.payload);
                } else if(msg.topic=="addRegister" || config.name=="addRegister") {
                    nibe.addRegister(msg.payload)
                } else if(msg.topic=="getRegister" || config.name=="getRegister") {
                    nibe.getRegister();
                } else if(msg.topic=="removeRegister" || config.name=="removeRegister") {
                    nibe.removeRegister(msg.payload);
                } else if(config.name===undefined || config.name=="") {
                    msg = {topic:msg.topic,payload:msg.payload};
                    this.status({ fill: 'yellow', shape: 'dot', text: `${msg.payload}` });
                    timer[register] = setTimeout(() => {
                        this.status({ fill: 'red', shape: 'dot', text: `Timeout setting data` });
                    }, 10000);
                    nibe.setData(register,msg.payload,(err,result) => {
                        if(err) return console.log(err);
                        if(result===true) {
                            if(timer[register]._called!==true) {
                                this.send({topic:msg.topic,payload:msg.payload});
                                this.status({ fill: 'green', shape: 'dot', text: `${msg.payload}` });
                                setTimeout(() => {
                                    this.status({ fill: 'yellow', shape: 'dot', text: `` });
                                }, 10000);
                                clearTimeout(timer[register]);
                            }
                        } else {
                            this.status({ fill: 'red', shape: 'dot', text: `Timeout setting data` });
                        }
                        
                    });
                } else {
                    msg = {topic:register,payload:msg.payload};
                    this.status({ fill: 'yellow', shape: 'dot', text: `${msg.payload}` });
                    timer[register] = setTimeout(() => {
                        this.status({ fill: 'red', shape: 'dot', text: `Timeout setting data` });
                    }, 10000);
                    nibe.setData(register,msg.payload,(err,result) => {
                        if(err) return console.log(err);
                        if(result===true) {
                            if(timer[register]._called!==true) {
                                this.send({topic:register,payload:msg.payload});
                                this.status({ fill: 'green', shape: 'dot', text: `${msg.payload}` });
                                setTimeout(() => {
                                    this.status({ fill: 'yellow', shape: 'dot', text: `` });
                                }, 10000);
                                clearTimeout(timer[register]);
                            }
                        } else {
                            this.status({ fill: 'red', shape: 'dot', text: `Timeout setting data` });
                        }
                        
                    });
                    
                }
            });
            
        } else {
            // No config node configured
        }
    }
    RED.nodes.registerType("nibe-output",nibeOutput);
}