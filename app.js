'use strict';

var Gpio = require('onoff').Gpio; //include onoff to interact with the GPIO
var LED = new Gpio(4, 'out'); //use GPIO pin 4, and specify that it is output
var blinkInterval = setInterval(blinkLED, 250); //run the blinkLED function every 250ms

function blinkLED() { //function to start blinking
    if (LED.readSync() === 0) { //check the pin state, if the state is 0 (or off)
        LED.writeSync(1); //set pin state to 1 (turn LED on)
    } else {
        LED.writeSync(0); //set pin state to 0 (turn LED off)
    }
}

function endBlink() { //function to stop blinking
    clearInterval(blinkInterval); // Stop blink intervals
    LED.writeSync(0); // Turn LED off
    LED.unexport(); // Unexport GPIO to free resources
}

setTimeout(endBlink, 5000); //stop blinking after 5 seconds




require('console-stamp')(console, 'HH:MM:ss');
require('./modules/sun.js')

//const ewelink = require('ewelink-api');
const _ = require('underscore')
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

    _: require('underscore'),
    fs: require('fs'),
    path: require('path'),
    http: require('http'),
    inquirer: require('inquirer'),
    //mysql: require('mysql'),
    ewelink: require('ewelink-api'),
    Datastore: require('nedb'),
    ejs: require('ejs'),
    PROJECT_DIR: __dirname + '\\',

    date: null,
    sunset: null,
    sunrise: null,
    works: [],
    unloadTask: [],
    mimes: require("./mimes.json"),
    staticBasePath: './http',
    initialize: require('./modules/load.js'),
    staticServe: require('./modules/staticServer.js'),
    devices: require('./modules/devices.js'),
    unload: require('unload'),
    views:{ },
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
        IO : require('./modules/io.js'),
        functions: require('./modules/functions.js'),
        Sun: require('./modules/programs/sun.js'),
        EveryTime: require('./modules/programs/EveryTime.js'),
        EveryHour: require('./modules/programs/EveryHour.js')
    },
    run: function (app, devices) {
        //app._k = app._.keys(devices)
        setInterval(function () {

            if (app.lastminute != new Date().getMinutes()) {
                app.io.emit('time', { hello: new Date() });
                app.programs.functions.nextDevice(app, devices, app.programs._k, 0)
                app.lastminute = new Date().getMinutes()
            }

            app.works.length > 0 ? app.programs.functions.nextWork(app, app.works[0]) : null

        }, 1000)
    },
}

rail.initialize(_xdevices, function (app, devices) {
    app.views.path = app.path.resolve(app.staticBasePath + '/views/index')
    app.views.weather = app.fs.readFileSync(app.views.path + '/snipes/localWeather_widget.ejs').toString()
    app.programs._k = app._.filter(app._.keys(devices), function (e) { return e.indexOf("_") == -1 })
    app.run(app, devices)
})





