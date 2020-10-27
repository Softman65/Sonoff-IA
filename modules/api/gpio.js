module.exports = {
    GPIO: null, //require('onoff').Gpio ,
    pins: new Array(40),

    functions: {
        actions: {
            new: function ( params,_f) {
                _f.pins[params[0]] = new _f.GPIO(params[0], params[1])
            },
            writeSync: function (params, _f) {
                _f.pins[params[0]].writeSync(params[1])
            },
            unexport: function (params, _f) {
                _f.pins[params[0]].unexport()
            },
        },
        task: {
            new: function (device, arrayWorks, params) {
                //arrayWorks.push([{ gpio_sys: ['new', params.pin, params.action] }])
            },
            writeSync: function (device, arrayWorks, params) {
                //arrayWorks.push([{ gpio_sys: ['writeSync', params.pin, params.action] }])
            },
            unexport: function (device, arrayWorks, params) {
                //arrayWorks.push([{ gpio_sys: ['unexport', params.pin, params.action] }])
            },
        }

    },
    set: async function (app, deviceid, n, op, cb) {

        this.functions.actions[deviceid]([n,op], this )

    }
        
}