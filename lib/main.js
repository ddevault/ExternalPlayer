const {Cc,Ci} = require("chrome");
var system = require("sdk/system");
var syspath;
switch (system.platform.toLowerCase()) {
    case "linux":
        syspath = system.env.PATH.split(':');
        break;
    // TODO: Others, if anyone cares
}
var process = function(file) {
    var _ = Cc["@mozilla.org/process/util;1"]
              .createInstance(Ci.nsIProcess);
    _.init(file);
    return _;
}
var file = function(path) {
    for (var i = 0; i < syspath.length; i++) {
        var _ = Cc["@mozilla.org/file/local;1"]
                  .createInstance(Ci.nsIFile);
        try {
            _.initWithPath(syspath[i]);
            _.appendRelativePath(path);
            if (_.exists() && _.isExecutable()) {
                return _;
            }
        } catch (ex) {
            console.log(ex);
        }
    }
    return null;
};

let pageMod = require("sdk/page-mod");
let self = require("sdk/self");
var lastMessage = new Date();
var processes = {};
pageMod.PageMod({
    include: [
        "*.youtube.com"
        //"*.soundcloud.com" // TODO: Figure out why kill() doesn't work
    ],
    contentScriptFile: [
        self.data.url('hosted.js')
    ],
    onAttach: function(worker) {
        worker.port.on("message", function(data) {
            if (new Date() - lastMessage < 5000) {
                lastMessage = new Date();
                return;
            }
            if (data.type == "play") {
                lastMessage = new Date();
                var f = file("mpv");
                var p = process(f);
                p.run(false, [ data.url ], 1);
                processes[data.url] = p;
            } else if (data.type == "kill") {
                if (typeof processes[data.url] !== 'undefined') {
                    processes[data.url].kill();
                }
            }
        });
    }
});
