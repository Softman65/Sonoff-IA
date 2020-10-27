module.exports = {
    GPIO: require('onoff').Gpio ,
    pins: new Array(40),

    functions: {
        actions: {
            new: function (app, params,_f) {
                _f.pins[params[0]] = new _f.GPIO(params[0], params[1])
                console.log('nEW GPIO')
            },
            writeSync: function (app, params, _f) {
                _f.pins[params[0]].writeSync(params[1])
                app.io.emit('deviceTask', { _id: 'gpio', _e: params[0], status: params[1] , _works: app.works });

                console.log('write in GPIO')
            },
            unexport: function (app, params, _f) {
                _f.pins[params[0]].unexport()
                console.log('unload GPIO')
            },
        },
        task: {
            new: function (device, arrayWorks, params) {
                arrayWorks.push([{ gpio_sys: ['new', params.pin, params.action] }])
            },
            writeSync: function (device, arrayWorks, params) {
                arrayWorks.push([{ gpio_sys: ['writeSync', params.pin, params.action] }])
            },
            unexport: function (device, arrayWorks, params) {
                arrayWorks.push([{ gpio_sys: ['unexport', params.pin, params.action] }])
            },
        }

    },
    set: async function (app, deviceid, n, op, cb) {

        this.functions.actions[deviceid](app, [n,op], this )
        
    }
        
}