


var app = {
    socket: io.connect(window.location.host),
    initialize: function (app) {
        this.functions.listen(this,this.socket)
        window.onhashchange = this.functions.locationHashChanged;
    },
    Backbone: {
        template: function (JsonData, template, el) {
            this.views.weather = Backbone.View.extend({
                template: _.template( template ),

                render: function () {
                    // This is a dictionary object of the attributes of the models.
                    // => { name: "Jason", email: "j.smith@gmail.com" }
                    var dict = JsonData ;

                    // Pass this object onto the template function.
                    // This returns an HTML string.
                    var html = this.template(dict);

                    // Append the result to the view's element.
                    el.html(html);

                    // ...
                }
            });
        }
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
                app.Backbone.template(data.Weather.data, data.Weather.template_html , $("#template-wheather"))
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



