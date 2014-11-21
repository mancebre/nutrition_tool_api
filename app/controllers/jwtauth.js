var Account = require('../models/account');
var jwt = require('jwt-simple');

module.exports = function(req, res, next) {

	var token = (req.body && req.body.access_token) || (req.query && req.query.access_token) || req.headers['x-access-token'];
//		var token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiI1NDYxZTY1ZDdkYjZhOTBjMWYwMDAwMDEiLCJleHAiOjE0MTU5OTU3MDA4NTF9.VWXp-Od-DP5YAZlmkFm3e0hpfrY3YFjcEqkOVHSD95w';

	if (token) {
		try {
			var decoded = jwt.decode(token, req.app.get('jwtTokenSecret'));

			if (decoded.exp <= Date.now()) {
				return res.send('Access token has expired', 500);
			} else {
				Account.findById(decoded.iss, function(err, user) {
					if (err) {
						console.log(err);
						return res.send('Ups, something has gone wrong.', 500);
					} else if (!user) {
						return res.send('User does not exist', 500);
					} else {
						req.user = user;
					}

				});
			}

			return true;

		} catch (err) {
			console.log(err);
			return next();
		}
	} else {
		res.end('Access token is missing', 500);
		return false;
	}
};