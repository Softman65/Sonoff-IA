module.exports = {
    init: function (id, device) {
        device.params.Hour = device.params.lapso == 'H' ? new Date().getHours() : new Date().getMinutes()
        //this.setNewHour(device.params)
    },
    setNewHour: function (_params) {
        if (_params.Hour + _params.periodo <= (_params.lapso == 'H' ? 23 : 59)) {
            _params.Hour = _params.Hour + _params.periodo
        } else {
            _params.Hour = ((_params.lapso == 'H' ? 23 : 59) - _params.Hour) - (_params.periodo - 1)
        }
    },
    start: function (program, _cb) {
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
                    rail.Api.ewelink_sys.go(program, [], function (actionsDevice) {
                        _cb(IA)
                    })
                } else {
                    _cb(IA)
                }
            } else {
                console.log('sobrepasado el limite de llamadas a API accuweather')
                _cb()
            }


        })

    },
    compute: function (id, device) {
        if (device.params.Hour == (device.params.lapso == 'H' ? new Date().getHours() : new Date().getMinutes())) {
            this.start(device, function (IA_response) {
                if (IA_response)
                    rail.commonSQL.procSQL('saveData(?,?,?)', [JSON.stringify(IA_response._w), JSON.stringify(IA_response._r), IA_response._response], function (err, record) {
                        console.log('save data mysql ' + (err ? 'FAIL' : 'Ok'))
                    })
            })
        } else {
            //clear()
        }
    }
}