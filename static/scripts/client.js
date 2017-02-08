var id = localStorage.getItem("owscrims-id");
var scrims = {};

var updateCallback = function(data) {
    $("table#scrims tbody tr.scrim").remove();
    scrims = data;
    for (var i = 0; i < scrims.length; i++) {
        var s = scrims[i];
        var tr = document.createElement("tr");

        var cc = document.createElement("td");
        cc.textContent = s.contact;
        tr.appendChild(cc);

        var tc = document.createElement("td");
        tc.textContent = s.tier;
        tr.appendChild(tc);

        var wc = document.createElement("td");
        wc.textContent = "Now";
        tr.appendChild(wc);

        var rc = document.createElement("td");
        rc.textContent = s.region;
        tr.appendChild(rc);

        document.querySelector("table#scrims tbody").appendChild(tr);
    }
};
(function() {
    var rs = document.querySelector("#regionSelection");
    var rsc = localStorage.getItem("owscrims-region");
    rs.selectedIndex = rsc ? rsc : 2;

    var ts = document.querySelector("#tierSelection");
    var tsc = localStorage.getItem("owscrims-tier");
    ts.selectedIndex = tsc ? tsc : 1;

    var c = document.querySelector("#contact");
    var cc = localStorage.getItem("owscrims-contact");
    c.value = cc || "";
})();

function send(socket, header, body) {
    try {
        socket.send(JSON.stringify({header: header.toUpperCase(), body: body, timestamp: +new Date()}));
    } catch(err) {
        console.error(err);
    }
}

var s = new window.ReconnectingWebSocket("wss://fast-ridge-37917.herokuapp.com/");

s.onopen = function() {
    console.info("Connected");
    if (id) {
        send(s, "IDENT", id);
    }
};

s.onclose = function() {
    console.info("Disconnected");
};

s.onerror = function(err) {
    console.error(err);
};

s.onmessage = function(msg) {
    var data;
    try {
        data = JSON.parse(msg.data);
    } catch(err) {
        console.error(err);
        return;
    }
    console.log(data);
    switch (data.header) {
        case "PING":
            send(s, "PONG", "");
            break;
        case "UPDATE":
            scrims = data.body;
            updateCallback(data.body);
            break;
        case "IDENT":
            id = id || data.body;
            localStorage.setItem("owscrims-id", id);
            break;
        case "ERROR":
            console.error(data.body);
            break;
        default:
            break;
    }
};
