
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
                line.measure = line.measure.replace('Tablespoons', 'tbsp').replace('tablespoons', 'tbsp').replace('Tablespoon', 'tbsp').replace('tablespoon', 'tbsp').toLowerCase().trim();
                line.measure = line.measure.replace('pints', 'pint').replace('cups', 'cup').replace('cp', 'cup').replace('C', 'cup');
                line.measure = line.measure.replace('teaspoon', 'tsp').replace('teaspoons', 'tsp');

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
    var i;
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
    'Refuse_Pct': 0
    };
    var component;

    for (i in elements) { //summarizing all elements TODO: add calculation for OZ!!!!!!!!!!!!
        if (elements[i].measures && ingredients[i].amount && ingredients[i].measure && elements[i].weight && elements[i].measures.indexOf(ingredients[i].measure) > -1) {
            var ind = elements[i].measures.indexOf(ingredients[i].measure)
            // console.log(ingredients[i].measure, elements[i].weight, elements[i].measures);
            // console.log(elements[i].measures[ind], elements[i].weight[ind], ingredients[i].amount);
            var cm = elements[i].weight[ind] * ingredients[i].amount;
        }
            for (component in elementNames) {// OVO NE VALJA OBRATI PAZNJU NA MERNE JEDINICE. NAPRAVI FUNKCIJU DA KONVERTUJE SVE U GRAME
                if (elements[i][component] > 0) {
                    var vh = ( elements[i][component] * cm ) / 100;
                    elementNames[component] += vh;
                    console.log(vh + ' = ', elements[i][component], cm);
                }
            }console.log('___________________________________');
    }

    return elementNames;
}