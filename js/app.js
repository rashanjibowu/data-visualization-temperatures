/**
 * Draws the visualization in the browser
 */
$(document).ready(function() {

	// get some data
	var data = getData();


	// sort in descending year
	var years = getYears(data);

	// set dimension
	var dimensions = {
		outer: {
			width: 1000,
			height: 600
		},
		margins: {
			top: 10,
			bottom: 10,
			right: 10,
			left: 10
		},
		section: {
			width: 180,
			margin: 30
		},
		timeline: {
			width: 100
		},
		barHeight: 10,
		verticalOffset: 30
	};

	dimensions.inner = {
		width: dimensions.outer.width - dimensions.margins.left - dimensions.margins.right,
		height: dimensions.outer.height - dimensions.margins.top - dimensions.margins.bottom
	};

	// set scales
	var min = d3.min(data, function(element) {
			return element.deviation;
		});

	var max = d3.max(data, function(element) {
			return element.deviation;
		});

	var xScale = d3.scale.linear()
		.domain([min, max])
		.range([0, dimensions.section.width]);

	var color = d3.scale.linear()
		.domain([min, 0, max])
		.range(["blue", "#DDDDDD", "red"]);

	// draw the main svg
	var svg = d3.select("#visualization")
		.append("svg")
		.attr({
				width: dimensions.outer.width,
				height: dimensions.outer.height
			});

	// specify the canvas (drawable area)
	var canvas = svg.append("g")
		.attr({
			class: "canvas",
			width: dimensions.inner.width,
			height: dimensions.inner.height,
			transform: "translate(" + dimensions.margins.left + "," + dimensions.margins.top + ")"
		});

	// yaxis timeline
	var timeline = canvas.append("g")
		.attr({
			width: dimensions.timeline.width,
			height: dimensions.inner.height,
			class: function() {
				return "yaxis timeline";
			}
		});

	timeline.selectAll("text.yaxis")
		.data(years)
		.enter()
		.append("text")
		.text(function(d, i) {
			// show every five years
			if (d % 5 === 0) return d;
			return;
		})
		.attr({
			x: dimensions.timeline.width / 2,
			y: function(d, i) {
				return (i + 1) * dimensions.barHeight + dimensions.verticalOffset;
			},
			class: "yaxis"
		});

	// create the vertical lanes
	var seasons = ["Winter", "Spring", "Summer", "Autumn"];
	seasons.forEach(function(season, index, thisArray) {

		season = season.toLowerCase();

		var section = canvas
			.append("g")
			.attr({
				width: dimensions.section.width,
				height: dimensions.inner.height,
				class: season.toLowerCase(),
				transform: function() {
					var xOffset = dimensions.timeline.width +
						dimensions.section.margin +
						(index * (dimensions.section.width + dimensions.section.margin));

					var yOffset = 0;
					return "translate(" + xOffset + "," + yOffset + ")";
				}
			});

		// add season label
		section.append("text")
			.text(season.toUpperCase())
			.attr({
				x: dimensions.section.width / 2,
				y: 13,
				class: "season-label"
			});

		// add x-axis labels
		section.append("text")
			.text(min + "\xB0C")
			.attr({
				x: dimensions.margins.left,
				y: 25,
				class: "xaxis min"
			});

		section.append("text")
			.text("+" + max + "\xB0C")
			.attr({
				x: dimensions.section.width,
				y: 25,
				class: "xaxis max"
			});

		// add bar data
		var relevantData = data.filter(function(element, index, thisArray) {
			return element.season.toLowerCase() == season;
		});

		section.selectAll("rect." + season)
			.data(relevantData)
			.enter()
			.append("rect")
			.attr({
				class: season,
				width: function(d, i) {
					// absolute value of deviation
					return xScale(Math.abs(d.deviation)) - dimensions.section.width / 2;
				},
				height: dimensions.barHeight,
				y: function(d, i) {
					return (i * dimensions.barHeight) + dimensions.verticalOffset;
				},
				x: function(d, i) {
					// positive deviation start at middle
					if (d.deviation >= 0) return dimensions.section.width / 2;

					// negative deviation, start at left
					return xScale(d.deviation);
				},
				fill: function(d, i) {
					return color(d.deviation);
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