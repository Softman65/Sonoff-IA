module.exports =  {
        //fromkey: '305914',
        //weatherApi: 'BKAJ1kujNOnjOIAkTnk0pwGBi4kVdLvK', // 'UcrV1FiWrqi9u5vvTv0nAWEWA8nXJcDI',
        //service: require('node-accuweather')()(app.Id.weatherApi),
    credentials: require('../../Accuwheather.json'),
    time_reload: 60000 * 30,
    url: function (command, data, devicedata) {
        //command:'forecasts , currentconditions'
        // data: daily/1day , ''
        return 'http://dataservice.accuweather.com/' + command + '/v1/' + (data.length > 0 ? data + '/' : '')  + devicedata.fromkey +'?apikey=' + devicedata.weatherApi + '&language=ES&details=true'
    },
    loadData: function (app, devicedata, command, data, db, cbx) {

        //const _d = new Date()
        //const wt = app.Weather ? _d.getTime() - app.Weather[0].EpochTime < 60000 : false

        //if (!wt) {
            //const http = require('http')
            app.http.get(this.url(command, data, devicedata), function (resp) {
                let data = '';
                resp.on('data', (chunk) => {
                    data += chunk;
                });
                resp.on('end', function () {
                    const _data = JSON.parse(data)
                    if (app._.isArray(_data)) {
                        db.ensureIndex({ fieldName: 'LocalObservationDateTime', unique: true }, function (err) {
                            if (!err) {
                                db.insert(_data[0], function (err, newDoc) {
                                    cbx(newDoc)
                                })
                            } else {
                                debugger
                            }
                        });

                    } else {
                        cbx(null)
                    }
                    //JSON.parse(data))
                    /*
                    var _w = JSON.parse(data)
                    if (app._.isArray(_w)) {

                    } else {

                    }
                        app.fs.unlink(app.PROJECT_DIR + 'dataservice.accuweather.JSON', function () {
                            if (app._.isArray(_w)) {
                                app.fs.writeFile(app.PROJECT_DIR + 'dataservice.accuweather.JSON', data, function (err, datax) {
                                    app.io.emit('tick', { Wheather : _w });
                                    cb(_w)
                                })
                            } else {
                                cb(_w)
                            }
                        })
                        */

                })
            }).on("error", (err) => {
                console.log("Error: " + err.message);
                cbx(null)
            });
        //} else {
        //    cb(app.Weather[0])
        //}

    }
    
}
