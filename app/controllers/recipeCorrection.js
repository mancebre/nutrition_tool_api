
exports.populateData = function(ingredients) {

    //var ingredientsMapper = require('../mappers/ingredientsMapper');
    //var measuresMapper = require('../mappers/measuresMapper');
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
                line.measure = temp[1].trim().toLowerCase();
                line.measure = line.measure.replace('tablespoons', 'tbsp').replace('tablespoon', 'tbsp');
                line.measure = line.measure.replace('pints', 'pint').replace('cups', 'cup').replace('cp', 'cup');
                line.measure = line.measure.replace('teaspoon', 'tsp').replace('teaspoons', 'tsp');
                if (line.measure.length == 1) {
                    line.measure = line.measure.replace('c', 'cup');
                }

                line.keyword = temp.join(" ").trim();

                delete temp[0];
                delete temp[1];

                line.ingredient = temp.join(" ").trim();
                if (line.ingredient.indexOf(" or ") > -1) {
                    var tempIngredient = line.ingredient.split(" or ");
                    line.ingredient = tempIngredient[0];
                }
                line.ingredient = line.ingredient.replace(/[^a-zA-Z0-9]/g, ' ').trim();

                // if (measuresMapper.indexOf(line.measure) == -1) {
                //     line.ingredient = line.measure = ' ' + line.ingredient;
                //     line.measure = null;
                // }

                // line.finded = false;

                // for (val in temp) {
                //     if (ingredientsMapper[temp[val].replace(/[^a-zA-Z0-9]/g,'').toLowerCase().trim()] != undefined) {
                //         line.ingredient = temp[val].replace(/[^a-zA-Z0-9]/g,'').toLowerCase().trim();
                //         line.finded = true;
                //     }
                // }

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

exports.recipeSum = function (elements, ingredients) {
    var recipeCalcHelper = require('../helpers/recipeCalcHelper');
    var elementNames = { //keys that we gonna use from elements object
    'Water_(g)': 0,
    'Energ_Kcal': 0,
    'Protein_(g)': 0,
    'Lipid_Tot_(g)': 0,
    'Ash_(g)': 0,
    'Carbohydrt_(g)': 0,
    'Fiber_TD_(g)': 0,
    'Sugar_Tot_(g)': 0,
    'Calcium_(mg)': 0,
    'Iron_(mg)': 0,
    'Magnesium_(mg)': 0,
    'Phosphorus_(mg)': 0,
    'Potassium_(mg)': 0,
    'Sodium_(mg)': 0,
    'Zinc_(mg)': 0,
    'Copper_mg)': 0,
    'Manganese_(mg)': 0,
    'Selenium_(µg)': 0,
    'Vit_C_(mg)': 0,
    'Thiamin_(mg)': 0,
    'Riboflavin_(mg)': 0,
    'Niacin_(mg)': 0,
    'Panto_Acid_mg)': 0,
    'Vit_B6_(mg)': 0,
    'Folate_Tot_(µg)': 0,
    'Folic_Acid_(µg)': 0,
    'Food_Folate_(µg)': 0,
    'Folate_DFE_(µg)': 0,
    'Choline_Tot_ (mg)': 0,
    'Vit_B12_(µg)': 0,
    'Vit_A_IU': 0,
    'Vit_A_RAE': 0,
    'Retinol_(µg)': 0,
    'Alpha_Carot_(µg)': 0,
    'Beta_Carot_(µg)': 0,
    'Beta_Crypt_(µg)': 0,
    'Lycopene_(µg)': 0,
    'Lut+Zea_ (µg)': 0,
    'Vit_E_(mg)': 0,
    'Vit_D_µg': 0,
    'Vit_D_IU': 0,
    'Vit_K_(µg)': 0,
    'FA_Sat_(g)': 0,
    'FA_Mono_(g)': 0,
    'FA_Poly_(g)': 0,
    'Cholestrl_(mg)': 0,
    'GmWt_1': 0,
    // 'GmWt_Desc1': 0,
    'GmWt_2': 0,
    // 'GmWt_Desc2': 0,
    'Refuse_Pct': 0,
    'Total_in_grams': 0
    };

    var measureIsGram, weight, measures, ratio;
    var gramArr = ['g', 'grams', 'gram', 'gr'];

    elements.forEach(function(values, i) {

        if (values.Long_Desc != null) {

            measures = ingredients[i].measure;

            if (gramArr.indexOf(measures) >= 0) {
                measureIsGram = true;
            } else {
                measureIsGram = false;
            }

            if (measureIsGram) {
                elementNames['Total_in_grams'] += ingredients[i].amount;
            } else {
                weight = values.Gm_Wgt / values.Amount; // weight of one unit in grams.
                elementNames['Total_in_grams'] += (weight * ingredients[i].amount);
            }
        }
    })

    elements.forEach(function(values) {

        if (values.Long_Desc != null) {
            
            ratio = elementNames['Total_in_grams'] / 100; // ratio of total weight to 100 grams.

            for (var key in elementNames) {
                if (key != 'Total_in_grams') {
                    elementNames[key] += values[key] * ratio; // Nutritional value of 100 grams multiplied by the ratio.
                }
            }

        }
    })

    return elementNames;
}

exports.keywordFix = function(keywords) {

    var keywordReplacement = {
        'eggs'      :'egg',
        'panko'     :'Bread +crumbs +dry +grated +plain',
        'juiced'    :'juice',
        'extra'     :' ',
        'virgin'    :' ',
        'organic'   :' ',
        'whisked'   :' ',
        'until'     :' ',
        'light'     :' ',
        'airy'      :' ',
        'sea'       :' ',
        'raw'       :' '
    };

    for (var i in keywords) {
        if (keywordReplacement[keywords[i]] != undefined) {
            if (keywordReplacement[keywords[i]].length > 0) {
                keywords[i] = keywordReplacement[keywords[i]];
            } else {
                keywords.splice(i, 1);
            }
        }
    }

    return keywords;
}

exports.defineEmptyResult = function() {

    var result = {
        'Long_Desc': null,
        'Msre_Desc': null,
        'Amount': null,
        'Gm_Wgt': null,
        'NDB_No': null,
        'Shrt_Desc': null,
        'Water_(g)': null,
        'Energ_Kcal': null,
        'Protein_(g)': null,
        'Lipid_Tot_(g)': null,
        'Ash_(g)': null,
        'Carbohydrt_(g)': null,
        'Fiber_TD_(g)': null,
        'Sugar_Tot_(g)': null,
        'Calcium_(mg)': null,
        'Iron_(mg)': null,
        'Magnesium_(mg)': null,
        'Phosphorus_(mg)': null,
        'Potassium_(mg)': null,
        'Sodium_(mg)': null,
        'Zinc_(mg)': null,
        'Copper_mg)': null,
        'Manganese_(mg)': null,
        'Selenium_(µg)': null,
        'Vit_C_(mg)': null,
        'Thiamin_(mg)': null,
        'Riboflavin_(mg)': null,
        'Niacin_(mg)': null,
        'Panto_Acid_mg)': null,
        'Vit_B6_(mg)': null,
        'Folate_Tot_(µg)': null,
        'Folic_Acid_(µg)': null,
        'Food_Folate_(µg)': null,
        'Folate_DFE_(µg)': null,
        'Choline_Tot_ (mg)': null,
        'Vit_B12_(µg)': null,
        'Vit_A_IU': null,
        'Vit_A_RAE': null,
        'Retinol_(µg)': null,
        'Alpha_Carot_(µg)': null,
        'Beta_Carot_(µg)': null,
        'Beta_Crypt_(µg)': null,
        'Lycopene_(µg)': null,
        'Lut+Zea_ (µg)': null,
        'Vit_E_(mg)': null,
        'Vit_D_µg': null,
        'Vit_D_IU': null,
        'Vit_K_(µg)': null,
        'FA_Sat_(g)': null,
        'FA_Mono_(g)': null,
        'FA_Poly_(g)': null,
        'Cholestrl_(mg)': null,
        'GmWt_1': null,
        'GmWt_Desc1': null,
        'GmWt_2': null,
        'GmWt_Desc2': null,
        'Refuse_Pct': null
    }

    return result;
}