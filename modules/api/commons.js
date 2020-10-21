module.exports = {
    functions: {
        timer: function (app, arrayWorks, device, time, cb) {
            var fn_task = this.task
            var deviceId = device.id
            var relay = device.e

            var add_minutes = function (dt, minutes) {
                return new Date(dt.getTime() + minutes * 60000);
            }
            var add_seconds = function (dt, seconds) {
                return new Date(dt.getTime() + seconds * 1000);
            }


            var push_ActionTime = function (arrayWorks, device, _now, _time) {

                var deviceId = device.id
                var relay = device.e

                if (_time.h && _time.h > 0) {
                    for (n == 0; n < _time.h * 60 * 60; n++) {
                        arrayWorks.push([])
                    }
                    _now = add_minutes(_now, _time.h * 60)
                }
                if (_time.m && _time.m > 0) {
                    for (n == 0; n < _time.m * 60; n++) {
                        arrayWorks.push([])
                    }
                    _now = add_minutes(_now, _time.m)
                }
                if (_time.s && _time.s > 0) {
                    for (n == 0; n < _time.s; n++) {
                        arrayWorks.push([])
                    }
                    _now = add_seconds(_now, _time.s)
                }

                if (device.task[_time.a]) {
                    app._.each(device.task[_time.a], function (task) {
                        var _k = app._.keys(task)[0]
                        fn_task[_k](device, arrayWorks, task[_k])
                    })
                } else {
                    arrayWorks.push([{ ewelink_sys: [deviceId, relay, _time.a] }])
                }
                _out.push({ _time: _now, relay: relay, action: _time.a })
                return _now
            }
            var _now = add_seconds(new Date(), arrayWorks.length)

            var _out = []
            var n = 0

            if (time.f) {
                _now = push_ActionTime(arrayWorks, device, _now, time.f)
                //rail.works.push({ ewelink_sys: [deviceId, relay, time.f.a] })
                //_out.push({ time: _now, relay: relay, action: time.f.a })
            }

            if (time.l) {
                _now = push_ActionTime(arrayWorks, device, _now, time.l)
                //rail.works.push({ ewelink_sys: [deviceId, relay, time.l.a] })
                //_out.push({ time: _now, relay: relay, action: time.l.a })
            }
            cb(_out)
        },
        task: {
            relay: function (device, arrayWorks, params) {
                arrayWorks.push([{ ewelink_sys: [device.id, device.e, params.action] }])
            },
            delay: function (device, arrayWorks, _time) {
                var n = 0
                if (_time.s && _time.s > 0) {
                    for (n == 0; n < _time.s; n++) {
                        arrayWorks.push([])
                    }
                }
            },
            put: function (device, arrayWorks, params) {
                arrayWorks.push([{ ewelink_sys: [params.device, params.relay, params.action] }])
            }


        },
    }
}