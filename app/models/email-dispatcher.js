
var ES = require('./email-settings');
var EM = {};
module.exports = EM;

EM.server = require("emailjs/email").server.connect({

    host 	    : ES.host,
    user 	    : ES.user,
    password    : ES.password,
    ssl		    : true

});

EM.dispatchResetPasswordLink = function(account, callback)
{
    EM.server.send({
        from         : ES.sender,
        to           : account.email,
        subject      : 'Password Reset',
        text         : 'something went wrong... :(',
        attachment   : EM.composeEmail(account)
    }, callback );
};

EM.composeEmail = function(o)
{
    var link = 'http://dev.helloself.co/account?e='+o.email+'&p='+o.pass+'/#/reset-password';
    var html = "<html><body>";
    html += "Hi "+o.user+",<br><br>";
    html += "Your username is :: <b>"+o.user+"</b><br><br>";
    html += "<a href='"+link+"'>Please click here to reset your password</a><br><br>";
    html += "Have a nice day,<br>";
    html += "<a href='http://helloself.co'>Helloself</a><br><br>";
    html += "</body></html>";
    return  [{data:html, alternative:true}];
};