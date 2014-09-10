// BASE SETUP
// =============================================================================

// call the packages we need
var express    = require('express');
var bodyParser = require('body-parser');
var app        = express();
var querystring = require('querystring');
var cors = require('cors');

// configure app
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

var port     = process.env.PORT || 8080; // set our port

var mongoose   = require('mongoose');
mongoose.connect('mongodb://localhost/my_database'); // connect to our database
var Bear     = require('./app/models/bear');
var IngredientsMapper     = require('./app/models/ingredientsMapper');

var mysql      = require('mysql');
var connection = mysql.createConnection({
    multipleStatements: true,
    host     : 'localhost',
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
router.route('/test')

    .post(function(req, res) {

        var ingredientsMapper = {
            "allspice": 2001,
            "almond":  12061,
            "anchovies": 15002,
            "anise":  2002,
            "apple":  9003,
            "apricots":  9021,
            "armagnac":  70419,
            "arrowroot":  11697,
            "artichoke":  11007,
            "avocado":  9037,
            "bacon":  10124,
            "bamboo shoots":  11026,
            "basil":  2044,
            "beans":  11052,
            "beansprouts":  11718,
            "beef":  13292,
            "beer":  14003,
            "beetroot":  11081,
            "brandy":  70419,
            "breadcrumbs":  18079,
            "bread": 18075,
            "broccoli":  11090,
            "butter":  1001,
            "buttermilk":  1088,
            "squash":  11477,
            "cabbage":  11109,
            "capers":  2054,
            "carrot": 11124,
            "cashew":  12085,
            "celery":  11143,
            "cheese":  1009,
            "chicken":  5065,
            "chickpea":  16056,
            "chili":  16059,
            "chives":  11156,
            "chocolate":  19120,
            "chorizo":  7019,
            "cider":  9016,
            "coconut":  12104,
            "coriander":  11165,
            "cornflour":  20016,
            "courgettes":  11477,
            "crab":  15140,
            "crayfish":  15243,
            "cream":  1054,
            "cucumber":  11205,
            "curry":  2015,
            "dill":  2017,
            "duck":  5142,
            "egg":  1123,
            "eggs":  1123,
            "epazote":  11984,
            "flour":  20081,
            "frankfurter":  7022,
            "garlic":  11215,
            "ghee":  1003,
            "ginger":  2021,
            "gooseberries":  9107,
            "grapefruit":  9111,
            "grapes":  9131,
            "ham":  7029,
            "honey":  19296,
            "horseradish":  2055,
            "jaggery":  100136,
            "lamb":  17061,
            "leek":  11246,
            "lemon":  9150,
            "lentils":  16069,
            "lettuce":  11252,
            "lime":  9159,
            "liver":  13327,
            "lobster":  15148,
            "macaroni":  20099,
            "milk":  1079,
            "mint":  2065,
            "molasses":  19304,
            "mushroom":  11260,
            "sauce":  78746,
            "noodles":  20410,
            "nutmeg":  2025,
            "nut":  12635,
            "olive oil":  4053,
            "olives":  9193,
            "onion":  11282,
            "orange":  9200,
            "paprika":  2028,
            "parsley":  11297,
            "pasta":  20093,
            "peanut butter":  16098,
            "peanut":  16087,
            "pears":  9252,
            "pine nuts":  12147,
            "pork":  10061,
            "potato":  11352,
            "prawn":  15151,
            "prunes":  9291,
            "rhubarb":  9307,
            "rice":  20044,
            "rosemary":  2036,
            "saffron":  2037,
            "sage":  2038,
            "salami":  7068,
            "salmon":  15237,
            "sausage":  7064,
            "scallions":  11291,
            "spring onions":  11291,
            "sesame oil":  4058,
            "sesame seeds":  12023,
            "shallots":  11677,
            "sherry":  78905,
            "shiitake mushrooms":  11798,
            "shrimp":  15151,
            "sorrel":  11616,
            "sour cream":  1056,
            "spaghetti":  20093,
            "spam":  7276,
            "squash":  11477,
            "suet":  80066,
            "sugar":  19335,
            "sultanas":  9132,
            "sweetcorn":  11167,
            "sweet pepper":  11821,
            "taco shells":  18360,
            "tarragon":  2041,
            "tomato":  11529,
            "turkey":  5168,
            "veal":  17143,
            "venison":  80680,
            "vinegar":  2048,
            "walnut":  12154,
            "wine":  14084,
            "yeast":  18375,
            "blueberries": 9050,
            "strawberries": 9316,
            "vanilla extract": 2050
        };
        var mesure = [
            'pat',
            'tbsp',
            'cup',
            'stick',
            'oz',
            'cubic inch',
            'crumbled',
            'not packed',
            'diced',
            'shredded',
            'slice',
            'sliced',
            'melted',
            'wedge',
            'diced',
            'large curd',
            'small curd',
            'whipped',
            'small',
            'crumbled',
            'box',
            'gram',
            'pound',
            'ounce',
            'pint'
        ];

        var ingredients = req.body.ingredients.split("\n");
        var lines = {};
        var i;

        for (i in ingredients) {

            if (ingredients[i] != null && ingredients[i] != undefined && ingredients[i].trim().length > 0) {

                var line = {};
                var temp = ingredients[i].split(" ");

                if (temp.length > 3) {

                    if (isNaN(temp[0])) {
                        var split = temp[0].replace(/[^a-zA-Z0-9]/g,'_').split("_");
                        temp[0] = parseInt(split[0], 10) / parseInt(split[1], 10);
                    }

                    line.amount = eval(temp[0]);
                    line.measure = temp[1].trim();
                    line.measure = line.measure.replace('Tablespoons', 'tbsp').replace('tablespoons', 'tbsp').replace('Tablespoon', 'tbsp').replace('tablespoon', 'tbsp');
                    line.measure = line.measure.replace('pints', 'pint').replace('cups', 'cup').replace('cp', 'cup').replace('C', 'cup');

                    delete temp[0];
                    delete temp[1];

                    line.ingredient = temp.join(" ").trim();

                    var finded = false;
                    for (val in temp) {
                        if (ingredientsMapper[temp[val].replace(/[^a-zA-Z0-9]/g,'').toLowerCase().trim()] != undefined) {
                            line.ingredient = temp[val].replace(/[^a-zA-Z0-9]/g,'').toLowerCase().trim();
                            finded = true;
                        }
                    }

                    if (!finded) {
                        for (mapp in ingredientsMapper) {
                            if (line.ingredient.indexOf(mapp) > -1) {
                                line.ingredient = mapp;
                            }
                        }
                    }


                    delete temp;
                    lines[i] = line;

                } else {
                    lines[i] = {amount: null, measure: null, ingredient: ingredients[i].trim()};
                }
            }

        }

        res.json(lines);

    })

// ingredients mapper
// ----------------------------------------------------
router.route('/mapper')

    // map ingredients
    .post(function(req, res) {

        var ingredientsMapper = new IngredientsMapper();
        ingredientsMapper.name = req.body.name;
        ingredientsMapper.mysqlId = req.body.id;

        ingredientsMapper.save(function(err) {
            if (err)
                res.send(err);

            res.json({ message: 'Mapper created!' });
        });

    })

    // get all
    .get(function(req, res) {
        IngredientsMapper.find(function(err, bears) {
            if (err)
                res.send(err);

            res.json(bears);
        });
    });

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
console.log('Magic happens on port ' + port);
