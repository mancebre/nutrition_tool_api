// ROUTES FOR OUR API
// =============================================================================

//get current time
var now = new Date();

var express     = require('express');
var moment 	    = require('moment');
var jwt 	    = require('jwt-simple');

var img         = require('easyimage');

// create our router
var router = express.Router();

var jwtauth = require('./controllers/jwtauth.js');

var Bear = require('./models/bear');
var Recipe = require('./models/recipe');
var MenuCategory = require('./models/menu_category');
var CompanyProfile = require('./models/company_profile');
var accountManager = require('./controllers/account-manager');
var emailDispatcher = require('./models/email-dispatcher');
var Account = require('./models/account');

module.exports = function(app) {

    /* Returns user id if token is defined. */
    function getUserId(req, res) {
        var token = (req.body && req.body.access_token) || (req.query && req.query.access_token) || req.headers.access_token;
        var decoded = jwt.decode(token, req.app.get('jwtTokenSecret'));

        if(!decoded.iss || typeof decoded.iss === undefined ) {
            console.log("Missing user id!!!");
        }

        if(!token) {
            console.log("Missing access token!!!");
        }

        return decoded.iss;
    }

    // middleware to use for all requests
    router.use(function(req, res, next) {
        // do logging
        console.log(now + ' Something is happening.');
        next();
    });

    // test route to make sure everything is working (accessed at GET http://localhost:8080/)
    router.get('/', function(req, res) {
        res.json({ message: 'hooray! welcome to our api!' });
    });

    /* Image Upload */
    router.route('/upload_image')

        // Upload image
        // ----------------------------------------------------
        .post(function(req, res, next){
            if(jwtauth(req, res, next) === true) {

                res.send(req.files);
            }
        });

    /* Recipe Dashboard */
    router.route('/recipe')

        // Add new recipe
        // ----------------------------------------------------
        .post(function(req, res, next){
            if(jwtauth(req, res, next) === true) {
                var userId = getUserId(req, res);
                var recipe = new Recipe();
                recipe.user_id = userId;
                recipe.name = req.param('name');
                recipe.servings = req.param('servings');
                recipe.ingredients = req.param('ingredients');
                recipe.directions = req.param('directions');
                recipe.category = req.param('category');
                recipe.image0 = req.param('image0');
                recipe.image1 = req.param('image1');
                recipe.image2 = req.param('image2');
                recipe.image3 = req.param('image3');
                recipe.date = moment().format('MMMM Do YYYY, h:mm:ss a');
                recipe.verified = 0;
                recipe.archive = 0;

                /* Verification of the entered data */
                if (typeof recipe.name === 'undefined' || recipe.name.trim() === '') {
                    res.send("Name is missing or undefined", 422);
                } else if (typeof recipe.servings === 'undefined' || recipe.servings < 0) {
                    res.send('"Number of Servings" is missing or undefined and must be greater than zero', 422);
                } else if (isNaN(recipe.servings)) {
                    res.send('"Number of Servings" must be number', 422);
                } else if (typeof recipe.ingredients === 'undefined' || recipe.ingredients.trim() === '') {
                    res.send('Ingredients is missing or undefined', 422);
                } else if (typeof recipe.directions === 'undefined' || recipe.directions.trim() === '') {
                    res.send('Directions is missing or undefined', 422);
                } else if (typeof recipe.category === 'undefined' || recipe.category.trim() === '') {
                    res.send('Category is missing or undefined', 422);
                } else {
                    recipe.save(function(err) {
                        if (err) {
                            res.send(err);
                        }

                        res.json({ message: 'Recipe saved!' });
                    });
                }
            }

        })

        // Get all recipes
        // ----------------------------------------------------
        .get(function(req, res, next){
            if(jwtauth(req, res, next) === true) {
                var userId = getUserId(req, res);
                if (req.query.filter1 === 'newest' || req.query.filter1 === 'oldest') {
                    var dateSort = req.query.filter1 === 'newest' ? -1 : 1;
                    var sort = {'_id': dateSort};
                } else {
                    var nameSort = req.query.sort === "Z-A" ? -1 : 1;
                    var sort = {'name': nameSort};
                }

                if (typeof req.query.filter2 !== 'undefined') {
                    var verified = req.query.filter2 === 'verified' ? 1 : 0;
                } else {
                    var verified = 0;
                }

                if (typeof req.query.group !== 'undefined') {
                    var group = req.query.group;
                    var search = {user_id: userId, 'verified': verified, archive : 0, category : group.trim()};
                } else {
                    var search = {user_id: userId, 'verified': verified, archive : 0};
                }

                var page = parseInt(req.query.page.trim()) - 1;
                var limit = 12;
                var skip = (page > 0) ? limit * page : 0;
                Recipe.find(search).sort(sort).skip(skip).limit(limit).exec(function(err, recipes) {
                    Recipe.count(search).exec(function(err, count) {

                        if (err) {
                            res.send(err, 500);
                        }

                        res.send('recipes', {
                            recipes: recipes,
                            page: page + 1,
                            count: count,
                            limit: limit,
                            skip: skip
                        });
                    });

                    // res.json(recipes);
                });
            }
        });

    // Get one recipe
    // ----------------------------------------------------
    router.route('/recipe/:recipe_id')

        // get recipe by id
        .get(function(req, res, next){
            if(jwtauth(req, res, next) === true) {
                var userId = getUserId(req, res);
                Recipe.findOne({$and:[{user_id:userId}, {_id:req.params.recipe_id}]}, function(err, recipe) {
                    if (err){
                        res.send(err, 500);
                    }

                    if (recipe) {
                        MenuCategory.find({user_id: userId}).exec(function (err, categories) {
                            if (err) {
                                console.log(err);
                            }

                            res.json({recipe: recipe, categories: categories});
                        });
                    } else {
                        res.json({message:"Requested recipe does not exist."});
                    }
                });
            }
        })

        // update recipe with this id
        .put(function(req, res, next) {
            if(jwtauth(req, res, next) === true) {
                var userId = getUserId(req, res);
                Recipe.findOne({$and:[{user_id:userId}, {_id:req.params.recipe_id}]}, function(err, recipe) {

                    if (err) {
                        res.send(err);
                    }

                    recipe.user_id = userId;
                    recipe.verified = 0;
                    recipe.archive = 0;

                    /* Verification of the entered data */
                    if (typeof req.param('name') !== 'undefined' && req.param('name').trim() !== '') {
                        recipe.name = req.param('name');
                    }
                    if (typeof req.param('servings') !== 'undefined' && req.param('servings') > 0) {
                        recipe.servings = req.param('servings');
                    }
                    if (typeof req.param('ingredients') !== 'undefined' && req.param('ingredients').trim() !== '') {
                        recipe.ingredients = req.param('ingredients');
                    }
                    if (typeof req.param('directions') !== 'undefined' && req.param('directions').trim() !== '') {
                        recipe.directions = req.param('directions');
                    }
                    if (typeof req.param('category') !== 'undefined' && req.param('category').trim() !== '') {
                        recipe.category = req.param('category');
                    }
                    if (typeof req.param('image0') !== 'undefined' && req.param('image0').trim() !== '') {
                        recipe.image0 = req.param('image0');
                    }
                    if (typeof req.param('image1') !== 'undefined' && req.param('image1').trim() !== '') {
                        recipe.image1 = req.param('image1');
                    }
                    if (typeof req.param('image2') !== 'undefined' && req.param('image2').trim() !== '') {
                        recipe.image2 = req.param('image2');
                    }
                    if (typeof req.param('image3') !== 'undefined' && req.param('image3').trim() !== '') {
                        recipe.image3 = req.param('image3');
                    }

                    recipe.save(function(err) {
                        if (err) {
                            res.send(err);
                        }

                        res.json({ message: 'Recipe updated!' });
                    });

                });
            }
        })

        // delete the recipe with this id
        .delete(function(req, res, next) {
            if(jwtauth(req, res, next) === true) {
                var userId = getUserId(req, res);
                Recipe.remove({$and:[{user_id:userId}, {_id:req.params.recipe_id}]}, function(err, recipe) {
                    if (err) {
                        res.send(err, 500);
                    }

                    res.json({ message: 'Successfully deleted' });
                });
            }
        });

    // Duplicate recipes
    // ----------------------------------------------------
    router.route('/duplicate')

        .post(function(req, res, next){
            if(jwtauth(req, res, next) === true) {
                var mongoose = require('mongoose');
                var ids = req.param('recipeIds');

                var clones = {};
                var count = 0;
                ids.forEach(function(id) {
                    Recipe.findById(id).exec(
                        function(err, doc) {

                            if (err) {
                                res.send(err, 500);
                            }

                            doc._id = mongoose.Types.ObjectId();
                            doc.isNew = true; //<--------------------IMPORTANT
                            doc.date = moment().format('MMMM Do YYYY, h:mm:ss a');
                            doc.name = doc.name + " copy",

                            clones[count] = doc;

                            doc.save(count++);

                            if (count === ids.length) {
                                setTimeout(function() {
                                    res.json(clones);
                                }, 500);
                            }
                        }
                    );
                });
            }
        });

    // Archive recipes
    // ----------------------------------------------------
    router.route('/archive')

        .post(function(req, res, next){
            if(jwtauth(req, res, next) === true) {
                var ids = req.param('recipeIds');

                Recipe.update(
                    { _id: { $in: ids } },
                    { $set: { archive : 1 } },
                    {multi: true},
                    function(err, rows) {
                        if (err) {
                            console.log(err);
                        } else {
                            res.json(rows);
                        }
                    }
                );
            }
        });

    // Company Profile
    // ----------------------------------------------------
    router.route('/company/profile')

        .post(function(req, res, next){
            if(jwtauth(req, res, next) === true) {
                var userId = getUserId(req, res);
                var name = req.param('name');
                var webSite = req.param('web-site');
                var country = req.param('country');
                var state = req.param('state');
                var city = req.param('city');
                var address = req.param('address');
                var zipCode = req.param('zip-code');
                var phoneNumber = req.param('phone-number');
                var image = req.param('image0');

                var profile = new CompanyProfile();

                if (typeof name !== "undefined" && name.trim() !== "") {
                    profile.name = name;
                }
                if (typeof webSite !== "undefined" && webSite.trim() !== "") {
                    profile.webSite = webSite;
                }
                if (typeof country !== "undefined" && country.trim() !== "") {
                    profile.country = country;
                }
                if (typeof state !== "undefined" && state.trim() !== "") {
                    profile.state = state;
                }
                if (typeof city !== "undefined" && city.trim() !== "") {
                    profile.city = city;
                }
                if (typeof address !== "undefined" && address.trim() !== "") {
                    profile.address = address;
                }
                if (typeof zipCode !== "undefined" && zipCode.trim() !== "") {
                    profile.zipCode = zipCode;
                }
                if (typeof phoneNumber !== "undefined" && zipCode.trim() !== "") {
                    profile.phoneNumber = phoneNumber;
                }
                if (typeof image !== "undefined" && image.trim() !== "") {
                    profile.image = phoneNumber;
                }
                profile.user_id = userId;
                profile.date = moment().format('MMMM Do YYYY, h:mm:ss a');

                profile.save(function(err) {
                    if (err) {
                        console.log(err);
                        res.send(err);
                    }

                    res.json({ message: 'Company Profile Saved' });
                });
            }
        })

        .get(function(req, res, next){
            if(jwtauth(req, res, next) === true) {
                var userId = getUserId(req, res);

                CompanyProfile.findOne({user_id:userId}, function(err, result) {
                    if (err){
                        res.send(err, 500);
                    }

                    if (result) {
                        res.json(result);
                    } else {
                        res.json({message:"Requested profile does not exist."});
                    }
                });
            }
        });


    router.route('/company/profile/:id')
        .put(function(req, res, next) {
            if(jwtauth(req, res, next) === true) {
                var userId = getUserId(req, res);

                var userId = getUserId(req, res);
                var name = req.param('name');
                var webSite = req.param('web-site');
                var country = req.param('country');
                var state = req.param('state');
                var city = req.param('city');
                var address = req.param('address');
                var zipCode = req.param('zip-code');
                var phoneNumber = req.param('phone-number');
                var image = req.param('image0');

                CompanyProfile.findOne({user_id:userId}, function(err, profile) {
                    if (err){
                        res.send(err, 500);
                    }

                    if (profile) {
                        if (typeof name !== "undefined" && name.trim() !== "" && profile.name !== name) {
                            profile.name = name;
                        }
                        if (typeof webSite !== "undefined" && webSite.trim() !== "" && profile.webSite !== webSite) {
                            profile.webSite = webSite;
                        }
                        if (typeof country !== "undefined" && country.trim() !== "" && profile.country !== country) {
                            profile.country = country;
                        }
                        if (typeof state !== "undefined" && state.trim() !== "" && profile.state !== state) {
                            profile.state = state;
                        }
                        if (typeof city !== "undefined" && city.trim() !== "" && profile.city !== city) {
                            profile.city = city;
                        }
                        if (typeof address !== "undefined" && address.trim() !== "" && profile.address !== address) {
                            profile.address = address;
                        }
                        if (typeof zipCode !== "undefined" && zipCode.trim() !== "" && profile.zipCode !== zipCode) {
                            profile.zipCode = zipCode;
                        }
                        if (typeof phoneNumber !== "undefined" && phoneNumber.trim() !== "" && profile.phoneNumber !== phoneNumber) {
                            profile.phoneNumber = phoneNumber;
                        }
                        if (typeof image !== "undefined" && image.trim() !== "" && profile.image !== image) {
                            profile.image = image;
                        }
                        profile.updated = moment().format('MMMM Do YYYY, h:mm:ss a');

                        profile.save(function(err) {
                            if (err) {
                                res.send(err);
                            }

                            res.json({ message: 'Profile updated!' });
                        });
                    } else {
                        res.json({message:"Ups, something has gone wrong."});
                    }
                });
            }
        });

    // Menu Category
    // ----------------------------------------------------
    router.route('/menu_category')

        .post(function(req, res, next){
            if(jwtauth(req, res, next) === true) {
                var newCategory = req.param('new-group');

                if (typeof newCategory !== "undefined" && newCategory.trim() !== "") {
                    var userId = getUserId(req, res);
                    var category = new MenuCategory();
                    category.user_id = userId;
                    category.name = newCategory;
                    category.date = moment().format('MMMM Do YYYY, h:mm:ss a');

                    category.save(function(err) {
                        if (err) {
                            console.log(err);
                            res.send(err);
                        }

                        res.json({ message: 'New Category Saved!' });
                    });
                } else {
                    res.send(400);
                }

                res.json(newCategory);
            }
        })

        // Get all categories
        // ----------------------------------------------------
        .get(function(req, res, next){
            if(jwtauth(req, res, next) === true) {
                var userId = getUserId(req, res);
                MenuCategory.find({user_id: userId}).exec(function (err, categories) {
                    if (err) {
                        console.log(err);
                    }

                    res.json({ categories : categories });
                });
            }
        });

    router.route('/menu_category/:cat_id')
        // Update category name
        // ----------------------------------------------------
        .put(function(req, res, next){
            if(jwtauth(req, res, next) === true) {
                var userId = getUserId(req, res);
                MenuCategory.findOne({$and:[{user_id:userId}, {_id:req.params.cat_id}]}, function(err, category) {

                    if (err) {
                        res.send(err);
                    }

                    category.name = req.param('category_name');

                    category.save(function(err) {
                        if (err) {
                            res.send(err);
                        }

                        res.json({ message: 'Category updated!' });
                    });

                });
            }
        })

        // Delete category
        // ----------------------------------------------------
        .delete(function(req, res, next) {
            if(jwtauth(req, res, next) === true) {
                MenuCategory.remove({
                    _id: req.params.cat_id
                }, function (err, category) {
                    if (err)
                        res.send(err);

                    res.json({message: 'Successfully deleted'});
                });
            }
        });


    /* authentication */

    // user login
    // ----------------------------------------------------
    router.route('/account/login')

        .post(function(req, res){
            var email = req.param('email');
            var pass = req.param('pass');
            var userData = {};
            accountManager.manualLogin(email, pass, function(e, o){
                if (!o){
                    res.send(e, 401);
                } else{
                    var expires = moment().add(1, 'day').valueOf();
                    var token = jwt.encode({
                        iss: o._id,
                        exp: expires
                    }, app.get('jwtTokenSecret'));

                    /* Transferring data to a new object so we could avoid sending hashed passwords to users */
                    userData.email  = o.email;
                    userData.user   = o.user;
                    userData.role   = o.role;
                    userData.date   = o.date;
                    userData._id    = o._id;

                    res.json({
                        token : token,
                        expires: expires,
                        user: userData
                    });
                }
            });
        });


    // creating new accounts
    // ----------------------------------------------------
    router.route('/account/signup')

        .post(function(req, res){

            var email = req.param('email');
            var user = req.param('user');
            var pass = req.param('pass');
            var repass = req.param('repass');

            /* Verification of the entered data */
            if (typeof email === 'undefined' || email.trim() === '') {
                res.send("Email is missing or undefined", 422);
            } else if (!accountManager.emailValidator(email)) {
                res.send("Email format is not valid", 422);
            } else if (typeof user === 'undefined' || user.trim() === '') {
                res.send("User is missing or undefined", 422);
            } else if (typeof pass === 'undefined' || pass.trim() === '') {
                res.send("Password is missing or undefined", 422);
            } else if (typeof repass === 'undefined' || repass.trim() === '') {
                res.send("Retype password is missing or undefined", 422);
            } else if (pass != repass) {
                res.send("Password is not equal with Retype password", 422);
            } else {
                accountManager.addNewAccount({
                    email   : email,
                    user    : user,
                    pass    : pass,
                    role    : 'user'
                }, function(e){
                    if (e){
                        res.send(e, 500);
                    }	else{
                        res.json({message: 'You have successfully registered your account.'});
                    }
                });
            }

        });

    // password reset
    // ----------------------------------------------------
    router.route('/account/lost-password')

        .post(function(req, res, next){

            // look up the user's account via their email //
            accountManager.getAccountByEmail(req.param('email'), function(o){
                if (o){
                    // res.send('ok', 200);
                    emailDispatcher.dispatchResetPasswordLink(o, function(e, m){
                        // this callback takes a moment to return //
                        // should add an ajax loader to give user feedback //
                        if (!e) {
                            res.send(200);
                        } else{
                            res.send('email-server-error', 500);
                            for (var k in e) console.log('error : ', k, e[k]);
                        }
                    });
                } else{
                    res.send('email-not-found', 422);
                }
            });
        });


    router.route('/account/reset-password') /* TODO: ADD SECURITY TOKEN WHICH WILL EXPIRE IN 24 HOURS AND WHICH WILL BE CHECKED WHEN PASSWORD RESET LINK IS CHECKED AND WHEN NEW PASSWORD IS SAVED. */

        .get(function(req, res, next){

            var email = req.query["e"];
            var passH = req.query["p"];
            accountManager.validateResetLink(email, passH, function(e){
                if (e != 'ok'){
                    res.send('Invalid password reset link', 400);
                } else{
                    res.send(200); /* After this response you can redirect user to password reset page (on app side) */
                }
            });
        })

        .post(function(req, res, next){

            var nPass = req.param('pass'); /* NEW password */
            var email = decodeURIComponent(req.param('email'));

            if (!nPass || nPass === '') {
                res.send('New password field is empty', 400);
            } else {
                accountManager.updatePassword(email, nPass, function(e, o){
                        if (!e){
                            res.send('ok', 200);
                        } else{
                            console.log(e);
                            res.send('Unable to update password', 400);
                        }
                });
            }

        });

    router.route('/account/print')

        .get(function(req, res, next){

            if(jwtauth(req, res, next) === true) {
                accountManager.getAllRecords( function(e, accounts){
                    res.send({ accts : accounts });
                });

            }
        });

    router.route('/account/delete')

        .post(function(req, res, next){


            if(jwtauth(req, res, next) === true) {
                var id = req.body.id;

                if (typeof id == "undefined" || id.length != 24) {
                    res.send('invalid id', 422);
                } else {
                    accountManager.deleteAccount(req.body.id, function(e, obj){
                        if (!e){
                            //res.clearCookie('user');
                            //res.clearCookie('pass');
                            req.session.destroy(function(e){ res.send('ok', 200); });
                        } else{
                            res.send('record not found', 422);
                        }
                    });
                }
            }

        });

    router.route('/account/details')
        .get(function(req, res, next){
            if(jwtauth(req, res, next) === true) {
                var userId = getUserId(req, res);
                Account.findById(userId).exec(function (err, account) {
                    if (err) {
                        console.log(err);
                    }

                    res.json( account );
                });
            }
        });

    router.route('/account/details/:id')
        .put(function(req, res, next) {
            if(jwtauth(req, res, next) === true) {
                var userId = getUserId(req, res);

                var name = req.param('name');
                var company_role = req.param('company_role');
                var email = req.param('email');
                var full_name = req.param('full_name');
                var phone = req.param('phone');
                var image = req.param('image0');

                Account.findById(userId, function(err, account) {
                    if (err){
                        res.send(err, 500);
                    }

                    if (account) {
                        if (typeof name !== "undefined" && name.trim() !== "" && account.name !== name) {
                            account.name = name;
                        }
                        if (typeof company_role !== "undefined" && company_role.trim() !== "" && account.company_role !== company_role) {
                            account.company_role = company_role;
                        }
                        if (typeof email !== "undefined" && email.trim() !== "" && account.email !== email) {
                            account.email = email;
                        }
                        if (typeof full_name !== "undefined" && full_name.trim() !== "" && account.full_name !== full_name) {
                            account.full_name = full_name;
                        }
                        if (typeof phone !== "undefined" && phone.trim() !== "" && account.phone !== phone) {
                            account.phone = phone;
                        }
                        if (typeof image !== "undefined" && image.trim() !== "" && account.image !== image) {
                            account.image = image;
                        }
                        account.updated = moment().format('MMMM Do YYYY, h:mm:ss a');

                        account.save(function(err) {
                            if (err) {
                                res.send(err);
                            }

                            res.json({ message: 'Account updated!' });
                        });
                    } else {
                        res.json({message:"Ups, something has gone wrong."});
                    }
                });
            }
        });

    //app.get('/account//reset', function(req, res) {
    //    accountManager.delAllRecords(function(){
    //        res.send('ok', 200);
    //    });
    //});


    // measure search
    // ----------------------------------------------------
    router.route('/measuresearch/:number')

        .get(function(req, res) {

            if (req.params.number == 'all') {
                var measuresMapper = require('./mappers/measuresMapper');
                res.json({ result: measuresMapper });
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

        });

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
        });

    // recipe check
    // ----------------------------------------------------
    router.route('/recipecheck')

        .post(function(req, res) {

            var recipeCorrection = require('./controllers/recipeCorrection');
            var recipeCalcHelper = require('./helpers/recipeCalcHelper');

            var ingredients = req.body.ingredients.split("\n").filter(function(e){return e;}); // Split text by line and remove empty lines

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
                keywords = "";
                keywordsArr.forEach(function(keyword) {
                    // not sure about this
                    //if (keyword.substring(keyword.length-1) == "s") {
                    //    keywords += '+' + recipeCalcHelper.removeLastChar(keyword, "s") + ' ';
                    //} else {
                    //    keywords += '+' + keyword + ' ';
                    //}

                    keywords += '+' + keyword + ' ';
                });

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

                for (var i in results) {
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
    app.use('/', router);

};
