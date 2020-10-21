module.exports = function (devices, _cb) {

        require('./sql/sql_common.js')(this, function (SQL, app) {
            //app.commonSQL = SQL
            //app.commonSQL.SQLquery = require('../sql_storeprocs.js')(app)

            //app.commonSQL.init(app, { SQL: { db: null } }, 'db_keys', function (textDb) {
                //app.commonSQL.db = textDb.SQL.db

                app.httpServer = app.http.createServer(app.staticServe);
                app.io = require('socket.io').listen(app.httpServer);


                app.io.sockets.on('connection', function (socket) {
                    socket.emit('news', { hello: 'world' });
                    socket.on('my other event', function (data) {
                        console.log(data);
                    });
                });

                app.httpServer.listen(8090);


                app.fs.access(app.PROJECT_DIR + 'dataservice.accuweather.JSON', app.fs.F_OK, function (err) {
                    if (!err) {
                        app.programs.Weather = JSON.parse(app.fs.readFileSync(app.PROJECT_DIR + 'dataservice.accuweather.JSON', 'utf8'));
                    }
                    app.devices(app, devices, 'init')
                    app.lastminute = new Date().getMinutes()

                    const _dx = app.programs.Weather[0] ? new Date() - new Date(app.programs.Weather[0].LocalObservationDateTime) > app.Api.accuweather.time_reload : true

                    if (_dx) {
                        //app.programs.Weather = {}
                        app.Api.accuweather.loadData(app, app.Api.accuweather.credentials, 'currentconditions', '', function (Weather) {
                            app.programs.Weather = Weather
                            app.run(app, app.programs.Devices)
                        })
                    } else {
                        app.run(app, app.programs.Devices)
                    }


                })



                _cb(app, devices)
            //})
        })
    
}