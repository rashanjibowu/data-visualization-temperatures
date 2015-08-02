/**
 * Draws the visualization in the browser
 */
$(document).ready(function() {

	// get some data
	var data = getData();
	var years = getYears(data);

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

	var barHeight = 10;
	var verticalOffset = 30;

	// set scales
	var min = d3.min(data, function(element) {
			return element.deviation;
		});

	var max = d3.max(data, function(element) {
			return element.deviation;
		});

	var xScale = d3.scale.linear()
		.domain([min, max])
		.range([dimensions.margins.left, dimensions.inner.width + dimensions.margins.left]);

	// draw legend
	var svg = d3.select("#visualization")
			.append("svg")
			.attr({
				width: dimensions.outer.width,
				height: dimensions.outer.height,
				class: function() {
					return "mysvg yaxis";
				}
			});

	svg.selectAll("text.yaxis")
		.data(years)
		.enter()
		.append("text")
		.text(function(d, i) {
			// show every five years
			if (d % 5 === 0) return d;
			return;
		})
		.attr({
			x: middle,
			y: function(d, i) {
				return (i + 1) * barHeight + verticalOffset;
			},
			class: "yaxis"
		});

	// create the vertical lanes
	var seasons = ["Winter", "Spring", "Summer", "Autumn"];
	seasons.forEach(function(season, index, thisArray) {

		season = season.toLowerCase();

		var svg = d3.select("#visualization")
			.append("svg")
			.attr({
				width: dimensions.outer.width,
				height: dimensions.outer.height,
				class: function() {
					return "mysvg " + season.toLowerCase();
				}
			});

		// add season label
		svg.append("text")
			.text(season.toUpperCase())
			.attr({
				x: middle,
				y: 13,
				class: "season-label"
			});

		// add x-axis labels
		svg.append("text")
			.text(min + "\xB0C")
			.attr({
				x: dimensions.margins.left,
				y: 25,
				class: "xaxis min"
			});

		svg.append("text")
			.text(max + "\xB0C")
			.attr({
				x: dimensions.margins.left + dimensions.inner.width,
				y: 25,
				class: "xaxis max"
			});

		var line = d3.svg.line()
			.x(function(d) {
				return d.x;
			})
			.y(function(d) {
				return d.y;
			})
			.interpolate("linear");

		var lineData = [
			{ x: 37, y: 22 },
			{ x: 66, y: 22 }
		];

		svg.append("path")
			.attr({
				d: line(lineData),
				class: "segment"
			});

		// add bar data
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
					return (i * barHeight) + verticalOffset;
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

function getYears(data) {
	if (!data) {
		console.error("No data exists!");
		return;
	}

	if (data.length === 0) {
		console.error("There is no data");
		return;
	}

	var season = data[0].season;

	var filtered = data.filter(function(element, index, thisArray) {
		return element.season == season;
	});

	var years = filtered.map(function(element, index, thisArray) {
		return element.year;
	});

	return years;
}