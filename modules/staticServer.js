module.exports = function (app) {
    return {
        staticServer: function (req, res) {

            var resolvedBase = app.path.resolve(app.staticBasePath);
            var safeSuffix = app.path.normalize(req.url).replace(/^(\.\.[\/\\])+/, '');
            if (req.url == "/")
                safeSuffix = req.url + 'index2.html' 
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