/**
 * Draws the visualization in the browser
 */
$(document).ready(function() {

	// get some data
	var data = getData();

	// set dimension
	var dimensions = {
		outer: {
			width: 100,
			height: 600
		},
		margins: {
			top: 10,
			bottom: 10,
			right: 10,
			left: 10
		}
	};

	dimensions.inner = {
		width: dimensions.outer.width - dimensions.margins.left - dimensions.margins.right,
		height: dimensions.outer.height - dimensions.margins.top - dimensions.margins.bottom
	};

	var middle = dimensions.outer.width / 2;

	// set scales
	var xScale = d3.scale.linear()
		.domain(d3.extent(data, function(element) {
			return element.deviation;
		}))
		.range([dimensions.margins.left, dimensions.inner.width + dimensions.margins.left]);

	var seasons = ["Winter", "Spring", "Summer", "Autumn"];

	seasons.forEach(function(season, index, thisArray) {

		season = season.toLowerCase();

		// create the vertical lanes
		var svg = d3.select("#visualization")
			.append("svg")
			.attr({
				width: dimensions.outer.width,
				height: dimensions.outer.height,
				class: function() {
					return "mysvg " + season.toLowerCase();
				}
			});

		var barHeight = 5;

		var relevantData = data.filter(function(element, index, thisArray) {
			return element.season.toLowerCase() == season;
		});

		svg.selectAll(".mysvg ." + season + " rect")
			.data(relevantData)
			.enter()
			.append("rect")
			.attr({
				width: function(d, i) {

					// absolute value of deviation
					return xScale(Math.abs(d.deviation)) - middle;
				},
				height: barHeight,
				y: function(d, i) {
					return i * barHeight;
				},
				x: function(d, i) {
					// positive deviation start at middle
					if (d.deviation >= 0) return middle;

					// negative deviation, start at left
					return xScale(d.deviation);
				}
			});
	});
});

/**
 * Generates mock data
 * @return {array} Array of data objects
 */
function getData() {

	var data = [];

	var MAX = 20;
	var MIN = -20;

	var seasons = ["Winter", "Spring", "Summer", "Autumn"];

	seasons.forEach(function(season, index, thisArray) {

		season = season.toLowerCase();

		for (var i = 0; i < 100; i++) {
			data.push({
				year: 1800 + i,
				deviation: Math.round((Math.random() * (MAX - MIN)) + MIN),
				season: season
			});
		}
	});

	return data;
}