module.exports = function (app,devices, _f) {


        var _k = app._.keys(devices.sonoff)
        app._.each(_k, function (d) {
            if (devices.sonoff[d].active) {
                app.programs.Devices[d] = {
                    type: devices.sonoff[d].type,
                    task: devices.sonoff[d].task,
                    coords: devices.sonoff[d].coords,
                    askToAccuweather: devices.sonoff[d].askToAccuweather,
                    relays: []
                }

                app._.each(devices.sonoff[d].relays, function (_relay, i) {
                    _relay.id = d
                    _relay.e = i + 1

                    //init: function (_this, device) {   

                    _relay.T = _relay.params.EveryTime.lapso == 'H' ? new Date().getHours() : new Date().getMinutes()
                    app.programs.Devices[_relay.id].relays.push(_relay)

                    //rail.programs[_relay.program][_f](rail.programs, _relay)
                })
            }
        })

    
}