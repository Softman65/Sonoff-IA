
module.exports = function (app) {
    return {
        staticServer: function (req, res) {

            if (req.url == "/") {
                var resolvedBase = app.views.path;
                safeSuffix = req.url + 'index.ejs'
                var fileLoc = app.path.join(resolvedBase, safeSuffix);

                app.fs.readFile(fileLoc, function (err, data) {
                    res.setHeader("content-type", 'text/html');
                    res.statusCode = 200;

                    res.write(app.ejs.render(data.toString(), {
                        Sidebar: {
                            header:"EXAMPLES",
                            li: [
                                { href: "pages/calendar.html", p: "Calendar", class: "nav-icon fas fa-calendar-alt" },
                                { href: "pages/gallery.html", p: "Gallery", class: "nav-icon far fa-image" },
                                { href: "pages/kanban.html", p: "Kanban Board", class: "nav-icon fas fa-columns" }
                            ]
                        }
                    }, { root: resolvedBase }) );
                    return res.end();
                })

            } else {
                var resolvedBase = app.path.resolve(app.staticBasePath+'/public');
                var safeSuffix = app.path.normalize(req.url).replace(/^(\.\.[\/\\])+/, '');
                var fileLoc = app.path.join(resolvedBase, safeSuffix);
            
                app.fs.readFile(fileLoc, function (err, data) {
                    if (err) {
                        res.writeHead(404, 'Not Found');
                        res.write('404: File Not Found!');
                        return res.end();
                    }
                    var extension = fileLoc.substring(
                        fileLoc.lastIndexOf(".")
                    );

                    var type = app.mimes[extension];
                    if (type) {
                        res.setHeader("content-type", type);
                    }
                    res.statusCode = 200;

                    res.write(data);
                    return res.end();
                });
            }
        }
    }
    
}