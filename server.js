// BASE SETUP
// =============================================================================

// call the packages we need
var express    = require('express');
var bodyParser = require('body-parser');
var app        = express();
var cors = require('cors');

// configure app
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

var port     = process.env.PORT || 8080; // set our port

//get server ip
var os = require('os')

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

var mongoose = require('mongoose');
mongoose.connect('mongodb://'+host+'/my_database'); // connect to mongodb

var Bear = require('./app/models/bear');
// var IngredientsMapper = require('./app/models/ingredientsMapper');

var mysql      = require('mysql');
var connection = mysql.createConnection({
    multipleStatements: true,
    host     : host,
    user     : 'root',
    password : 'vitezkoja',
    port : 3306, //port mysql
    database:'sr26'
});

// ROUTES FOR OUR API
// =============================================================================

// create our router
var router = express.Router();

// middleware to use for all requests
router.use(function(req, res, next) {
	// do logging
	console.log('Something is happening.');
	next();
});

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
	res.json({ message: 'hooray! welcome to our api!' });	
});

// test mysql
// ----------------------------------------------------
router.route('/recipecheck')

    .post(function(req, res) {

        var ingredients = req.body.ingredients.split("\n");
        var recipeCorrection = require('./app/controllers/recipeCorrection');
        var recipeCalcHelper = require('./app/helpers/recipeCalcHelper');

        var lines = recipeCorrection.populateData(ingredients);

        var oneLine;
        var keywords = [];
        var measures = [];
        var items = [];

        for (oneLine in lines) {
            keywords.push(lines[oneLine].ingredient.replace(/[^a-zA-Z0-9]/g, ' ').trim());
            measures.push(lines[oneLine].measure.replace(/[^a-zA-Z0-9]/g, ' ').trim());
            items.push(oneLine);
        }

        // get food details by keywords
        function getFoodDetails(arg, keywords, measures, callback) {

            keywordsArr = keywords.split(' '); //preparing full text query boolean mode
            keywords = '"';
            keywordsArr.forEach(function(keyword) {
                if (keyword.substring(keyword.length-1) == "s") {
                    keywords += '+' + keyword + ' ' + '+' + recipeCalcHelper.removeLastChar(keyword, "s") + ' ';
                } else {
                    keywords += '+' + keyword + ' ';
                }

            })
            keywords += '" IN BOOLEAN MODE';
            measures = '%' + measures + '%';

            var query = "" +
                "SELECT `FOOD_DES`.`Long_Desc`, `WEIGHT`.`Msre_Desc`, `WEIGHT`.`Amount`, `WEIGHT`.`Gm_Wgt`, `ABBREV`.* FROM `FOOD_DES` " +
                "JOIN `ABBREV` ON `FOOD_DES`.`NDB_No` = `ABBREV`.`NDB_No` " +
                "JOIN `WEIGHT` ON `FOOD_DES`.`NDB_No` = `WEIGHT`.`NDB_No` " +
                    "WHERE MATCH (`FOOD_DES`.`Long_Desc`) AGAINST ("+keywords+") " +
                    "AND `WEIGHT`.`Msre_Desc` LIKE '"+measures+"' " +
                "LIMIT 1;";
            console.log(query);
            console.log('---------------');
            connection.query(query, function(err, result)// TODO: test with all measure units in all scenarios
            {
                if (err){
                    console.log(err);
                    callback(err);
                }
                else {
                    if (Object.keys(result).length > 0){
                        callback(result[0]);
                    } else {
                        callback(false);
                    }
                }

            });
        }

        // Final task (same in all the examples)
        function final() {

            for (i in results) {
console.log(results[i].Long_Desc);
//                if (results[i].measures == undefined) {
//                    lines[i].measure = false;
//                }
//console.log(lines[i].measure, results[i].measures, results[i].weight);

                if (lines[i] != undefined) { // && !lines[i].finded
                    lines[i].ingredient = results[i].Long_Desc;
                }
            }
            lines.result = recipeCorrection.recipeSum(results, lines);
            res.json(lines);
        }

        // A simple async series:
        var results = [];

        function series(item, keyword, measure) {

            if(item) {
                getFoodDetails( item, keyword, measure, function(result) {
                    if (!result || result == undefined) {
                        return series(items.shift(), keywords.shift(), measures.shift());
                    }
                    results.push(result);
                    return series(items.shift(), keywords.shift(), measures.shift());
                });
            } else {
                return final();
            }
        }
        series(items.shift(), keywords.shift(), measures.shift());

    })

// on routes that end in /bears
// ----------------------------------------------------
router.route('/bears')

	// create a bear (accessed at POST http://localhost:8080/bears)
	.post(function(req, res) {
		
		var bear = new Bear();		// create a new instance of the Bear model
		bear.name = req.body.name;  // set the bears name (comes from the request)

		bear.save(function(err) {
			if (err)
				res.send(err);

			res.json({ message: 'Bear created!' });
		});

		
	})

	// get all the bears (accessed at GET http://localhost:8080/api/bears)
	.get(function(req, res) {
		Bear.find(function(err, bears) {
			if (err)
				res.send(err);

			res.json(bears);
		});
	});

// on routes that end in /bears/:bear_id
// ----------------------------------------------------
router.route('/bears/:bear_id')

	// get the bear with that id
	.get(function(req, res) {
		Bear.findById(req.params.bear_id, function(err, bear) {
			if (err)
				res.send(err);
			res.json(bear);
		});
	})

	// update the bear with this id
	.put(function(req, res) {
		Bear.findById(req.params.bear_id, function(err, bear) {

			if (err)
				res.send(err);

			bear.name = req.body.name;
			bear.save(function(err) {
				if (err)
					res.send(err);

				res.json({ message: 'Bear updated!' });
			});

		});
	})

	// delete the bear with this id
	.delete(function(req, res) {
		Bear.remove({
			_id: req.params.bear_id
		}, function(err, bear) {
			if (err)
				res.send(err);

			res.json({ message: 'Successfully deleted' });
		});
	});


// REGISTER OUR ROUTES -------------------------------
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port + '. Host is: ' + host);
