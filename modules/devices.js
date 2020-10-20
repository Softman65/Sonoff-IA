module.exports = function (app,devices, _f) {

    app._.each(devices, function (dn) {

        var _k = app._.keys(dn)
        app._.each(_k, function (d) {

            app.programs.Devices['_'+d](app, dn[d])

        })
    })
    
}