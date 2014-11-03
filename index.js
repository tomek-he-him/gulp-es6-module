var gutil = require('gulp-util')
  , through = require('through')
  , PluginError = gutil.PluginError
  ;


module.exports = function (exports, options) {
    if (!options) options = {};
    if (typeof exports !== 'object') {
        throw new PluginError('gulp-es6-module', 'Argument `exports` missing.');
    }

    var exportKeys, addExport, writeBuffer, endStream
      ;

    exportKeys = Object.keys(exports);
    if (!exportKeys.length) {
        throw new PluginError('gulp-es6-module', 'Argument `exports` has no valid keys.');
    }

    writeBuffer = function writeBuffer (file) {
        if (file.isNull()) return;
        if (file.isStream()) {
            return this.emit( 'error'
                            , new PluginError('gulp-es6-module', 'Streaming not supported')
                            );
        }

        var noSemicolon = {value: true}
          , noNewline = {value: true}
          , contents = file.contents.toString()
          ;

        if (/\n$/.test(contents)) noNewline.value = false;
        if (/;\s*$/.test(contents)) noSemicolon.value = false;

        contents = exportKeys.reduce(addExport(noNewline, noSemicolon), contents);
        file.contents = new Buffer(contents);
        this.emit('data', file);
    };

    addExport = function addExport (noNewline, noSemicolon) {
        return function (key, contents) {
            if (noNewline.value) {
                contents += '\n';
                noNewline.value = false;
            }
            if (noSemicolon.value) {
                contents += ';';
                noSemicolon.value = false;
            }
            contents += 'export {' + exports[key] + ' as ' + key + '};';
            contents += '\n';
            return contents;
        };
    };

    endStream = function endStream () {
        this.emit('end');
    };

    return through(writeBuffer, endStream);
};
