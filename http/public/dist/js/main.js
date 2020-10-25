   var socket = io.connect(window.location.host);
   socket.on('news', function (data) {
        console.log(data);
        socket.emit('my other event', {my: 'data' });
   });

    socket.on('tick', function (data) {
        console.log(data);
        //socket.emit('my other event', {my: 'data' });
    });


function Menu_sel(hash) {
    alert(hash)
}

function locationHashChanged(e) {
    console.log(location.hash);
    console.log(e.oldURL, e.newURL);
    Manu_sel(location.hash)
    //if (location.hash === "#pageX") {
    //    pageX();
    //}
}

window.onhashchange = locationHashChanged;
