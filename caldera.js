const colors = require('colors')
const program = {
    WEBPORT:8090,
    moment:require('moment'),
    path: require('path'),
    http: require('http'),
    fs: require('fs'),
    SerialPort: require('serialport'),
    ejs: require('ejs'),
    staticServe: require('./modules/staticServer.js'),
    staticBasePath: './http',
    mimes: require("./mimes.json"),
    views: { },
    programs: {
        Devices: {
            "0x10": {
                relays: [
                    { state: false },
                    { state: false },
                    { state: false },
                    { state: false }]
            }
        },
        _values: {
            _E: {
                acs: false,
                cal: false
            },
            _T: {
                acs: 0,
                cal: 0,
                amb: 0
            },
            _R: {
                acs: 0,
                circula: 0,
                quemador: 0
            }
        }
    },
    api: {
        i2c: function (app, deviceid, n, op, cb) {
            const opt = op == '0x00' ? false : true
            const cmd = "i2cset -y 1 " + deviceid + ' ' + n + ' ' + op
            const { exec } = require("child_process");
            exec(cmd, (error, stdout, stderr) => {
                if (error) {
                    app.programs.Devices[deviceid].relays[n - 1].state = 'error'
                    //console.log(`error: ${error.message}`);
                    //cb(status);
                } else {
                    //console.log(deviceid, op, n, opt)
                    app.programs.Devices[deviceid].relays[n - 1].state = opt

                }
                if(cb)
                    cb(app.programs.Devices[deviceid].relays[n - 1].state)
            });
        }
    },
    caldera: function (app) {
        return {

            file: './caldera.json',
            values: function () {
                const defaults = {
                    antiHielo:true,
                    estado:1,
                    acs: {
                        sonda: '28-xxxxxxxxxx',
                        relay: {
                            on: { relay: { n: 3, s: 1 } },
                            off: { relay: { n: 3, s: 0 } }
                        },
                        invierno: { T_max: 20 },
                        verano: { T_max: 10 }
                    },
                    calefaccion: {
                        sonda: '28-yyyyyyyyyy',
                        invierno: {
                            T_max: 20, T_off: 30,
                            programs: {
                                'D': 0,
                                'L': 0,
                                'M': 0,
                                'X': [
                                    [1, 0, 1, 0], [1, 0, 1, 0], [1, 0, 1, 0], [1, 0, 1, 0], [1, 0, 1, 0], [1, 0, 1, 0],   // 0:00 to  5:45
                                    [1, 0, 1, 0], [1, 0, 1, 0], [1, 0, 1, 0], [1, 0, 1, 0], [1, 0, 1, 0], [1, 0, 1, 0],   // 6:00 to 11:45
                                    [1, 0, 1, 0], [1, 0, 1, 0], [1, 0, 1, 0], [1, 0, 1, 0], [1, 0, 1, 0], [1, 0, 1, 0],   //12:00 to 17:45
                                    [1, 0, 1, 0], [1, 0, 1, 0], [1, 0, 1, 0], [1, 0, 1, 0], [1, 0, 1, 0], [1, 0, 1, 0]   //18:00 to 23:45
                                ],
                                'J': 0, 'V': 0, 'S': 0
                            }
                        },
                        verano: {
                            T_max: 0
                        },
                        
                    },
                    quemador: {
                        relay: {
                            on: { relay: { n: 1, s: 1 } },
                            off: { relay: { n: 1, s: 0 } }
                        }
                    },
                    circula: {
                        relay: {
                            on: { relay: { n: 2, s: 1 } },
                            off: { relay: { n: 2, s: 0 } }
                        }
                    },
                    relay: {
                        type: 'i2c',
                        addres: '0x10'
                    }
                }
                if (!app.fs.existsSync(this.file))
                    app.fs.writeFileSync(this.file, JSON.stringify(defaults))

                return JSON.parse(app.fs.readFileSync(this.file))
            },
            acs: function (_val, _estacion) {
               // app.programs._values._T.acs = this.functions.lee_sonda(_val.sonda, app.programs._values._T.acs, _val[_estacion].T_max)
                return (app.programs._values._T.acs >= (_val[_estacion].T_max ) )

                //return (app.programs._values._T.acs = this.functions.lee_sonda(_val.sonda, app.programs._values._T.acs, _val[_estacion].T_max)) < (_val[_estacion].T_max - 3)
            },
            
            inTime: function (_values) {
                var ok = false
                const dayweek = ['D','L','M','X','J','V','S','D']
                const _now = new Date()
                const _h = _now.getHours()
                const _q = _now.getMinutes() / 15
                const _d = dayweek[_now.getDay()]

                if (Array.isArray(_values)) {
                    return _values[_h][Math.trunc(_q)] == 1
                } else {
                    if ((Array.isArray(_values[_d]))) {
                        return _values[_d][_h][Math.trunc(_q)] == 1
                    } else {
                        return false
                    }
                }


               // return ok

            },
            calefaccion: function (_val, _estacion) {
                //app.programs._values._T.cal = this.functions.lee_sonda(_val.sonda, app.programs._values._T.cal, _val[_estacion].T_max)

                    return (app.programs._values._T.cal >= (_val[_estacion].T_max))
                
            },
            init: function (cb) {
                const _this = this
                function IsJsonString(str) {
                    try {
                        var json = JSON.parse(str);
                        return (typeof json === 'object');
                    } catch (e) {
                        return false;
                    }
                }
                app.SerialPort.list().then(function (ports) {
                    ports.forEach(function (port) {
                        console.log("Port: ", port);
                        if (port.serialNumber == '7543931373735160F130') {
                            _this.port = new app.SerialPort(port.path, {
                                autoOpen: false,
                                baudRate: 9600
                            })

                            _this.port.open(function (err) {
                                if (err) {
                                    return console.log('Error opening port: ', err.message);
                                }

                                // write errors will be emitted on the port since there is no callback to write
                                //_this.port.write('t');
                                
                            });

                            // the open event will always be emitted
                            _this.port.on('open', function () {
                                // open logic
                                //debugger
                                
                                let Readline = app.SerialPort.parsers.Readline
                                let parser = new Readline();
                                _this.port.pipe(parser)

                                parser.on('data', function (data) {
                                    // get buffered data and parse it to an utf-8 string
                                    data = data.toString('utf-8');
                                    //console.log(data)
                                    if (IsJsonString(data))
                                        _this.go(JSON.parse(data))
                                    // you could for example, send this data now to the the client via socket.io
                                    // io.emit('emit_data', data);
                                });

                                cb(_this)
                            });
                        }
                    })
                });
            },
         //   program: function () {

                //this.port.write('t\n')
               // console.log('read sonda')
        //    },
            go: function (data) {
                //console.log('data received' , data)
                const _estacion = app.moment().isDST() ? 'verano' : 'invierno'
                const _params = this.values()
                const _relay = _params.relay

                //var _t_cal = this.functions.lee_sonda(_params.sonda, app.programs._values._T.cal, _params.calefaccion[_estacion].T_max)
                //var _t_acs = this.functions.lee_sonda(_params.sonda, app.programs._values._T.acs, _params.acs[_estacion].T_max)


                var _t_old = {
                    acs: app.programs._values._T.acs,
                    cal: app.programs._values._T.cal
                }

                app.programs._values._T.amb = data.amb
                var _t_acs = app.programs._values._T.acs = data.acs
                var _t_cal = app.programs._values._T.cal = data.amb

                var _r = {
                    acs: app.programs._values._E.acs,
                    cal: app.programs._values._E.cal
                }
                var _d = {
                    acs: this.functions.dif(_t_old.acs, _params.acs[_estacion].T_max),
                    cal: this.functions.dif(_t_old.cal, _params.calefaccion[_estacion].T_max)
                }

                if (_params.antiHielo && !app.moment().isDST() && _t_cal<=5) {
                    app.programs._values._T.cal = _t_cal

                    this.functions.set.acs(_relay, _params, app.programs._values, 'OFF', 'cal')
                    this.functions.set.quemador(_relay, _params, app.programs._values, 'ON')
                    this.functions.set.circula(_relay, _params, app.programs._values, 'ON')
                    console.log(('WARNING ' + app.programs._values._T.cal + 'c ANTIHIELO').red, app.programs._values._T, app.programs._values._R)
   
                } else {

                    if (_params.acs[_estacion].T_max > 0) {

                        const _acs = !this.acs(_params.acs, _estacion)


                        if (_acs && !app.programs._values._E.acs) {
                            this.functions.set.acs(_relay, _params, app.programs._values, 'ON', 'acs')
                            this.functions.set.quemador(_relay, _params, app.programs._values, 'ON')
                            this.functions.set.circula(_relay, _params, app.programs._values, 'ON')
                            console.log((' ' + app.programs._values._T.acs + 'c ACS').cyan, app.programs._values._T, app.programs._values._R)
                        } else {
                            if (!app.programs._values._E.acs) {
                                app.programs._values._E.acs = true
                            } else {
                                if (_d.acs > 5) {
                                    app.programs._values._E.acs = false
                                    //return
                                } //else {
                                  //  app.programs._values._T.acs = app.programs._values._T.acs -1.1
                                //}
                            }

                            if (_params.calefaccion[_estacion].T_max > 0 && app.programs._values._E.acs) {
                                const _calefaccion = !this.calefaccion(_params.calefaccion, _estacion)
                                const inProgram = _params.calefaccion[_estacion].programs ? this.inTime(_params.calefaccion[_estacion].programs) : null

                                this.functions.set.acs(_relay, _params, app.programs._values, 'OFF')
                                if (_params.calefaccion[_estacion].T_off <= app.programs._values._T.cal) {
                                    this.functions.set.quemador(_relay, _params, app.programs._values, 'OFF')
                                    this.functions.set.circula(_relay, _params, app.programs._values, 'OFF')
                                    console.log((' ' + app.programs._values._T.cal + 'c STANDBY').white, app.programs._values._T, app.programs._values._R)
                                } else {
                                    if (inProgram == null || inProgram) {
                                        if (_calefaccion && !app.programs._values._E.cal) {
                                            this.functions.set.quemador(_relay, _params, app.programs._values, 'ON')
                                            this.functions.set.circula(_relay, _params, app.programs._values, 'ON')
                                            console.log((' ' + app.programs._values._T.cal + 'c CALEFACCION').magenta, app.programs._values._T, app.programs._values._R)
                                            //app.programs._values._T.acs = app.programs._values._T.acs //- (1)
                                        } else {
                                            this.functions.set.quemador(_relay, _params, app.programs._values, 'OFF')

                                            if (!app.programs._values._E.cal) {
                                                app.programs._values._E.cal = true
                                                //return
                                            } else {
                                                if (_d.cal > 5) {
                                                    app.programs._values._E.cal = false
                                                } else {
                                                    //app.programs._values._T.cal = app.programs._values._T.cal - 1.1
                                                    this.functions.set.circula(_relay, _params, app.programs._values, 'ON')
                                                    console.log('CIRCULA CALEFACCION', app.programs._values._T, app.programs._values._R)
                                                }
                                            }
                                        }
                                    } else {
                                        this.functions.set.quemador(_relay, _params, app.programs._values, 'OFF')
                                        this.functions.set.circula(_relay, _params, app.programs._values, 'OFF')
                                        console.log('OFF DATE-TIME PROGRAM', app.programs._values._T, app.programs._values._R)
                                    }
                                }
                            }
                        }

                        
                    }
                }
                //console.log(app.programs._values)
                //app.run(app)
            },
            functions:  {
                dif: function (old_T, new_T) {
                    return  new_T - old_T
                },
                set: {
                    _v: [ 'OFF', 'ON'],
                    _s: function (_relay, _params,_val,_value,_type,_T) {
                        if (_val != this._v.indexOf(_value)) {
                            _val = this._v.indexOf(_value)
                        }
                         this.relay(_relay, _params.relay[_value.toLowerCase()].relay, _type, _T)
                        return _val
                    },
                    acs: function (_relay,_params, _values, _value,_temp) {
                        return _values._R.acs = this._s(_relay, _params.acs, _values._R.acs, _value, 'acs', _values._T[_temp])
                    },
                    quemador: function (_relay,_params, _values, _value) {
                        return _values._R.quemador = this._s(_relay, _params.quemador, _values._R.quemador, _value, 'quemador')
                    },
                    circula: function (_relay,_params, _values, _value) {
                        return _values._R.circula = this._s(_relay, _params.circula, _values._R.circula, _value, 'circula')
                    },
                    relay: function (_relay, _dataRelay, _type, _T) {

                        app.api[_relay.type](app, _relay.addres, _dataRelay.n, _dataRelay.s)

                    //relay: function (_relay, _dataRelay, _T, _type) {

                        //var _tx = ''
                        //if (_T>=0)
                        //    _tx = _T + ''

                        //console.log(_relay, _tx + ' ºc', _type + ' ' + ['OFF', 'ON'][_dataRelay.s])
                    }
                },
                lee_sonda: function (sonda, t , max) {
                    if (max > t) {
                        return t + 1
                    } else {
                        return t
                    }
                }
            }
        }
    },
    run: function (app) {
        setTimeout(function () {
            app._caldera.program()           
        }, 1000)
    },
    init: function (app) {

        app.httpServer = app.http.createServer(app.staticServe(app).staticServer);
        app.io = require('socket.io').listen(app.httpServer);
        app.views.path = app.path.resolve(app.staticBasePath + '/views/index')

         app.caldera(app).init(function (_caldera) {
             app._caldera = _caldera
             app.httpServer.listen(app.WEBPORT);
             //app.run(app)
        })
    }
    
}

program.init(program)



