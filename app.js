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
    Datastore: require('nedb'),

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
        //common: require('./modules/api/commons.js'),
        accuweather: require('./modules/api/accuweather.js'),
        ewelink_sys: require('./modules/api/ewelink.js'),
        i2c_sys: require('./modules/api/i2c.js')
    },
    run: function (app, devices) {
        setTimeout(function () {

            if (app.lastminute != new Date().getMinutes()) {
                app.io.emit('tick', { hello: new Date() });

                app.lastminute = new Date().getMinutes()
                const _dx = app.programs.Weather ? new Date() - new Date(app.programs.Weather.LocalObservationDateTime) > app.Api.accuweather.time_reload : true

                if (_dx) {

                    app.programs.Weather = {}
                    app.Api.accuweather.loadData(app, app.Api.accuweather.credentials, 'currentconditions', '', app.Datastore.db.Weather, function (Weather) {
                        app.programs.Weather = Weather

                        app.run(app, devices)
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
                    app.programs.functions.runTask(app, p, 0, function (app) {
                        app.run(app, devices)
                    })
                } else {
                    app.run(app, devices)
                }
            } else {
                const _k = app._.keys(devices)

                if (app.programs.Weather != {}) {
                    app.programs.functions.nextDevice(app, devices, _k, 0, function (app) {
                        app.run(app, devices)
                    })
                } else {
                    app.run(app, devices)
                }
            }

        }, 1000)
    },
    programs: {
        jsonData: _xdevices[0],
        Weather: { },
        Devices: {
            _sonoff: require('./modules/devices/_sonoff.js'),
            _i2c: require('./modules/devices/_i2c.js'),
        },
        functions: require('./modules/functions.js'),
        Sun: require('./modules/programs/sun.js'),
        EveryTime: require('./modules/programs/EveryTime.js'),
        EveryHour: require('./modules/programs/EveryHour.js')
    }
}

rail.initialize(_xdevices, function (app, devices) {
    app.run(app, app.programs.Devices)
})





