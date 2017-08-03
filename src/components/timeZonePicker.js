import React, { Component } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson';

let TimeZoneURL = '../../data/timezones.json';

class TimeZonePicker extends Component {
	constructor(props) {
		super(props);
	}

	componentDidMount() {
		d3.json(TimeZoneURL, function(error, json) {
			let data = topojson.feature(json, json.objects.geojson).features;

			let projection = d3.geoMercator()
				.scale(70);
			let path = d3.geoPath().projection(projection);
			let svg = d3.select(this.node)
				.style("fill", "white")

			// draw the countries and set up mouse events
			let selected;

			// unfortunately we can't deal with .5 tz offsets right now, so use parseInt instead of parseFloat
			let formatTz = (tz) => parseInt(tz.split(/\s/).pop());

			let mouseover = function(d) {
				countries.filter(`[data-tz="${formatTz(d.properties.Name)}"]`)
					.style("opacity", "0.5")
			}
			let mouseout = function(d) {
				countries.filter(`[data-tz="${formatTz(d.properties.Name)}"]`)
					.style("opacity", "0.3")
			}
			let updateOffset = this.props.updateOffset;
			let click = function(d) {
				selected && selected.attr("class", null);
				selected = countries.filter(`[data-tz="${formatTz(d.properties.Name)}"]`)
					.classed("selectedTz", true)

				updateOffset(formatTz(d.properties.Name))
			}

			let color = d3.scaleOrdinal(d3.schemeCategory20);

			let countries = svg
				.attr("transform", "translate(-250, -20)")
				.selectAll("path")
				.data(data)
				.enter()
				.insert("path")
				.attr("d", path)
				.style("opacity", "0.3")
				.style("cursor", "pointer")
				.style("fill", (d) => color(formatTz(d.properties.Name)))
				.attr("data-tz", (d) => formatTz(d.properties.Name))
				.on("mouseover", mouseover)
				.on("mouseout", mouseout)
				.on("click", click)

			// initialize to given timezone offset and select those countries
			selected = countries.filter(`[data-tz="${this.props.initialOffset}"]`)
					.classed("selectedTz", true)
		}.bind(this))
	}

	render() {
		return <svg width={500} height={300}>
			<g ref={node => this.node = node} />
		</svg>
	}
}

export default TimeZonePicker;
