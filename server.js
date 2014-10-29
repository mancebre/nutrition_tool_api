// BASE SETUP
// =============================================================================

//get current time
var now = new Date();

// call the packages we need
var express     = require('express');
var bodyParser  = require('body-parser');
var app         = express();
var cors        = require('cors');


// configure app
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

var port        = process.env.PORT || 8080; // set our port

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

var mongoose = require('mongoose');
mongoose.connect('mongodb://'+host+'/my_database'); // connect to mongodb TODO: give database some name :)

var Bear = require('./app/models/bear');
// var IngredientsMapper = require('./app/models/ingredientsMapper');

var connection = require('./app/models/sr26Model');

// ROUTES FOR OUR API
// =============================================================================

// create our router
var router = express.Router();

// middleware to use for all requests
router.use(function(req, res, next) {
	// do logging
	console.log(now + ' Something is happening.');
	next();
});

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
	res.json({ message: 'hooray! welcome to our api!' });
});

// measure search
// ----------------------------------------------------
router.route('/measuresearch/:number')

    .get(function(req, res) {

        if (req.params.number == 'all') {
            var measuresMapper = require('./app/mappers/measuresMapper');
            res.json({ result: measuresMapper })
        } else {
            var query, number = req.params.number;

            query = "SELECT `Msre_Desc` FROM `WEIGHT` WHERE `NDB_No`="+connection.escape(number)+";";

            connection.query(query, function(err, result) {
                if (err){
                    console.log(err);
                    res.json({ message: 'Ups, something has gone wrong.', error: err });
                }
                else {
                    var resultArr = [];
                    result.forEach(function(val) {/* convert result to array */
                        resultArr.push(val.Msre_Desc);
                    });

                    res.json({ result: resultArr });
                }

            });
        }

    })

// ingredient search
// ----------------------------------------------------
router.route('/ingredientsearch/:ingredient')

    .get(function(req, res) {

        var query, ingredient = req.params.ingredient;

        query = "SELECT NDB_No, `Long_Desc` FROM `FOOD_DES` WHERE MATCH (`Long_Desc`) AGAINST (" + connection.escape(ingredient) + ") LIMIT 7;";

        connection.query(query, function(err, result) {
            if (err){
                console.log(err);
                res.json({ message: 'Ups, something has gone wrong.', error: err });
            }
            else {
                res.json({ result: result });
            }

        });
    })

// recipe check
// ----------------------------------------------------
router.route('/recipecheck')

    .post(function(req, res) {

        var recipeCorrection = require('./app/controllers/recipeCorrection');
        var recipeCalcHelper = require('./app/helpers/recipeCalcHelper');

        var ingredients = req.body.ingredients.split("\n").filter(function(e){return e}); // Split text by line and remove empty lines

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

            var measureIsGram = false;
            var gramArr = ['g', 'grams', 'gram', 'gr'];

            var keywordsArr = keywords.split(' '); //preparing full text query boolean mode
            keywordsArr = recipeCorrection.keywordFix(keywordsArr);
            var keywords = "";
            keywordsArr.forEach(function(keyword) {
                // not sure about this
                //if (keyword.substring(keyword.length-1) == "s") {
                //    keywords += '+' + recipeCalcHelper.removeLastChar(keyword, "s") + ' ';
                //} else {
                //    keywords += '+' + keyword + ' ';
                //}

                keywords += '+' + keyword + ' ';
            })

            measures = measures.toLowerCase().trim();
            var measuresArr = measures.split(" ");
            var subquery = '';

            for (var key in measuresArr) {
                measuresArr[key] = "%" + measuresArr[key] + "%";
                subquery += "AND `WEIGHT`.`Msre_Desc` LIKE "+connection.escape(measuresArr[key])+" ";
            }

            if (gramArr.indexOf(measures) >= 0) { // If the user has entered gram as the unit of measurement do not query table WEIGHT
                measureIsGram = true;
            }

            measures = '%' + measures + '%';
            keywords = connection.escape(keywords);

            // building of query
            var query = "";
            if (measureIsGram) {
                query += "SELECT `FOOD_DES`.`Long_Desc`, `ABBREV`.* FROM `FOOD_DES` ";
            } else {
                query += "SELECT `FOOD_DES`.`Long_Desc`, `WEIGHT`.`Msre_Desc`, `WEIGHT`.`Amount`, `WEIGHT`.`Gm_Wgt`, `ABBREV`.* FROM `FOOD_DES` ";
            }
            query += "JOIN `ABBREV` ON `FOOD_DES`.`NDB_No` = `ABBREV`.`NDB_No` ";
            if (!measureIsGram) {
                query += "JOIN `WEIGHT` ON `FOOD_DES`.`NDB_No` = `WEIGHT`.`NDB_No` ";
            }
            query += "WHERE MATCH (`FOOD_DES`.`Long_Desc`) AGAINST ("+keywords+" IN BOOLEAN MODE) ";
            if (!measureIsGram) {
                query += subquery;
            }

            query += "LIMIT 1;";

            connection.query(query, function(err, result)
            {
                if (err){
                    console.log(err);
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

            var result = {};

            for (i in results) {
                if (lines[i] != undefined) { // && !lines[i].finded
                    lines[i].ingredient = results[i].Long_Desc;
                }

                if (results[i].Long_Desc == null) {
                    lines[i].ingredientFound = 'Not Founded';
                } else {
                    lines[i].ingredientFound = results[i].Long_Desc;
                }
                if (results[i].Msre_Desc == null) {
                    lines[i].measureFound = 'Not Founded';
                } else {
                    lines[i].measureFound = results[i].Msre_Desc;
                }
                if (isNaN(lines[i].amount)) {
                    lines[i].amountFound = 'Not Founded';
                } else {
                    lines[i].amountFound = lines[i].amount;
                }
                lines[i].no = results[i].NDB_No;
            }

            result.ingredients = lines;
            result.recipeSum = recipeCorrection.recipeSum(results, lines);

            res.json(result);
        }

        // A simple async series:
        var results = [];

        function series(item, keyword, measure) {

            if(item) {
                getFoodDetails( item, keyword, measure, function(result) {
                    if (!result || result == undefined) {
                        result = recipeCorrection.defineEmptyResult();
                        results.push(result);
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
console.log('Server started at: ' + now + '. Port: ' + port);

