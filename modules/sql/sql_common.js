module.exports = function (app, callback) {
    var _ithis = {
        poolSql: [],
        testIp : function (callback) {

            //_cb = callback 

            app.inquirer.prompt([
                { type: 'input', name: 'host', message: 'mysql IP', default: 'localhost' },
                { type: 'input', name: 'user', message: 'mysql user', default: 'root' },
                { type: 'password', name: 'password', message: 'mysql password' }

            ]).then(function (resp) {

                const _credenciales = {
                    host: resp.host,
                    user: resp.user,
                    password: resp.password,
                    database: _ithis.filedb(),
                    multipleStatements: true,
                    //waitForConnection: true,
                     // insecureAuth: true
                }
                //const con = app.mysql.createConnection(_credenciales)




                app.mysql.createConnection(_credenciales).connect(function (err) {
                    if (err) {
                        console.log('\x1b[31m las credenciales no parecen validas, vuelve a intentarlo \x1b[0m')
                        console.log(err)
                        _ithis.testIp(callback)
                    } else {
                        console.log("\x1b[32m Conectado a mysql OK \x1b[0m");

                        //_ithis.testDB(options, con, resp, _ithis.filedb(Command, type), function () {
                            app.fs.writeFile(_ithis.fileCredenciales(), JSON.stringify(_credenciales), function (err, _JSON) {
                                console.log("\x1b[32m Nuevas credenciales de acceso mysql guardadas OK \x1b[0m");
                                callback(_credenciales)
                            })
                       // }, true)

                    }
                });

            })
        },        
        getConnect: function ( dbname, options, callback, test) {
            const _this = this
            const _exit = function (options, callback, test) {
                console.log(callback)
                callback(options)
            }
            if (this.poolSql[dbname] != null) {
                if (options.SQL.db == null) {

                    this.poolSql[dbname].getConnection(function (err, connection) {
                        // connected! (unless err is set)
                        if (err == null) {
                            const handle = function (connection, _hc) {
                                connection.on('error', function (err) {
                                    console.log('db error', err);
                                    _this.poolSql[dbname].getConnection(function (err, connection) {
                                        handle(connection, _hc)
                                        options.SQL.db = connection
                                    })
                                })
                            }

                            handle(connection, handle)

                            console.log('new connection mysql OK')
                            options.SQL.db = connection // _this.connection[type] = connection

                            _exit(options, callback, connection.config)
                        } else {

                            console.log("\x1b[31m ERROR: al acceder a la DB ")
                            console.log("elimine el fichero '" + _this.fileCredenciales() + "'  \x1b[0m")
                            console.log("y vuelva a ejecutar app.js")
                            app.exit(function () { process.exit(1) })
                            //process.exit(1)
                        }
                    })
                } else {
                    _exit(options, type, callback)
                }
            } else {
                this.init(options, dbname, callback)
            }

        },
        fileCredenciales: function () {            
            return app.path.normalize(app.path.join(__dirname,'../../sqlfiles/creditos/cred_db.json'))
        },
        filedb: function () {
            return "mi_paloma"
        },
        init: function (app, options, dbname, callback) {
           //debugger
            //const _ithis = this
            app.fs.readFile(this.fileCredenciales(), function (err, _JSON) {
                var _cb = null
                if (err) {
                    _ithis.testIp(function (credenciales) {

                        _ithis.poolSql[dbname] = app.mysql.createPool({
                            host: credenciales.host, //_sql.mySQL.host, //, //'localhost', //'66.70.184.214',
                            user: credenciales.user, // _sql.mySQL.user,
                            password: credenciales.password,
                            //database: dbname, //credenciales.database,
                            multipleStatements: true,
                            waitForConnection: true,
                             // insecureAuth: true

                        })
                        _ithis.getConnect(options, callback)
                    })
 
                } else {
                    if (_ithis.poolSql[dbname] == null) {

                        _ithis.poolSql[dbname] = app.mysql.createPool({
                            host: JSON.parse(_JSON.toString()).host,
                            user: JSON.parse(_JSON.toString()).user,
                            password: JSON.parse(_JSON.toString()).password,
                            //database: dbname,
                            multipleStatements: true,
                            waitForConnection: true,
                             // insecureAuth: true
                        })
                        _ithis.getConnect(dbname, options, callback, JSON.parse(_JSON.toString()))
                    } else {
                        callback(options, _ithis.poolSql.config)
                    }
                }


            })
        },
        procSQL: function (_proc,_var,_cb) {
            app.commonSQL.db.query('call mi_paloma.' + _proc, _var, function (err, record) {
                _cb(err,record)
            })
        },
        cadSQL: function (str,req) {
            return str.replace('%1', req.headers.host) //'Select * From ' + req.headers.host + '.CLIENTES where TELEFONO=?'
        }
    }

    callback(_ithis,app)
}