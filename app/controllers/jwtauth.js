var Account = require('../models/account');
var jwt = require('jwt-simple');
 
module.exports = function(req, res, next) {
  var token = (req.body && req.body.access_token) || (req.query && req.query.access_token) || req.headers['x-access-token'];
//		var token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiI1NDYxZTY1ZDdkYjZhOTBjMWYwMDAwMDEiLCJleHAiOjE0MTU5OTU3MDA4NTF9.VWXp-Od-DP5YAZlmkFm3e0hpfrY3YFjcEqkOVHSD95w';
	
		if (token) {
					try {
							var decoded = jwt.decode(token, req.app.get('jwtTokenSecret'));
						
							if (decoded.exp <= Date.now()) {
											res.end('Access token has expired', 500);
											return false;
							} else {
											Account.findOne({ _id: decoded.iss }, function(err, user) {
													req.user = user;
											});
													
											return true;
							}

					} catch (err) {
									console.log(err)
									return next();
					}
		} else {
					next();
					return true;
		}
};