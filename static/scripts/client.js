var id = localStorage.getItem("owscrims-id");
var scrims = [];

var updateCallback = function(data) {
    $("table#scrims tbody tr").remove();
    scrims = data;
    if (!data.length) {
        var tr = document.createElement("tr");
        var a = document.createElement("td");
        var i = document.createElement("i");
        i.textContent = "No results (yet)";
        a.appendChild(i);
        tr.appendChild(a);
        var b = document.createElement("td");
        tr.appendChild(b);
        var c = document.createElement("td");
        tr.appendChild(c);
        var d = document.createElement("td");
        tr.appendChild(d);
        document.querySelector("table#scrims tbody").appendChild(tr);
    } else {
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

var s = new window.ReconnectingWebSocket("wss://fast-ridge-37917.herokuapp.com/");
var wait = [];

s.onopen = function() {
    console.info("Connected");
    if (id) {
        send(s, message("IDENT", id));
    }
    while (wait.length) {
        send(s, wait.pop());
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
            send(s, message("PONG", ""));
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

function message(header, body) {
    try {
        return JSON.stringify({header: header.toUpperCase(), body: body, timestamp: +new Date()});
    } catch (err) {
        console.error(err);
        return null;
    }
}

function send(socket, msg) {
    if (s.readyState !== WebSocket.OPEN) {
        wait.push(msg);
        return;
    }
    try {
        socket.send(msg);
    } catch(err) {
        console.error(err);
    }
}
