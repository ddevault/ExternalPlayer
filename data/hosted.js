(function() {
    var push = true;
    var killOnClose = false;
    switch (window.location.host) {
        case "youtube.com":
        case "www.youtube.com":
            if (window.location.pathname == '/watch') {
                var player = document.getElementById("player");
                if (player !== null) {
                    var spacer = document.createElement('div');
                    spacer.style.height = "400px";
                    player.parentElement.insertBefore(spacer, player);
                    player.parentElement.removeChild(player);
                }
            } else {
                push = false;
            }
            break;
        case "soundcloud.com":
            killOnClose = true;
            break;
    }
    if (push)
        self.port.emit("message", { type: "play", host: window.location.host, url: String(window.location.href) });

    window.addEventListener('unload', function() {
        if (killOnClose && push) {
            self.port.emit("message", { type: "kill", host: window.location.host, url: String(window.location.href) });
        }
    });
})();
