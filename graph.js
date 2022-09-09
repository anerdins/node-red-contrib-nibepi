
module.exports = function(RED) {
    function nibeGraph(config) {
        RED.nodes.createNode(this,config);
        const server = RED.nodes.getNode(config.server);
        let node = this;
        let timeFrame;
        let translate = server.translate.dash;
        function buildGraph(arr) {
            let timeNow = Date.now();
            if(timeFrame===undefined) timeFrame = (24*60*60*1000);
            let timeCut = timeNow-timeFrame;
            let savedData = server.savedData();
            //let savedGraph = Object.assign({}, ...server.savedGraph())
            let savedGraph = server.savedGraph();
            var array = [
                {
                "series":[],
                "data":[]
            }];
            for( var i = 0; i < arr.length; i++){
                let name;
                    if(arr[i].name!==undefined && arr[i].name!=="") {
                        name = arr[i].name;
                    } else {
                        if(savedData[arr[i].register]!==undefined) {
                        name = savedData[arr[i].register].titel;
                        }
                    }
                    if(name!==undefined) {
                        let index = array[0].series.findIndex(n => n == name);
                        if(index===-1) {
                            if(savedGraph[arr[i].register]!==undefined && savedGraph[arr[i].register].length!==0) {
                                if(arr[i].chart==="pie") {
                                    timeCut = timeNow-(timeFrame*24);
                                }
                                let cut = savedGraph[arr[i].register].findIndex(n => n.x >= timeCut);
                                if(cut!==-1) {
                                    let newArr = savedGraph[arr[i].register].slice(cut,savedGraph[arr[i].register].length);
                                    if(newArr.length!==0) {
                                        if(newArr[0].x!==timeCut) {
                                            newArr.unshift({x:timeCut,y:newArr[0].y})
                                        }
                                    }
                                    if(newArr.length!==0) {
                                        if(arr[i].chart==="pie") {
                                            let value = 0;
                                            for( var j = 0; j < newArr.length; j++){
                                                value = value+newArr[j].y;
                                            }
                                            //array[0].series.push(name);
                                            if(array[0].series.length===0) array[0].series.push("")
                                            if(array[0].labels===undefined) array[0].labels = [];
                                            array[0].labels.push(name);
                                            if(array[0].data.length===0) {
                                                array[0].data.push([Math.round(value/newArr.length)])
                                            } else if(array[0].data.length===1) {
                                                array[0].data[0].push(Math.round(value/newArr.length))
                                            }
                                        } else {
                                            array[0].series.push(name);
                                            array[0].data.push(newArr);
                                        }
                                        
                                    }
                                }
                            }
                        }
                    }
            }
            if(array[0].series.length!==0) {
                return array;
            } else {
                return [];
            }
        }
        function updateData() {
            let systems = server.systems();
            let conf = server.config;
            if(conf.data===undefined || conf.data.graph===undefined) {
                conf.data = {graph:[]};
                server.nibe.setConfig(conf)
            }
            if(config.select=="datagraph") {
                let arr = [];
                for( var i = 0; i < conf.data.graph.length; i++){
                    arr.push({register:conf.data.graph[i]});
                }
                node.send({graph:"datagraph",payload:buildGraph(arr)});
            } else if(config.select=="start_1") {
                let arr = buildGraph(
                    [
                        {name:"Utomhustemperatur",register:server.hP()['outside']},
                        {name:"Inomhustemperatur",register:server.hP()['inside']},
                        {name:"Kurvjustering S1",register:server.hP()['curveadjust_s1']},
                        {name:"Börvärde S1",register:server.hP()['setpoint_s1']},
                        {name:"Framledning S1",register:server.hP()['supply_s1']}
                    ]
                );
                if(systems!==undefined && systems.s2===true) {
                    arr.push({name:"Kurvjustering S2",register:server.hP()['curveadjust_s2']});
                    arr.push({name:"Börvärde S2",register:server.hP()['setpoint_s2']});
                    arr.push({name:"Framledning S2",register:server.hP()['supply_s2']});
                }
                node.send({graph:"start_1",payload:arr});
            } else if(config.select=="forecast_1") {
                let arr = [
                    {name:"Utomhustemperatur",register:server.hP()['outside']},
                    {name:"Inomhustemperatur",register:['weather_sensor_'+config.system]},
                    {name:"Kurvjustering",register:['weather_offset_'+config.system]},
                    {name:"Prognos",register:['weather_forecast_'+config.system]},
                    {name:"Ojusterad Prognos",register:['weather_unfilterd_'+config.system]}
                ]
                node.send({graph:config.select,payload:buildGraph(arr)});
            } else if(config.select=="indoor_1") {
                let arr = [
                    {name:"Utomhustemperatur",register:server.hP()['outside']},
                    {name:"Inomhustemperatur",register:['indoor_sensor_'+config.system]},
                    {name:"Inomhusbörvärde",register:server.hP()['inside_set_'+config.system]}
                ]
                if(conf.indoor['enable_'+config.system]===true) {
                    arr.push({name:"Kurvjustering",register:['indoor_offset_'+config.system]});
                }
                node.send({graph:config.select,payload:buildGraph(arr)});
            } else if(config.select=="diagnostic_defrost") {
                if(conf.system.pump!==undefined && (conf.system.pump=="F730" || conf.system.pump=="F750")) {
                    let arr = [
                        {name:"Gångtid (m)",register:"cpr_runtime"},
                        {name:"Avfrostningstid (m)",register:"defrosting"}
                    ]
                    node.send({graph:config.select,enabled:true,payload:buildGraph(arr)});
                } else {
                    node.send({graph:config.select,enabled:false});
                }
            } else if(config.select=="efficiency_graph") {
                if(conf.system.pump!==undefined && (conf.system.pump=="F730" || conf.system.pump=="F750")) {
                    let arr = [
                        {name:"Gångtid (%)",register:"cpr_uptime",chart:"pie"},
                        {name:"Avfrostningstid (%)",register:"cpr_downtime",chart:"pie"}
                    ]
                    let result = buildGraph(arr);
                    if(result[0]===undefined) return;
                    let cpr_efficiency = result[0].data[0][0];
                        if(100-cpr_efficiency>50) {
                            node.send([null,{topic:"Resultat",payload:`Värmepumpens effektivitet är mycket dålig, långa avfrostningstider.<br>
                            Trolig orsak är felaktigt placerad avluftsgivare eller igensatt filter med nedsmutsning av förångare.<br>
                            Kompressorn har en effektivitet på endast ${cpr_efficiency} % och hela ${100-cpr_efficiency} % avfrostningstid.<br>`}])
                        } else if(100-cpr_efficiency>35) {
                            node.send([null,{topic:"Resultat",payload:`Värmepumpens effektivitet är dålig, långa avfrostningstider.<br>
                            Trolig orsak är felaktigt placerad avluftsgivare eller igensatt filter med nedsmutsning av förångare.<br>
                            Kompressorn har en effektivitet på ${cpr_efficiency} % och ${100-cpr_efficiency} % avfrostningstid.<br>`}])
                        } else if(100-cpr_efficiency>25) {
                            node.send([null,{topic:"Resultat",payload:`Värmepumpens effektivitet är är bra men kunde vara bättre.<br>
                            Kontrollera luftfilter.<br>
                            Kompressorn har en effektivitet på ${cpr_efficiency} % och ${100-cpr_efficiency} % avfrostningstid.<br>`}])
                        } else {
                            node.send([null,{topic:"Resultat",payload:`Värmepumpens effektivitet är mycket bra.<br>
                            Kompressorn har en effektivitet på ${cpr_efficiency} % och endast ${100-cpr_efficiency} % avfrostningstid.<br>`}])
                        }
                    node.send({graph:config.select,enabled:true,payload:result});
                    node.send({graph:config.select,enabled:true,payload:result});
                } else {
                    node.send({graph:config.select,enabled:false});
                }
            } else if(config.select=="fan_1") {
                let arr = [
                    {name:"Fläkthastighet",register:server.hP()['fan_speed']},
                    {name:"Luftflöde",register:server.hP()['bs1_flow']},
                    {name:"Luftflöde Börvärde",register:['fan_setpoint']},
                    {name:"Kompressorfrekvens",register:server.hP()['cpr_act']},
                    {name:"Förångartemperatur",register:server.hP()['evaporator']}
                ]
                if(conf.fan.enable_co2===true) {
                    arr.push({name:"CO2",register:['fan_co2Sensor']});
                    arr.push({name:"CO2 Gränsvärde för sänkt flöde",register:['fan_low_co2_limit']});
                    arr.push({name:"CO2 Gränsvärde för ökat flöde",register:['fan_high_co2_limit']});
                }
                if(conf.fan.enable_filter===true) {
                    arr.push({name:"Filtereffektivitet",register:['filter_eff']});
                }
                node.send({graph:config.select,payload:buildGraph(arr)});
            } else if(config.select=="hw_lux") {
                let arr = [
                    {name:"BT7 Topp",register:server.hP()['bt7']},
                    {name:"BT6 Laddning",register:server.hP()['bt6']},
                    {name:"Startvärde",register:'hw_trigger_temp'}
                ]
                arr.push({name:"Stoppvärde",register:'hw_target_temp'});
                node.send({graph:config.select,payload:buildGraph(arr)});
            } else if(config.select=="hw_prio") {
                let arr = [
                    {name:"BT7 Topp",register:server.hP()['bt7']},
                    {name:"BT6 Laddning",register:server.hP()['bt6']},
                    {name:"Startvärde",register:'hw_start_temp'},
                    {name:"Stoppvärde",register:'hw_stop_temp'}
                ]
                node.send({graph:config.select,payload:buildGraph(arr)});
            } else if(config.select=="registers_selected") {
                node.status({ fill: 'green', shape: 'dot', text: `Selected registerlist` });
                let list = buildRegisterList();
                if(list.length>0) {
                    node.send({payload:list});
                }
            }
        }
        node.on('input', function(msg) {
            if(msg.topic=="update") {
                updateData();
            } else if(msg.topic=="time") {
                timeFrame = msg.payload*60*60*1000;
                updateData();
            }
            
        });
        server.nibeData.on('updateGraph', () => {
            updateData();
        });
        server.nibeData.on(this.id, (data) => {
            if(data.changed===true) {
                config.system = data.system;
            }
        })
        function buildRegisterList() {
            let conf = server.config;
            let savedData = server.savedData();
            var list = [];
            let icons = {
                "":"fa-bars",
                "°C":"fa-thermometer-three-quarters",
                "A":"fa-flash",
                "Hz":"fa-bar-chart",
                "min":"fa-clock-o",
                "h":"fa-clock-o",
                "m":"fa-clock-o",
                "kWh":"fa-area-chart",
                "W":"fa-flash",
                "l/m":"fa-leaf",
                "%RH":"fa-cloud",
                "%":"fa-percent"
            }
            for( var n = 0; n < conf.registers.length; n++){
                if(savedData[conf.registers[n]]!==undefined) {
                    let register = {};
                    register.title = `${savedData[conf.registers[n]].register}, ${savedData[conf.registers[n]].titel}`;
                    register.description = `${savedData[conf.registers[n]].data} ${savedData[conf.registers[n]].unit}`;
                    register.register = savedData[conf.registers[n]].register;
                    register.icon_name = icons[savedData[conf.registers[n]].unit];
                    if(conf.data!==undefined && conf.data.graph!==undefined) {
                        let index = conf.data.graph.findIndex(i => i == savedData[conf.registers[n]].register);
                        if(index!==-1) {
                            register.isChecked = true;
                        } else {
                            register.isChecked = false;
                        }
                    }
                    
                    if(savedData[conf.registers[n]].register=="45001") register.icon_name = "fa-warning";
                    if(savedData[conf.registers[n]].register=="10001") register.icon_name = "fa-warning";
                    list.push(register);
                }        
            }
            list.sort((a, b) => (a.register > b.register) ? 1 : -1)
            function customGraph(name1) {
                if(savedData[name1]!==undefined) {
                    let register = {};
                    register.title = `${savedData[name1].titel}, ${savedData[name1].info}`;
                    register.description = `${savedData[name1].data} ${savedData[name1].unit}`;
                    register.register = savedData[name1].register;
                    register.icon_name = savedData[name1].icon_name
                    if(conf.data!==undefined && conf.data.graph!==undefined) {
                        let index = conf.data.graph.findIndex(i => i == savedData[name1].register);
                        if(index!==-1) {
                            register.isChecked = true;
                        } else {
                            register.isChecked = false;
                        }
                    }
                    return register
                } else {
                    return;
                }
            }
            if(customGraph('electric_price')!==undefined) list.unshift(customGraph('electric_price'));
            if(customGraph('curveadjust')!==undefined) list.unshift(customGraph('curveadjust'));
            return(list)
        }
        node.on('close', function() {
            let system = config.system.replace('s','S');
            server.nibeData.removeAllListeners();
            node.status({ fill: 'yellow', shape: 'dot', text: `` });
        });
    }
    RED.nodes.registerType("nibe-graph",nibeGraph);
}