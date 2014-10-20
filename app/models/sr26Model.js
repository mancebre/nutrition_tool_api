//get server ip
var os = require('os');

var interfaces = os.networkInterfaces();
var addresses = [];
for (k in interfaces) {
    for (k2 in interfaces[k]) {
        var address = interfaces[k][k2];
        if (address.family == 'IPv4' && !address.internal) {
            addresses.push(address.address)
        }
    }
}

var host = addresses[0];
if (host != "104.131.17.237") {
    host = "localhost";
}

var mysql      = require('mysql');

module.exports =  connection = mysql.createConnection({
    multipleStatements: true,
    host        : host,
    user        : 'root',
    password    : 'vitezkoja',
    port        : 3306, //port mysql
    socketPath  : '/var/run/mysqld/mysqld.sock',
    database    : 'sr26'
});
