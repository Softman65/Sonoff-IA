module.exports = {
    task: function (app, listTask) {
        app._.each(listTask, function (task) {
            const t = app._.keys(task)
            const k = app._.keys(task[t])
            app.Api[t[0]].functions.task[k[0]](app, app.works, task[t[0]][k[0]]) //(app, app.Api[t[0]], app.works)
        })
    },
    WeatherTask: function (app, _this, program, _params, _cb) {

        const _push = function (app, _system, arrWorks, program, _out, _params, IA, _cb) {
            _system.push(app, _system, arrWorks, program, _out, function (actionsDevice) {
                _cb(IA)
            })
        }

        const IA = _this.functions.testWeather(_this.Weather, _params)
        if (IA._response) {
            _push(app, app.Api[program.engine], app.works, program, [], _params, IA, _cb)
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
        const _k = params.EveryTime.periodo <= 1 || params.EveryTime.lapso != "H" ? 'PastHour' : 'Past' + params.EveryTime.periodo + 'Hour' + (params.EveryTime.periodo > 1 ? 's' : '')
        const _hour = new Date().getHours()

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
                    if (conditions.IsDayTime.morning && (_hour > 8 && _hour < 13)) {
                        _ret = conditions.IsDayTime.morning
                        _retString.IsDayTime = _ret ? 'Ok es por la mañana' : 'riego de MAÑANA no activado'
                    } else {
                        if (conditions.IsDayTime.afternoon && (_hour > 12 && _hour < 20)) {
                            _ret = conditions.IsDayTime.afternoon
                            _retString.IsDayTime = _ret ? 'Ok es por la tarde' : 'riego de TARDE no activado'
                        }
                    }
                } else {
                    _ret = conditions.IsDayTime.night
                    _retString.IsNigthTime = _ret ? 'Ok es de NOCHE' : 'riego de NOCHE no activado'
                }
            }
            if (_ret) {
                if (!Weather.PrecipitationSummary[_k])
                    console.log(Weather)

                if (conditions.rain && Weather.PrecipitationSummary[_k]) {
                    if (parseInt(Weather.PrecipitationSummary[_k].Metric.Value) < conditions.rain || Weather.PrecipitationSummary[_k].Metric.Unit != 'mm') {
                        _ret = true
                    }
                        _retString.rain = (_ret ? 'OK ' : 'NO ') + ('en ' + _k + ':' + Weather.PrecipitationSummary[_k].Metric.Value + ' ' + Weather.PrecipitationSummary[_k].Metric.Unit + ' -> conditions <' + conditions.rain)

                    //} else {
                    //    _ret = false
                    //    _retString.rain = 'está ' + Weather.PrecipitationType
                    //}
                }
                if (conditions.ApparentTemperature && _ret) {
                    const _c = parseFloat(Weather.ApparentTemperature.Metric.Value) >= conditions.ApparentTemperature
                    _retString.ApparentTemperature = (_c ? 'OK ' : 'NO ') + (Weather.ApparentTemperature.Metric.Value + 'ºC ' + ' -> conditions >' + conditions.ApparentTemperature)
                    _ret = _ret && _c

                }
                if (conditions.wind && _ret) {
                    const _w = parseFloat(Weather.Wind.Speed.Metric.Value) < conditions.wind
                    _retString.Wind = (_w ? 'OK ' : 'NO ') + (Weather.Wind.Speed.Metric.Value + ' speed ' + ' -> conditions >' + conditions.wind)
                    _ret = _ret && _w

                }
            }
        }
        console.log(_retString)
        return { _r: _retString, _response: _ret, _w: Weather }
    },
    compute: function (app, n_relay, device, _cb) {
        if (device.before && n_relay == 0)
            this.task(app, device.before)

        var relays = device.relays
        if (!relays)
            debugger

        if (n_relay < relays.length) {
            const _this = app.programs
            const _relay = relays[n_relay]
            _relay.task = device.task
            _relay.engine = device.obj
            if (_relay.T <= (_relay.params.EveryTime.lapso == 'H' ? new Date().getHours() : new Date().getMinutes())) {
                _this[_relay.program].start(app, _this, _relay, function (IA_response) {
                    if (IA_response) {
                        //rail.commonSQL.procSQL('saveData(?,?,?)', [JSON.stringify(IA_response._w), JSON.stringify(IA_response._r), IA_response._response], function (err, record) {
                        //console.log('save data mysql ' + (err ? 'FAIL' : 'Ok'))
                        _this.functions.compute(app, _relay.e, device, _cb)
                        //})
                    } else {
                        debugger
                    }
                })
            } else {
                _this.functions.compute(app, _relay.e, device, _cb)
            }
        } else {
            if (app.works.length > 1) {
                if (device.after)
                    this.task(app, device.after)
            } else {
                app.works = []
            }

            _cb(app)
        }
    },
    nextDevice: function (app, Devices, _k, e, cb) {
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
    runTask: function (app, arrayTask, e, cb) {
        if (e < arrayTask.length) {
            const _k = app._.keys(arrayTask[e])[0]
            //if (arrayTask[e].ewelink)
            app.Api[_k].set(app, arrayTask[e][_k][0], arrayTask[e][_k][1], arrayTask[e][_k][2], function (status) {
                app.programs.functions.runTask(app, arrayTask, e + 1, cb)
            })
        } else {
            cb(app)
        }
    }
}