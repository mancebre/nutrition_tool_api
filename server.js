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

        var lines = recipeCorrection.populateData(ingredients);

        var oneLine;
        var keywords = [];
        var items = [];

        for (oneLine in lines) {
            keywords.push(lines[oneLine].ingredient.replace(/[^a-zA-Z0-9]/g, ' ').trim());
            items.push(oneLine);
        }

        // get food details by keywords
        function getFoodDetails(arg, keywords, callback) {

            keywordsArr = keywords.split(' '); //preparing full text query boolean mode
            keywords = '"';
            keywordsArr.forEach(function(keyword) {
                keywords += '+' + keyword + ' ';
            })
            keywords += '" IN BOOLEAN MODE';console.log("keywords", keywords);

            connection.query("SELECT `FOOD_DES`.`Long_Desc`, `ABBREV`.* FROM `FOOD_DES` JOIN ABBREV ON `FOOD_DES`.`NDB_No` = `ABBREV`.`NDB_No` WHERE MATCH (`FOOD_DES`.`Long_Desc`, `FOOD_DES`.`Shrt_Desc`) AGAINST (?) AND `FOOD_DES`.`ComName` IS NULL AND `FOOD_DES`.`ManufacName` IS NULL LIMIT 1;", [keywords], function(err, result)
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
        }//TODO: Put these two queries into one

        // get food measures
        function getMeasures(arg, id, callback) {

            connection.query("SELECT GROUP_CONCAT(`Msre_Desc` SEPARATOR '|#|') AS `Msre_Desc`, GROUP_CONCAT(`Gm_Wgt` SEPARATOR '|#|') AS `Gm_Wgt` FROM `WEIGHT` WHERE `NDB_No`=? AND `Amount`=1;", [id], function(err, result)
            {
                if (err){
                    console.log(err);
                    callback(err);
                }
                else {
                    if (result[0].Msre_Desc && result[0].Gm_Wgt){
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
//console.log(lines[i].measure, results[i].measures, results[i].weight);
                if (results[i].measures == undefined) {// TODO: OVO MORA DA BUDE PRECIZNIJE!!!
                    lines[i].measure = false;
                }

                if (results[i].measures != undefined && results[i].measures.indexOf(lines[i].measure) < 0) {
                    var measuresCount = results[i].measures.length;
                    var measuresLoop = 0;
                    results[i].measures.forEach(function (measure) { // if neither one element of object measures does not match with input measure
                        if (measure.indexOf(lines[i].measure) < 0) {
                            measuresLoop++;
                        }
                    })
                    if (measuresLoop == measuresCount) {
                        lines[i].measure = false;
                    }
                }
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

        function series(item, keyword) {

            if(item) {
                getFoodDetails( item, keyword, function(result) {
                    if (!result || result == undefined) {
                        return series(items.shift(), keywords.shift());
                    }
                    getMeasures(item, result.NDB_No, function(weightResult) {
                        if (!weightResult || weightResult == undefined) {
                            return series(items.shift(), keywords.shift());
                        }
                        result.measures = weightResult.Msre_Desc.split("|#|");
                        result.weight = weightResult.Gm_Wgt.split("|#|");
                        results.push(result);
                        return series(items.shift(), keywords.shift());
                    })
                });
            } else {
                return final();
            }
        }
        series(items.shift(), keywords.shift());

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
