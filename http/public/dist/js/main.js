


var app = {
    socket: io.connect(window.location.host),
    initialize: function (app) {
        this.functions.listen(this,this.socket)
        window.onhashchange = this.functions.locationHashChanged;
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
                app.template(data.Weather.data, app.template_html.Weather, $("#template-wheather"))
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



