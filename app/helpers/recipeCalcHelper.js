
exports.convertToGram = function(unit, cm) {
	var unitsOfMeasure = { //units of measure ratio to gram
		'µg': 1000000,
		'mg': 1000,
		'oz': 0.0352739619,
		'g': 1
	}

	if (!unitsOfMeasure[unit] || unitsOfMeasure[unit] == undefined) {
		var result = 0;
	} else {
		var result = cm / unitsOfMeasure[unit];
	}

	return result;
}

exports.removeLastChar = function(url, char) { // removes last character from url if is equal to char
    if (url.substring(url.length-1) == char) {
        url = url.substring(0, url.length-1);
    }

    return url;
}
