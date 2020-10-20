module.exports = {
    init: function (_this, device) {
        device.params.T = device.params.EveryTime.lapso == 'H' ? new Date().getHours() : new Date().getMinutes()
        _this.Devices[device.id].relays.push(device)
        //this.setNewHour(device.params)
    },

    start: function (app, _this, program, _cb) {
        var _params = program.params
        this.setNextTime(program, _params)

        console.log('ask', program.action, program.id, program.e)
        _this.functions[program.action](app, _this, program, _params, _cb)

    }, setNextTime: function (program, _params) {
        if (program.T + _params.EveryTime.periodo <= (_params.EveryTime.lapso == 'H' ? 23 : 59)) {
            program.T = program.T + _params.EveryTime.periodo
        } else {
            program.T = ((_params.EveryTime.lapso == 'H' ? 23 : 59) - program.T) - (_params.EveryTime.periodo - 1)
        }
    }
}