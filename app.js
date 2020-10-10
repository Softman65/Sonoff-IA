'use strict';

require('console-stamp')(console, 'HH:MM:ss');
require('./modules/sun.js')

const ewelink = require('ewelink-api');
const _ = require('lodash')
const READLINE = require('readline');

function clear() {
    READLINE.cursorTo(process.stdout, 0, 0);
    READLINE.clearLine(process.stdout, 0);
    READLINE.clearScreenDown(process.stdout);
}

var _xdevices = JSON.parse(require('fs').readFileSync('ewelink.json', 'utf-8'))
_xdevices.state= false,
_xdevices.counter= 0,
_xdevices._k= null


const rail = {

    _ : require('lodash'),
    fs:require('fs'),
    path: require('path'),
    http : require('http'),
    inquirer: require('inquirer'),
    mysql: require('mysql'),
    ewelink: require('ewelink-api'),
    PROJECT_DIR: __dirname + '\\',

    date: null,
    sunset: null,
    sunrise: null,
    works: [],
    mimes: require("./mimes.json"),
    staticBasePath : './http',
    initialize: require('./modules/load.js'),
    staticServe: require('./modules/staticServer.js'),
    devices: require('./modules/devices.js') ,
    Api: {
        accuweather: require('./modules/api/accuweather.js'),
        ewelink_sys: require('./modules/api/ewelink.js'),
    },
    nextDevice : function (app, Devices, _k, e, cb) {
        var _this = this
        if (e < _k.length) {
            var device = Devices[_k[e]]
            const _dx = app.programs.Weather ? new Date() - new Date(app.programs.Weather[0].LocalObservationDateTime) > app.Api.accuweather.time_reload : true
    
            if (device.askToAccuweather && _dx ) {

                app.programs.Weather = {}
                app.Api.accuweather.loadData(app, device.askToAccuweather, 'currentconditions', '', function (Weather) {
                    app.programs.Weather = Weather

                    app.programs.functions.compute(app , 0, device, function (app) {
                        _this.nextDevice(app, Devices, _k, e + 1, cb)
                    })

                })
            } else {
                app.programs.functions.compute(app, 0, device, function (app) {
                    _this.nextDevice(app, Devices, _k, e + 1, cb)
                })
            }

        } else {
            cb(app)
        }
    },
    runTask: function (app, arrayTask, e ,cb) {
        if (e < arrayTask.length) {
            const _k = app._.keys(arrayTask[e])[0]
            //if (arrayTask[e].ewelink)
            app.Api[_k].set(app, arrayTask[e][_k][0], arrayTask[e][_k][1], arrayTask[e][_k][2], function (status) {
                app.runTask(app, arrayTask, e + 1, cb)
            })
        } else {
            cb(app)
        }
    },
    run: function (app, devices) {
        setTimeout(function () {
            if (app.lastminute != new Date().getMinutes()) {

                app.lastminute = new Date().getMinutes()
                //console.log('esperando programa dentro de ' + device.params.Hour + (device.params.lapso == 'H' ? ' horas' : ' minutos'))

                app.commonSQL.db.query('SELECT 1', function (err, record) {
                    if (err)
                        debugger
                })
        
            }
            //clear()
            if (app.works.length > 0) {
                const p = app.works[0]
                app.works = _.drop(app.works)
                process.stdout.write('.')

                if (!app._.isArray(p))
                    debugger

                if (p.length > 0) {
                    app.runTask(app, p, 0, function (app) {
                        app.run(app, devices)
                    })



                } else {
                    app.run(app, devices)
                }
            } else {

                //app.programs.Weather = null
                app.nextDevice(app, devices, app._.keys(devices), 0, function (app) {
                    app.run(app, devices)
                })
   
            }

        }, 1000)
    },
    programs: {
        Devices: {},
        functions: {
            WeatherTask: function (app, _this, program, _params, _cb) {

                const _push = function (app, _system, arrWorks, program, _out, _params, IA, _cb) {
                    _system.push(app, _system, arrWorks, program, _out, function (actionsDevice) {
                        _cb(IA)
                    })
                }

                const IA = _this.functions.testWeather(_this.Weather[0], _params)
                if (IA._response) {
                    _push(app, app.Api.ewelink_sys, app.works, program, [], _params, IA, _cb)
                } else {
                    _cb(IA)
                }
            },
            askToWeather: function (app, _this, program, _params, _cb) {
                //rail.Api.accuweather.loadData(rail, 'currentconditions', '', function (Weather) {            
                //    if (Weather[0]) {
                ////         rail.Weather = Weather[0]
                const _push = function (app, _system, arrWorks, program, _out, _params, IA, _cb) {
                    _system.push(app, _system, arrWorks, program, _out, function (actionsDevice) {
                        if (_params.lastTask) {
                            fn_task(fn_task, _params.lastTask, 0, arrWorks, function () {
                                _cb(IA)
                            })
                        } else {
                            _cb(IA)
                        }
                    })
                }
                const fn_task = function (_f, tasks, e, arrWorks, cb) {

                    if (e < tasks.length) {
                        var task = tasks[e]
                        app.Api[task.command][task.action](app, app.Api[task.command], arrWorks, task.params.deviceId, task.params.relay, task.params.action, function () {
                            _f(_f, tasks, e + 1, app.works, cb)
                        })
                    } else {
                        cb()
                    }

                }


                //var arrOut = []
                const IA = _this.functions.testWeather(_this.Weather[0], _params)
                if (IA._response) {

                    if (_params.previusTask) {
                        fn_task(fn_task, _params.previusTask, 0, app.works, function () {
                            _push(app, app.Api.ewelink_sys, app.works, program, [], _params, IA, _cb)

                        })
                    } else {
                        _push(app, app.Api.ewelink_sys, app.works, program, [], _params, IA, _cb)
                    }
                } else {
                    _cb(IA)
                }
                //} else {
                //    console.log('sobrepasado el limite de llamadas a API accuweather')
                //    _cb()
                //}

                //})
            },
            testWeather: function (Weather, params) {
                const _d = ['D', 'L', 'M', 'X', 'J', 'V', 'S']
                const weekday = _d[new Date().getDay()]
                const conditions = params.conditions.weekdays[params.conditions.weekdays.everyDays ? 'everyDays' : weekday]
                const _k = params.EveryTime.periodo == 1 ? 'PastHour' : 'Past' + params.EveryTime.periodo + 'Hour' + (params.EveryTime.periodo > 1 ? 's' : '')

                var _ret = false
                var _retString = {
                    IsDayTime: null,
                    IsNigthTime: null,
                    rain: null,
                    ApparentTemperature: null
                }
                if (conditions) {
                    if (conditions.IsDayTime) {
                        if (Weather.IsDayTime) {
                            _ret = conditions.IsDayTime.day
                            _retString.IsDayTime = _ret ? 'Ok es de DIA' : 'riego de DIA no activado'
                        } else {
                            _ret = conditions.IsDayTime.night
                            _retString.IsNigthTime = _ret ? 'Ok es de NOCHE' : 'riego de NOCHE no activado'
                        }
                    }
                    if (_ret) {
                        if (conditions.rain) {
                            if (!Weather.HasPrecipitation) {
                                _ret = Weather.PrecipitationSummary[_k].Metric.Value < conditions.rain || Weather.PrecipitationSummary[_k].Metric.Unit != 'mm'
                                _retString.rain = (_ret ? 'OK ' : 'NO ') + ('en ' + _k + ':' + Weather.PrecipitationSummary[_k].Metric.Value + ' ' + Weather.PrecipitationSummary[_k].Metric.Unit + ' -> conditions <' + conditions.rain)

                            } else {
                                _ret = false
                                _retString.rain = 'está ' + Weather.PrecipitationType
                            }
                        }
                        if (conditions.ApparentTemperature) {
                            const _c = Weather.ApparentTemperature.Metric.Value > conditions.ApparentTemperature
                            _retString.ApparentTemperature = (_c ? 'OK ' : 'NO ') + (Weather.ApparentTemperature.Metric.Value + 'ºC ' + ' -> conditions >' + conditions.ApparentTemperature)
                            _ret = _ret && _c

                        }
                    }
                }
                return { _r: _retString, _response: _ret, _w: Weather }
            },
            compute: function (app, n_relay, device, _cb) {
                var relays = device.relays
                if (!relays)
                    debugger

                if (n_relay < relays.length) {
                    const _this = app.programs
                    const _relay = relays[n_relay]
                    _relay.task = device.task
                    if (_relay.T == (_relay.params.EveryTime.lapso == 'H' ? new Date().getHours() : new Date().getMinutes())) {
                        _this[_relay.program].start(app, _this, _relay, function (IA_response) {
                            if (IA_response) {
                                rail.commonSQL.procSQL('saveData(?,?,?)', [JSON.stringify(IA_response._w), JSON.stringify(IA_response._r), IA_response._response], function (err, record) {
                                    console.log('save data mysql ' + (err ? 'FAIL' : 'Ok'))
                                    _this.functions.compute(app, _relay.e, device, _cb)
                                })
                            } else {
                                debugger
                            }
                        })
                    } else {
                        _this.functions.compute(app, _relay.e, device, _cb)
                    }
                } else {
                    _cb(app)
                }
            }
        },
        Sun: require('./modules/programs/sun.js'),
        EveryTime: require('./modules/programs/EveryTime.js'),
        EveryHour: require('./modules/programs/EveryHour.js')
    }
}

rail.initialize(_xdevices, function (app, devices) {

    app.Api.ewelink_sys.connection = new app.ewelink(devices.ewelink)
    app.fs.access(app.PROJECT_DIR + 'dataservice.accuweather.JSON', rail.fs.F_OK, function (err) {
        if (!err) {
            app.programs.Weather = JSON.parse(app.fs.readFileSync(app.PROJECT_DIR + 'dataservice.accuweather.JSON', 'utf8'));
        }
        app.devices(app, devices, 'init')
        app.run(app, app.programs.Devices )
    })



})

/*
rail.fs.access('./dataservice.accuweather.JSON', rail.fs.F_OK, function (err) { 
    if (!err) {
        rail.Weather = JSON.parse(rail.fs.readFileSync('./dataservice.accuweather.JSON', 'utf8'));

    } else {
        rail.Api.accuweather.loadData(rail, 'currentconditions', '', function (Weather) {
            rail.initialize(_xdevices)
        })
    }

})
*/



