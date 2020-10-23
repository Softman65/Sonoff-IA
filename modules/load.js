module.exports = function (devices, _cb) {

        require('./sql/sql_common.js')(this, function (SQL, app) {
            //app.commonSQL = SQL
            //app.commonSQL.SQLquery = require('../sql_storeprocs.js')(app)

            //app.commonSQL.init(app, { SQL: { db: null } }, 'db_keys', function (textDb) {
                //app.commonSQL.db = textDb.SQL.db

            app.devices(app, devices, 'init')

            app.Datastore.db = {}
            app.Datastore.db.Weather = new app.Datastore({ filename: '../db_jsondata/weather.db' })

            app.Datastore.db.Weather.loadDatabase(function (err) {

                if (!err) {
                    app.httpServer = app.http.createServer(app.staticServe(app).staticServer);
                    app.io = require('socket.io').listen(app.httpServer);


                    app.io.sockets.on('connection', function (socket) {
                        socket.emit('news', { Wheather: app.programs.Weather, Devices: app.programs.Devices, program: app.programs.jsonData });
                        socket.on('my other event', function (data) {
                            console.log(data);
                        });
                    });

                    app.httpServer.listen(8090);


                    app.Api.accuweather.run(app, app.Datastore.db.Weather, function (app) {
                        _cb(app, app.programs.Devices)
                    })
                    
                } else {
                    console.log(err)
                }
            })

        })
    
}