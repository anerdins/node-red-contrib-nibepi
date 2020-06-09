
module.exports = function(RED) {
    function nibeInput(config) {
        RED.nodes.createNode(this,config);
        const server = RED.nodes.getNode(config.server);
        const nibe = server.nibe;
        var savedError = {};
        if(config.add===true && config.name.toLowerCase()!="config" && config.name.toLowerCase()!="error") {
            nibe.addRegister(config.name);
        }
        let register = config.name.toLowerCase();
        if(server.hP()[config.name]!==undefined) {
            register = server.hP()[config.name]
        }
        server.nibeData.on('ready', data => {
            if(server.hP()[config.name]!==undefined) {
                register = server.hP()[config.name]
            }
        })
        var node = this;
        if(config.name=="") {
            server.nibeData.on('data', data => {
                let saved = node.context().get(data.register);
                if(data.error!==undefined) {
                    
                } else {
                    if(saved!=data.data) {
                        node.send([{topic:data.register,payload:data.data},{topic:data.register,payload:data.data,raw:data}]);
                        node.context().set(data.register, data.data);
                        node.status({ fill: 'green', shape: 'dot', text: `${data.register}: ${data.data} ${data.unit}` });
                    } else {
                        node.send([null,{topic:data.register,payload:data.data,raw:data}]);
                    }
                }
        })
    } else if(config.name.toLowerCase()=="error") {
        server.nibeData.on('fault', data => {
            if(savedError.from!==data.from || savedError.message!==data.message) {
                node.send({topic:data.from,payload:data.message});
                savedError = data;
            }
            node.send([null,{topic:data.from,payload:data.message}]);
        })
    } else {
        server.nibeData.on(register, data => {
            if(register===data.register) {
                let saved = node.context().get(data.register);
                if(data.error!==undefined) {
                    
                } else {
                    if(saved!=data.data) {
                        node.send([{topic:data.register,payload:data.data,raw:data},{topic:data.register,payload:data.data,raw:data}]);
                        node.context().set(data.register, data.data);
                        node.status({ fill: 'green', shape: 'dot', text: `${data.data}${data.unit}` });
                    } else {
                        node.send([null,{topic:data.register,payload:data.data,raw:data}]);
                    }
                }

            }
        })
    }
        /*nibe.data.on(register, data => {
                node.status({ fill: 'red', shape: 'dot', text: data });
        })*/
    if(config.name.toLowerCase()=="config") {
        server.nibeData.on('config', data => {
            node.send([{topic:"config",payload:data},null]);
        })
        server.nibe.getConfig();
    }
    }
    RED.nodes.registerType("nibe-input",nibeInput);
}