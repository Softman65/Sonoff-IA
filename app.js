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
    unloadTask:[],
    mimes: require("./mimes.json"),
    staticBasePath : './http',
    initialize: require('./modules/load.js'),
    staticServe: require('./modules/staticServer.js'),
    devices: require('./modules/devices.js'),
    unload: require('unload'),
    Api: {
        //common: require('./modules/api/commons.js'),
        accuweather: require('./modules/api/accuweather.js'),
        ewelink_sys: require('./modules/api/ewelink.js'),
        i2c_sys: require('./modules/api/i2c.js')
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
    },
    run: function (app, devices) {
        //app._k = app._.keys(devices)
        setInterval(function () {

            if (app.lastminute != new Date().getMinutes()) {
                app.io.emit('tick', { hello: new Date() });
                app.lastminute = new Date().getMinutes()
            }

            app.works.length > 0 ? app.programs.functions.nextWork(app, app.works[0]) : app.programs.functions.nextDevice(app, devices, app.programs._k, 0)

        }, 1000)
    },
}

rail.initialize(_xdevices, function (app, devices) {
    app.programs._k = app._.remove(app._.keys(devices), function (e) { return e.indexOf("_")==-1 })
    app.run(app, devices)
})





