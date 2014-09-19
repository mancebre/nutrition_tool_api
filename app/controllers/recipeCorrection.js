exports.test = function() {
	return "tralalala";
};

exports.populateData = function(ingredients) {

    var ingredientsMapper = require('../mappers/ingredientsMapper');
    var measuresMapper = require('../mappers/measuresMapper');
    var lines = {};
    var i;

    for (i in ingredients) {

        if (ingredients[i] != null && ingredients[i] != undefined && ingredients[i].trim().length > 0) {

            var line = {};
            ingredients[i] = ingredients[i].replace(" and ", " ").replace(" of ", " ").replace(".", "").replace(",", "").toLowerCase().trim();
            var temp = ingredients[i].split(" ");

            if (temp.length >= 3) {

                if (isNaN(temp[0])) {
                    var split = temp[0].replace(/[^a-zA-Z0-9]/g,'_').split("_");
                    temp[0] = parseInt(split[0], 10) / parseInt(split[1], 10);
                }

                line.amount = eval(temp[0]);
                line.measure = temp[1].trim();
                line.measure = line.measure.replace('Tablespoons', 'tbsp').replace('tablespoons', 'tbsp').replace('Tablespoon', 'tbsp').replace('tablespoon', 'tbsp').replace('tsp', 'tbsp').toLowerCase().trim();
                line.measure = line.measure.replace('pints', 'pint').replace('cups', 'cup').replace('cp', 'cup').replace('C', 'cup').toLowerCase().trim();

                line.keyword = temp.join(" ").trim();

                delete temp[0];
                delete temp[1];

                line.ingredient = temp.join(" ").trim();
                if (line.ingredient.indexOf(" or ") > -1) {
                    var tempIngredient = line.ingredient.split(" or ");
                    line.ingredient = tempIngredient[0];
                }
                line.ingredient = line.ingredient.replace(/[^a-zA-Z0-9]/g, ' ').trim();

                if (measuresMapper.indexOf(line.measure) == -1) {
                    line.ingredient = line.measure = ' ' + line.ingredient;
                    line.measure = null;
                }

                line.finded = false;

                for (val in temp) {
                    if (ingredientsMapper[temp[val].replace(/[^a-zA-Z0-9]/g,'').toLowerCase().trim()] != undefined) {
                        line.ingredient = temp[val].replace(/[^a-zA-Z0-9]/g,'').toLowerCase().trim();
                        line.finded = true;
                    }
                }

                //if (!finded) {
                //    for (mapp in ingredientsMapper) {
                //        if (line.ingredient.indexOf(mapp) > -1) {
                //            line.ingredient = mapp;
                //        }
                //    }
                //}

                delete temp;
                lines[i] = line;

            } else {
                lines[i] = {amount: null, measure: null, ingredient: ingredients[i].trim(), keyword: temp.join(" ").trim()};
            }
        }

    }

    return lines;
}