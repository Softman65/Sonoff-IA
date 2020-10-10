module.exports =  function (req, res) {
        var resolvedBase = rail.path.resolve(rail.staticBasePath);
        var safeSuffix = rail.path.normalize(req.url).replace(/^(\.\.[\/\\])+/, '');
        var fileLoc = rail.path.join(resolvedBase, safeSuffix);

        fs.readFile(fileLoc, function (err, data) {
            if (err) {
                res.writeHead(404, 'Not Found');
                res.write('404: File Not Found!');
                return res.end();
            }
            var extension = req.url.substring(
                req.url.lastIndexOf(".")
            );

            var type = mimes[extension];
            if (type) {
                res.setHeader("content-type", type);
            }
            res.statusCode = 200;

            res.write(data);
            return res.end();
        });
    
}