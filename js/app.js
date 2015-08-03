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
			width: 1200,
			height: 2200
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
	var numTimelines = 2;	// for left and right side
	for (var i = 0; i < numTimelines; i++) {

		var groupX = 0;

		if (i == 1) {
			groupX = dimensions.timeline.width + (dimensions.section.margin + dimensions.section.width) * 4;
		}

		var timeline = canvas.append("g")
			.attr({
				width: dimensions.timeline.width,
				height: dimensions.inner.height,
				transform: "translate(" + groupX + "," + 0 + ")",
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
	}

	var sepGenerator = d3.svg.line()
		.x(function(d) {
			return d.x;
		})
		.y(function(d) {
			return d.y;
		})
		.interpolate("linear");

	/**
	 * Draws leader lines through out the visualization
	 * @param  {array} years Array of years in the data
	 * @return {void}
	 */
	function drawLines(years) {

		var coords = getCoordinates(years);

		coords.forEach(function(element, index, thisArray) {
			canvas.append("path")
				.attr({
					class: "separator",
					d: sepGenerator(getLineSegment(element.from, element.to)),
					style: function() {
						return "stroke-dasharray:3,3";
					}
				});
		});
	}

	/**
	 * Converts data (years) into coordinates for leader line generation
	 * @param  {array} years Array of years
	 * @return {array}       Coordinate objects
	 */
	function getCoordinates(years) {
		var coords = [];

		// each element must be an object that contains 2 objects (from, to)
		// each object contains 2 properties (x, y)

		// create 5 coords for every year that is multiple of 5
		for (var i = 0; i < years.length; i++) {

			// ignore irrelevant years
			if (years[i] % 5 !== 0) continue;

			// set starting values
			var y = (i * dimensions.barHeight) + dimensions.verticalOffset + dimensions.barHeight / 2;

			var portionOverlap = (3/4);
			var x = dimensions.timeline.width * portionOverlap;

			var first = {};
			first.from = { x: x, y: y };

			// increment x
			x += dimensions.section.margin + dimensions.timeline.width * (1 - portionOverlap);
			first.to = { x: x, y: y };

			coords.push(first);

			// inner loop for the 4 remaining line segments
			for (var j = 0; j < 4; j++) {
				var next = {};
				// increment x
				x += dimensions.section.width;
				next.from = { x: x, y: y };

				// increment x
				x += dimensions.section.margin;
				next.to = { x: x, y: y };

				coords.push(next);
			}
		}

		/* header underlines
		var x = dimensions.timeline.width;
		var y = 15;

		for (var i = 0; i < 4; i++) {

			x += dimensions.section.margin;
			var next = {};
			next.from = { x: x, y: y };

			x += dimensions.section.width;
			next.to = { x: x, y: y };

			coords.push(next);
		}*/

		return coords;
	}

	/**
	 * Converts 2 coordinate objects into an array of coordinates
	 * @param  {object} from x/y coordinate
	 * @param  {object} to   x/y coordinate
	 * @return {array}      Array of coordinates
	 */
	function getLineSegment(from, to) {

		var segment = [];
		segment.push(from);
		segment.push(to);
		return segment;
	}

	// draw lines
	drawLines(years);

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
					return xScale(Math.abs(d.deviation)) - xScale(0);
				},
				height: dimensions.barHeight,
				y: function(d, i) {
					return (i * dimensions.barHeight) + dimensions.verticalOffset;
				},
				x: function(d, i) {
					// positive deviation start at middle
					if (d.deviation >= 0) return xScale(0);

					// negative deviation, start at left
					return xScale(d.deviation);
				},
				fill: function(d, i) {
					return color(d.deviation);
				}
			})
			.on("mouseover", function(d, i) {
				d3.select(this)
					.style({
						opacity: 0.7
					})
					.attr({
						fill: function(d, i) {
							if (d.deviation > 0) return color(max);

							return color(min);
						}
					});

			})
			.on("mouseout", function(d, i) {
				d3.select(this)
					.style({
						opacity: 0.4
					})
					.attr({
						fill: color(d.deviation)
					});
			});
	});
});

/**
 * Generates mock data
 * @return {array} Array of data objects
 */
function getData() {

	var data = [];

	var MAX = 40;
	var MIN = -20;

	var seasons = ["Winter", "Spring", "Summer", "Autumn"];

	seasons.forEach(function(season, index, thisArray) {

		season = season.toLowerCase();

		for (var i = 0; i < 216; i++) {
			data.push({
				year: 1800 + i,
				deviation: Math.round((Math.random() * (MAX - MIN)) + MIN),
				season: season
			});
		}
	});

	return data.sort(sortDescending);
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

/**
 * Sorting method for the data
 * @param  {object} a first element
 * @param  {object} b second element
 * @return {int}   Indicator of which should come before the other
 */
function sortDescending(a, b) {
	return b.year - a.year;
}
