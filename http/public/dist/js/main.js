


var app = {
    socket: io.connect(window.location.host),
    initialize: function (app) {
        this.functions.listen(this,this.socket)
        window.onhashchange = this.functions.locationHashChanged;
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
                //socket.emit('my other event', { my: 'data' });
            });
            socket.on('weather', function (data) {
                console.log(data);
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



