module.exports = function (app, params) {
    app.Api.ewelink_sys.connection = new app.ewelink(params)
    app._.each(params.devices, function (device) {

        if (device.active) {

            app.programs.Devices[device.id] = {
                obj: 'ewelink_sys',
                type: device.type,
                task: device.task ? device.task : [],
                after: device.after ? device.after : [],
                before: device.before ? device.before : [],
                //coords: device.coords,
                //askToAccuweather: device.WeatherData.Accuweather,
                relays: []
            }
            if (device.coords)
                app.programs.Devices[device.id].coords = device.coords

            if (device.WeatherData) {
                app.programs.Devices[device.id].askToWeather = device.WeatherData
            }

            app._.each(device.relays, function (_relay, i) {
                _relay.id = device.id
                _relay.e = i + 1
                _relay.state = _relay.unload ? 'on' : 'off'

                _relay.T = _relay.params.EveryTime.lapso == 'H' ? new Date().getHours() : new Date().getMinutes()
                app.programs.Devices[_relay.id].relays.push(_relay)

            })
        }
    })
}