
window.clock = function (LocalObservationDateTime) {

    var _t = new Date(LocalObservationDateTime);
    var _th = ' 0'.repeat(2 - (_t.getHours() + '').length) + _t.getHours();
    var _tm = ' 0'.repeat(2 - (_t.getMinutes() + '').length) + _t.getMinutes();
    return (_th + ":" + _tm)
}

window.app = {
    socket: io.connect(window.location.host),
    initialize: function () {

        this.initialize = {
            Weather: function (data) {
                app.template_html.Weather = data.template_html
                app.template(data.data, app.template_html.Weather, $("#template-wheather"))
            },
            Devices: function (data) {
                //debugger
                _.each(data, function (device) {
                    _.each(device.relays, function (relay) {
                        $('[name='+ relay.engine+'-' + relay.id + '-' + relay.e + ']').bootstrapSwitch({
                            'size': 'mini',
                            'onSwitchChange': function (event, state) {
                                app.socket.emit('relayState', { id: this.name, state: state})
                                console.log('switched...', this.name, state)
                            },
                            'AnotherName': 'AnotherValue'
                        }); //.on('change.bootstrapSwitch', function (e) {
                         //   debugger
                        //})
                    })

                })
            },
            program: function (data) {

            }

        }
        
        //$("input[data-bootstrap-switch]").each(function () {
        //    $(this).bootstrapSwitch();
        //});

        window.onhashchange = this.functions.locationHashChanged;
        this.functions.listen(this, this.socket,this.IO.listen)

    },
    template_html: {},
    template: function (JsonData, template, el) {
        const _t = _.template(template)
        el.html( _t(JsonData) )
    },
    IO: {
        listen: {
            news: function (data) {
                console.log(data);
                //debugger
                _.each(_.keys(data), function (_k) {
                    if(app.initialize[_k])
                        app.initialize[_k](data[_k])
                })
            },
            weather: function (data) {
                console.log(data);
                app.template(data, app.template_html.Weather, $("#template-wheather"))
            },
            time: function (data) {
                console.log(data);
            },
            deviceTask: function (data) {
                console.log(data)
            },
            tick: function (data) {
                console.log(data);
            },
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
        listen: function (app, socket, IOlisten) {
            _.each(IOlisten, function (f, name) {
                socket.on(name, f);
            })
        },
        Menu: function (app,hash) {
            alert(hash)
        }

    }
}
$(document).ready(function () { 
    window.app.initialize()
})



