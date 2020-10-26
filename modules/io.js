module.exports = {
    listen: function (app) {
        return {
            relayState: function (data) {
                const _t = data.id.split('-')
                var obj = {}
                obj[_t[0]] = [_t[1], _t[2], _t[0] == 'i2c_sys' ? (data.state ? "0xff" : "0x00") : (data.state ? "on" : "off")]

                app.works.push([obj])

                console.log(data);
            }
        }
    }
}