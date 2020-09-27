'use strict';

require('console-stamp')(console, 'HH:MM:ss');
require('./sun.js')

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
    date: null,
    sunset: null,
    sunrise: null,
    works: [],
    initialize: function (devices) {

        this.Api.ewelink_sys.connection = new ewelink(devices.ewelink)
        this.devices(devices, 'init')
        this.go(devices)
    },
    devices: function (devices,_f) {
        var _k = _.keys(devices.sonoff)
        _.each(_k, function (d, i) {
            //console.log(_f, i, devices.sonoff[d])
            rail.programs[devices.sonoff[d].program][_f](devices.sonoff[d])
        })

    },
    testWeather: function (Weather, params) {
        const _d = ['D','L','M','X','J','V','S']
        const weekday = _d[new Date().getDay()]
        const conditions = params.conditions.weekdays[params.conditions.weekdays.everyDays ? 'everyDays' : weekday] 

        var _ret = false
        var _retString = {
            IsDayTime: null,
            IsNigthTime: null,
            rain: null,
            ApparentTemperature:null
        }
        if (conditions) {
            if (conditions.IsDayTime) {
                if (Weather.IsDayTime)
                    _ret = conditions.IsDayTime.dia
                    _retString.IsDayTime=_ret?'Ok es de DIA':'riego de DIA no activado'
            } else {
                if (!Weather.IsDayTime)
                    _ret = conditions.IsDayTime.noche
                    _retString.IsNigthTime = _ret ? 'Ok es de NOCHE' : 'riego de NOCHE no activado'
            }
            if (_ret) {
                if (conditions.rain) {
                    var _k = params.periodo == 1 ? 'PastHour' : 'Past' + params.periodo + 'Hour'
                    _ret = Weather.PrecipitationSummary[_k].Metric.Value < conditions.rain || Weather.PrecipitationSummary[_k].Metric.Unit != 'mm'
                    _retString.rain = (_ret ? 'OK ' : 'NO ') + ('en ' + _k + ':' + Weather.PrecipitationSummary[_k].Metric.Value + ' ' + Weather.PrecipitationSummary[_k].Metric.Unit + ' -> conditions <' + conditions.rain)
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
    go: function (devices) {
        setTimeout(function () {
            clear()
            if (rail.works.length > 0) {
                const p = rail.works[0]
                rail.works = _.drop(rail.works)
                if (p) {
                    console.log(p)
                    if (p.ewelink)
                        rail.Api.ewelink_sys.set(p.ewelink[0], p.ewelink[1], p.ewelink[2], function (status) {
                            rail.go(devices)
                        })
                    if (p.accuweather)
                        console.log(p.accuweather)

                } else {
                    rail.go(devices)
                }
            } else {

                rail.devices(devices, 'compute')
                rail.go(devices)
            }

        }, 1000)
    },
    Api: {
        accuweather: {
            fromkey: '305914',
            weatherApi: 'UcrV1FiWrqi9u5vvTv0nAWEWA8nXJcDI',
            //service: require('node-accuweather')()(app.Id.weatherApi),
            url: function (command, data) {
                //command:'forecasts , currentconditions'
                // data: daily/1day , ''
                return 'http://dataservice.accuweather.com/' + command + '/v1/' + (data.length > 0 ? data : '') + '/305914?apikey=' + this.weatherApi + '&language=ES&details=true'
            },
            loadData: function (command, data, cb) {
                //cb({})

                const http = require('http')
                http.get(this.url(command, data), function (resp) {
                    let data = '';
                    resp.on('data', (chunk) => {
                        data += chunk;
                    });
                    resp.on('end', function () {
                        cb(JSON.parse(data));
                    })
                }).on("error", (err) => {
                    console.log("Error: " + err.message);
                });

            }
        },
        ewelink_sys: {
            connection:null,
            go: function (program, _data,cb) {
                //console.log(program)
                if (!program.state) {
                    program.state = true
                    program.counter = 1
                }
                if (program.counter >= program.devices.length) {
                    program.false = true
                    cb(JSON.stringify({ deviceId: program._k, actions: _data }))
                } else {
                    this.put(program.id, program.counter, program.devices[program.counter - 1], function (data) {                    
                        if (!_data) {
                            debugger
                        } else {
                            _data.push(data)
                            program.counter = program.counter + 1
                            rail.Api.ewelink_sys.go(program, _data,cb)
                        }
                    })
                }
            },
            put: function (deviceId, relay, time,cb) {

                var add_minutes = function (dt, minutes) {
                    return new Date(dt.getTime() + minutes * 60000);
                }
                var add_seconds = function (dt, seconds) {
                    return new Date(dt.getTime() + seconds * 1000);
                }
                var _now = add_seconds(new Date(), rail.works.length)

                var _out = []
                var n = 0
                rail.works.push({ ewelink: [deviceId, relay, 'on'] })
                _out.push({ time: _now, relay: relay, action: 'on' })
                for (n == 0; n < time * 60; n++) {
                    rail.works.push(null)
                }
                _now = add_minutes(_now, time)
                rail.works.push({ ewelink: [deviceId, relay, 'off'] })
                _out.push({ time: _now, relay: relay, action: 'off' })
                cb(_out)
            },
            set: async function (deviceid, n, op, cb) {
                //console.log(op, n)
                //return await connection.setDevicePowerState(deviceid, op, n)
                await rail.Api.ewelink_sys.connection.getDevices()
                //console.log(devices)
                const status = await rail.Api.ewelink_sys.connection.setDevicePowerState(deviceid, op, n)
                console.log(deviceid, op, n, status)
                cb(status)
            }
        }
    },
    programs: {
        Sun: {
            init: function (cb) {
                cb()
            },
            start: function (cb) {
                rail.Api.accuweather.loadData('currentconditions', '', function (Weather) {
                    console.log(Weather)

                    var _keys = _.keys(program)
                    program._k = _keys[0].split('_')[1]

                    console.log(program, _keys)

                    rail.Api.ewelink_sys.go(program, function (data) {
                        cb();
                    }, [])


                })
            },
            compute: function (device) {

                this.date = new Date()
                this.sunset = new Date(this.date + 1).sunset(device.coords.lang, device.coords.lat)
                this.sunrise = new Date(this.date + 1).sunrise(lang, lat)
                
                if (rail.date.getHours() <= rail.sunrise.getHours()) {
                    if (rail.date.getHours() == rail.sunrise.getHours()) { //&& rail.date.getMinutes() == rail.sunrise.getMinutes() ) {
                        console.log('amaneciendo', rail.date)
                        this.start(function () {
                            debugger
                        })
                    } else {
                        console.log('faltan ' + (rail.sunrise.getHours() - rail.date.getHours()) + ' horas ' + (rail.sunrise.getMinutes() - rail.date.getMinutes()) + ' minutos ' + (rail.sunrise.getSeconds() - rail.date.getSeconds()) + ' segundos para el amanecer')
                    }
                } else {
                    if (rail.date.getHours() == rail.sunrise.getHours() && rail.date.getMinutes() == rail.sunrise.getMinutes() && rail.date.getSeconds() == rail.sunrise.getSeconds()) {
                        console.log('anocheciendo', rail.date)
                        this.start(function () {
                            debugger
                        })
                    } else {
                        console.log('faltan ' + (rail.sunrise.getHours() - rail.date.getHours()) + ' horas ' + (rail.sunrise.getMinutes() - rail.date.getMinutes()) + ' minutos ' + (rail.sunrise.getSeconds() - rail.date.getSeconds()) + ' segundos para el anochecer')

                    }
                }
                _return()

            }
        },
        EveryHour: {
            init: function (device) {
                device.params.Hour = device.params.lapso == 'H' ? new Date().getHours() : new Date().getMinutes()
                //this.setNewHour(device.params)
            },
            setNewHour: function (_params) { 
                if (_params.Hour + _params.periodo <= (_params.lapso == 'H' ? 23 : 59 )) {
                    _params.Hour = _params.Hour + _params.periodo
                } else {
                    _params.Hour = ( (_params.lapso=='H'?23:59) - _params.Hour) - (_params.periodo - 1)
                }
            },
            start: function (program,_cb) {
                var _params = program.params

                const _setNewHour = this.setNewHour
                //_params.Hour = new Date().getHours()
                _setNewHour(_params)
                console.log('ask accuwather')
                rail.Api.accuweather.loadData('currentconditions', '', function (Weather) {
                    console.log('response', Weather)
                    if (Weather[0]) {
                        const IA = rail.testWeather(Weather[0], _params)
                        if (IA._response) {
                            rail.Api.ewelink_sys.go(program, [], function (jsonData) {
                                _cb()
                            })
                        }
                    } else {
                        console.log(Weather[0] ? 'es de Noche' : 'sobrepasado el limite de llamadas a API accuweather') 
                        _cb() 
                    }
                    
                    
                })
               
            },
            compute: function (device) {
                if (device.params.Hour == (device.params.lapso == 'H' ? new Date().getHours() : new Date().getMinutes()) ) {
                    this.start(device, function () {
                        //debugger
                    }) 
                } else {
                    //clear()
                    console.log('esperando programa dentro de ' + device.params.Hour + (device.params.lapso == 'H' ?' horas':' minutos') )
                }
            }
        }
    }
}

rail.initialize(_xdevices)
