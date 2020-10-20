'use strict';

require('console-stamp')(console, 'HH:MM:ss');
require('./modules/sun.js')

//const ewelink = require('ewelink-api');
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
            if (_k[e].indexOf('_') == 0) {
                _this.nextDevice(app, Devices, _k, e + 1, cb)
            } else {
                var device = Devices[_k[e]]

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

                const _dx = app.programs.Weather[0] ? new Date() - new Date(app.programs.Weather[0].LocalObservationDateTime) > app.Api.accuweather.time_reload : true

                if (_dx) {

                    //const _type = app._.keys(device.askToWeather)[0]

                    app.programs.Weather = {}
                    app.Api.accuweather.loadData(app, app.Api.accuweather.credentials, 'currentconditions', '', function (Weather) {
                        app.programs.Weather = Weather

                        //app.programs.functions.compute(app, 0, device, function (app) {
                        //    _this.nextDevice(app, Devices, _k, e + 1, cb)
                        //})

                    })

                }

        
            }

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
                if (app.programs.Weather != {}) {
                    app.nextDevice(app, devices, app._.keys(devices), 0, function (app) {
                        app.run(app, devices)
                    })
                } else {
                    app.run(app, devices)
                }
   
            }

        }, 1000)
    },
    programs: {
        Devices: {
            _sonoff: require('./modules/devices/_sonoff.js'),
        },
        functions: require('./modules/functions.js'),
        Sun: require('./modules/programs/sun.js'),
        EveryTime: require('./modules/programs/EveryTime.js'),
        EveryHour: require('./modules/programs/EveryHour.js')
    }
}

rail.initialize(_xdevices, function (app, devices) {

    
    app.fs.access(app.PROJECT_DIR + 'dataservice.accuweather.JSON', rail.fs.F_OK, function (err) {
        if (!err) {
            app.programs.Weather = JSON.parse(app.fs.readFileSync(app.PROJECT_DIR + 'dataservice.accuweather.JSON', 'utf8'));
        }
        app.devices(app, devices, 'init')
        app.lastminute = new Date().getMinutes()

        const _dx = app.programs.Weather[0] ? new Date() - new Date(app.programs.Weather[0].LocalObservationDateTime) > app.Api.accuweather.time_reload : true

        if (_dx) {
            //app.programs.Weather = {}
            app.Api.accuweather.loadData(app, app.Api.accuweather.credentials, 'currentconditions', '', function (Weather) {
                app.programs.Weather = Weather
                app.run(app, app.programs.Devices)
            })
        } else {
            app.run(app, app.programs.Devices)
        }

       
    })



})





