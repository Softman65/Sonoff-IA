module.exports = {
    path_filename: function (path) {
        const _d = new Date()
        const _m = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

        const _f = path + "/" + _d.getFullYear() + '/' + _m[_d.getMonth()] 

        return _f
    },
    open: function (app, _t, cb) {
        if (!app.Datastore.db)
            app.Datastore.db = {}

        const _p = this.path_filename('../db_jsondata')
        app.mkdirp(_p, { recursive: true }, function () { 
            app.Datastore.db[_t] = new app.Datastore({ filename: _p + '/' + _t + '.db' })
            app.Datastore.db[_t].loadDatabase(function (err) {
                cb(app, app.Datastore.db[_t])
            })
        })
    }
}