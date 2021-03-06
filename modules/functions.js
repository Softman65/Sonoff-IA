module.exports = {
    task: function (app, listTask) {
        app._.each(listTask, function (task) {
            const t = app._.keys(task)
            const k = app._.keys(task[t])
            app.Api[t[0]].functions.task[k[0]](app, app.works, task[t[0]][k[0]], app.Api[t[0]] ) //(app, app.Api[t[0]], app.works)
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
                    if (conditions.IsDayTime.morning && ( _hour < 13)) {
                        _ret = conditions.IsDayTime.morning
                        _retString.IsDayTime = _ret ? 'Ok es por la ma�ana' : 'riego de MA�ANA no activado'
                    } else {
                        if (conditions.IsDayTime.afternoon && (_hour > 12)) {
                            _ret = conditions.IsDayTime.afternoon
                            _retString.IsDayTime = _ret ? 'Ok es por la tarde' : 'riego de TARDE no activado'
                        }
                    }
                } else {
                    _ret = conditions.IsDayTime.night
                    _retString.IsNigthTime = _ret ? 'Ok es de NOCHE' : 'riego de NOCHE no activado'
                }
            }
            if (_ret && Weather.PrecipitationSummary) {
                if (!Weather.PrecipitationSummary)
                    console.log(Weather)

                if (conditions.rain && Weather.PrecipitationSummary[_k]) {
                    if (parseInt(Weather.PrecipitationSummary[_k].Metric.Value) < conditions.rain || Weather.PrecipitationSummary[_k].Metric.Unit != 'mm') {
                        _ret = true
                    }
                        _retString.rain = (_ret ? 'OK ' : 'NO ') + ('en ' + _k + ':' + Weather.PrecipitationSummary[_k].Metric.Value + ' ' + Weather.PrecipitationSummary[_k].Metric.Unit + ' -> conditions <' + conditions.rain)

                    //} else {
                    //    _ret = false
                    //    _retString.rain = 'est� ' + Weather.PrecipitationType
                    //}
                }
                if (conditions.ApparentTemperature && _ret) {
                    const _c = parseFloat(Weather.ApparentTemperature.Metric.Value) >= conditions.ApparentTemperature
                    _retString.ApparentTemperature = (_c ? 'OK ' : 'NO ') + (Weather.ApparentTemperature.Metric.Value + '�C ' + ' -> conditions >' + conditions.ApparentTemperature)
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
                        if (IA_response._response)
                            app.relayAction = true
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
                    app.relayAction ? this.task(app, device.after) : app.works = []
            } else {
                app.works = []
            }

            _cb(app)
        }
    },
    nextDevice: function (app, Devices, _k, e) {
        var _this = this
        if (e < _k.length && app.programs.Weather != {}) {

                var device = Devices[_k[e]]

            app.relayAction = false
            _this.compute(app, 0, device, function (app) {
                    _this.nextDevice(app, Devices, _k, e + 1)
            })
        }
    },
    runTask: function (app, arrayTask, e) {
        if (e < arrayTask.length) {
            const _k = app._.keys(arrayTask[e])[0]

            app.Api[_k].set(app, arrayTask[e][_k][0], arrayTask[e][_k][1], arrayTask[e][_k][2], function (status) {
                if (status)
                    app.io.emit('deviceTask', { _id: arrayTask[e][_k][0], _e: arrayTask[e][_k][1], task: arrayTask[e][_k], device: app.programs.Devices[arrayTask[e][_k][0]], status: status, _works: app.works });

                app.programs.functions.runTask(app, arrayTask, e + 1)
            })
        }
    },
    nextWork: function (app,work) {
        process.stdout.write('.')

        app.works = app._.drop(app.works)
        if (work.length > 0) {
            this.runTask(app, work, 0) 
        }

        process.stdout.write('+')
    }
}