
window.clock = function (LocalObservationDateTime) {

    var _t = new Date(LocalObservationDateTime);
    var _th = ' 0'.repeat(2 - (_t.getHours() + '').length) + _t.getHours();
    var _tm = ' 0'.repeat(2 - (_t.getMinutes() + '').length) + _t.getMinutes();
    return (_th + ":" + _tm)
}

var app = {
    socket: io.connect(window.location.host),
    initialize: function (app) {
        this.functions.listen(this,this.socket)
        window.onhashchange = this.functions.locationHashChanged;

        $("input[data-bootstrap-switch]").each(function () {
            $(this).bootstrapSwitch('state', $(this).prop('checked'));
        });

    },
    template_html: {},
    template: function (JsonData, template, el) {
        const _t = _.template(template)
        el.html( _t(JsonData) )
    },
    functions: {
        locationHashChanged: function(e) {
            console.log(location.hash);
            console.log(e.oldURL, e.newURL);
            app.functions.Menu(app,location.hash)
            //if (location.hash === "#pageX") {
            //    pageX();
            //}
        },
        listen: function (app, socket) {
            socket.on('news', function (data) {
                console.log(data);
                app.template_html.Weather =  data.Weather.template_html
                app.template(data.Weather.data, app.template_html.Weather, $("#template-wheather") )
            });
            socket.on('weather', function (data) {
                console.log(data);
                app.template(data, app.template_html.Weather, $("#template-wheather"))
                //socket.emit('my other event', { my: 'data' });
            });
            socket.on('time', function (data) {
                console.log(data);
                //socket.emit('my other event', { my: 'data' });
            });
            socket.on('tick', function (data) {
                console.log(data);
                //socket.emit('my other event', {my: 'data' });
            });
        },
        Menu: function (app,hash) {
            alert(hash)
        }

    }
}

app.initialize(app)



