
exports.convertToGram = function(unit, cm) {
	var unitsOfMeasure = { //units of measure ratio to gram
		'µg': 1000000,
		'mg': 1000,
		'oz': 0.0352739619,
		'g': 1,
	}

	if (!unitsOfMeasure[unit] || unitsOfMeasure[unit] != undefined) {
		var result = cm;
	} else {
		var result = cm / unitsOfMeasure[unit];
	}

	return result;
}