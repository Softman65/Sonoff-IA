module.exports =  {
        //fromkey: '305914',
        //weatherApi: 'BKAJ1kujNOnjOIAkTnk0pwGBi4kVdLvK', // 'UcrV1FiWrqi9u5vvTv0nAWEWA8nXJcDI',
        //service: require('node-accuweather')()(app.Id.weatherApi),
        time_reload: 60000 * 30,
        url: function (command, data, devicedata) {
            //command:'forecasts , currentconditions'
            // data: daily/1day , ''
            return 'http://dataservice.accuweather.com/' + command + '/v1/' + (data.length > 0 ? data + '/' : '')  + devicedata.fromkey +'?apikey=' + devicedata.weatherApi + '&language=ES&details=true'
        },
        loadData: function (app, devicedata, command, data, cb) {

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
                        var _w = JSON.parse(data)
                  
                            app.fs.unlink(app.PROJECT_DIR + 'dataservice.accuweather.JSON', function () {
                                if (app._.isArray(_w)) {
                                    app.fs.writeFile(app.PROJECT_DIR + 'dataservice.accuweather.JSON', data, function (err, datax) {
                                        cb(_w)
                                    })
                                } else {
                                    cb(_w)
                                }
                            })

                    })
                }).on("error", (err) => {
                    console.log("Error: " + err.message);
                    cb(null)
                });
            //} else {
            //    cb(app.Weather[0])
            //}

        }
    
}
