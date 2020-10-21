module.exports = function (app, params) {

    app._.each(params.devices, function (device) {

        if (device.active) {

            app.programs.Devices[device.adress] = {
                adress:device.adress,
                obj: 'i2c_sys',
                type: device.type,
                task: device.task ? device.task : [],
                after: device.after ? device.after : [],
                before: device.before ? device.before : [],
                //coords: device.coords,
                //askToAccuweather: device.WeatherData.Accuweather,
                relays: []
            }
            if (device.coords)
                app.programs.Devices[device.adress].coords = device.coords

            if (device.WeatherData) {
                app.programs.Devices[device.adress].askToWeather = device.WeatherData
            }

            app._.each(device.relays, function (_relay, i) {
                _relay.id = device.adress
                _relay.e = i + 1

                _relay.T = _relay.params.EveryTime.lapso == 'H' ? new Date().getHours() : new Date().getMinutes()
                app.programs.Devices[_relay.id].relays.push(_relay)

            })
        }
    })
}