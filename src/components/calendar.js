import React, { Component } from 'react';
import * as d3 from 'd3';
import _ from 'lodash';

let NUM_PEOPLE = 4;
let BLOCK_WIDTH = 80;
let BLOCK_HEIGHT = 22;
let BLOCK_PER_DAY = 24;
let TOTAL_BLOCKS = BLOCK_PER_DAY * 7;
let DAYS_OF_WEEK = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

// timeblocks are in 1 hour blocks
let timeBlocks = _.chunk(_.range(0, 60 * 24 * 7, 60), BLOCK_PER_DAY);
let TIME_LABELS = ["Midnight", "1am", "2am", "3am", "4am", "5am", "6am", "7am", "8am", "9am", "10am", "11am", "Noon", "1pm", "2pm", "3pm", "4pm", "5pm", "6pm", "7pm", "8pm", "9pm", "10pm", "11pm"];
// count number of trues across subarrays at index i
let countTrueAtIndex = (arr, i) => arr.reduce((sum, subArr) => sum+(subArr[i]?1:0), 0)

let repaintBlock = (selectedBlocks, i, p) => {
	d3.select(`#block${i}`)
		.style("fill-opacity", Math.pow(countTrueAtIndex(selectedBlocks, i)/NUM_PEOPLE, 1.5))
		.style("stroke-opacity", selectedBlocks[p][i] ? 0.8 : 0.2);
}


class Calendar extends Component {
	constructor(props) {
		super(props);
		this.selectedBlocks = {arr: this.props.timeblocks};
	}

	componentDidMount() {
		let svg = d3.select(this.node)
			.attr("transform", "translate(0, -50)")

		let days = svg
			.selectAll("g")
			.data(timeBlocks)
			.enter()
			.append("g")
			.attr("transform", (d, i) => `translate(${60+i*BLOCK_WIDTH}, 85)`)

		days.append("text")
			.classed("dateLabel", true)
			.attr("fill", "white")
			.attr("dy", "-10")
			.attr("dx", "14")

		// draw hour labels on the left
		svg.append("g")
			.attr("transform", "translate(0, 100)")
			.selectAll("text")
			.data(TIME_LABELS)
			.enter()
			.append("text")
			.text((d) => d)
			.attr("y", (d, i) => i*BLOCK_HEIGHT)
			.attr("fill", "white")

		// draw the calendar and set up all the mouse events
		let startingBlock = null;
		let prevBlock = null
		let shouldSelect = true;
		let selectedBlocks = this.selectedBlocks;
		let updateTimeblock = this.props.updateTimeblock;
		let selectedPerson = () => this.props.selectedPerson;

		function dragStart(d) {
			startingBlock = this.id.replace("block", "");
			prevBlock = startingBlock;
			shouldSelect = !selectedBlocks.arr[selectedPerson()][startingBlock];
		}

		function dragEnd() {
			startingBlock = null;
			prevBlock = null;
			updateTimeblock(selectedBlocks.arr);
		}

		function mouseover (d) {
			if (startingBlock) {	// we're in a dragging state
				let p = selectedPerson();
				let currBlock = this.id.replace("block", "");
				if (_.inRange(currBlock, startingBlock, prevBlock)) {
					// if we are dragging back to our starting block, we have to undo the selection we did
					_.range(prevBlock, currBlock).forEach((i) => {
						selectedBlocks.arr[p][i] = !shouldSelect;
						repaintBlock(selectedBlocks.arr, i, p);
					})
				} else {
					// we're moving further from starting block
					for (let i = Math.min(prevBlock, currBlock); i <= Math.max(prevBlock, currBlock); i++) {
						selectedBlocks.arr[p][i] = shouldSelect;
						repaintBlock(selectedBlocks.arr, i, p);
					}
				}
				prevBlock = currBlock;
			}
		}

		function click () {
			let p = selectedPerson();
			let currBlock = this.id.replace("block", "")
			selectedBlocks.arr[p][currBlock] = !selectedBlocks.arr[p][currBlock];
			repaintBlock(selectedBlocks.arr, currBlock, p);
			updateTimeblock(selectedBlocks.arr);
		}

		days.each(function(times, day, nodes) {
			d3.select(nodes[day])
				.selectAll("rect")
				.data(times)
				.enter()
				.insert("rect")
				.attr("width", BLOCK_WIDTH)
				.attr("height", BLOCK_HEIGHT)
				.attr("fill", "blue")
				.attr("y", (d, i) => i*BLOCK_HEIGHT)
				.attr("id", (d, i) => `block${day*BLOCK_PER_DAY+i}`)
				.style("stroke", "white")
				.style("stroke-width", 1)
				.on("click", click)
				.on("mouseover", mouseover)
				.call(d3.drag()
					.on("start", dragStart)
					.on("end", dragEnd));
		})

		// initialize by selecting time blocks
		_.range(TOTAL_BLOCKS).forEach((i) => {
			repaintBlock(selectedBlocks.arr, i, this.props.selectedPerson);
		})
		this.updateDateLabels(this.props.startDateUTC, this.props.offset);
	}

	// check for difference in props and states before rendering
	shouldComponentUpdate(nextProps) {
		return this.props.offset !== nextProps.offset ||
			this.props.startDateUTC !== nextProps.startDateUTC ||
			this.props.selectedPerson !== nextProps.selectedPerson;
	}

	render() {
		return <svg width={700} height={600}>
			<g ref={node => this.node = node} />
		</svg>
	}

	componentDidUpdate(prevProps, prevState) {
		let {offset, startDateUTC} = this.props;
		this.updateDateLabels(startDateUTC, offset);

		if (offset !== prevProps.offset) {
			let newSelections = [];
			this.selectedBlocks.arr.forEach((p, i) => {
				newSelections[i] = [];
				p.forEach((d, j) => {
					let newBlock = j + offset - prevProps.offset;
					if (d && newBlock >= 0 && newBlock < TOTAL_BLOCKS) {
						newSelections[i][newBlock] = true;
					}
				})
			})
			this.selectedBlocks.arr = newSelections;
			this.props.updateTimeblock(newSelections);
		}

		_.range(TOTAL_BLOCKS).forEach((i) => {
			repaintBlock(this.selectedBlocks.arr, i, this.props.selectedPerson);
		})
	}

	updateDateLabels(startDateUTC, offset) {
		// make defensive copy
		startDateUTC = new Date(startDateUTC)
		let dateWithOffset = new Date(startDateUTC.setHours(startDateUTC.getHours() + parseInt(offset)))
		d3.selectAll(".dateLabel")
			.text((d, i) => `${DAYS_OF_WEEK[(dateWithOffset.getDay()+i)%7]} ${dateWithOffset.getMonth()+1}/${dateWithOffset.getDate()+i}`)
	}
}

export default Calendar;
