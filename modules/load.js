module.exports = function (devices, _cb) {

        require('./sql/sql_common.js')(this, function (SQL, app) {
            //app.commonSQL = SQL
            //app.commonSQL.SQLquery = require('../sql_storeprocs.js')(app)

            //app.commonSQL.init(app, { SQL: { db: null } }, 'db_keys', function (textDb) {
                app.commonSQL.db = textDb.SQL.db

                app.httpServer = app.http.createServer(app.staticServe);
                app.io = require('socket.io').listen(app.httpServer);


                app.io.sockets.on('connection', function (socket) {
                    socket.emit('news', { hello: 'world' });
                    socket.on('my other event', function (data) {
                        console.log(data);
                    });
                });

                app.httpServer.listen(8090);

                _cb(app, devices)
            //})
        })
    
}