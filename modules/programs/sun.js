module.exports = {
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
    }
