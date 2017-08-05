import React, { Component } from 'react';
import TimeZonePicker from './timeZonePicker';
import PersonPicker from './personPicker';
import Calendar from './calendar';
import qs from 'query-string';
import Description from './description';

let NUM_PEOPLE = 4;

class TimeZone extends Component {

    constructor(props) {
        super(props);

        let {blocks, offset, startDateUTC} = this.readDataFromUrl();

        this.updateOffset = this.updateOffset.bind(this);
        this.updateTimeblock = this.updateTimeblock.bind(this);
        this.updateQuery = this.updateQuery.bind(this);
        this.changePerson = this.changePerson.bind(this);
        this.formatTzLabel = this.formatTzLabel.bind(this);

        // calculate start date if not given one
        if (!startDateUTC) {
            // get current time, convert to UTC
            let tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate()+1);
            tomorrow.setHours(0,0,0,0);
            startDateUTC = getUTCDate(tomorrow);
        }
        // find timezone offset from browser
        if (!offset) {
            let now = new Date();
            offset = now.getTimezoneOffset() / -60;
        }
        if (!blocks) {
            blocks = _.range(NUM_PEOPLE).map(() => []);
        }
        this.state = {
            offset: offset,
            startDateUTC: startDateUTC,
            people: [0],
            timeblocks: blocks,
            selectedPerson: 0
        };
    }

    render() {
        return (
            <div>
                <h1>
                    Schedule Meetings Across Timezones
                </h1>
                <div className="container">
                    <div>
                        <PersonPicker selected={this.state.selectedPerson} changePerson={this.changePerson} />
                        <div className="tzLabel">{this.formatTzLabel(this.state.offset)}</div>
                        <TimeZonePicker initialOffset={this.state.offset} updateOffset={this.updateOffset} />
                    </div>
                    <div>
                        <Calendar {...this.state} updateTimeblock={this.updateTimeblock} />
                    </div>
                    <Description />
                </div>
            </div>
        );
    }

    changePerson(i) {
        this.setState({selectedPerson: i});
    }

    updateOffset(tzOffset) {
        this.setState({offset: tzOffset});
        // don't need to update query here because time blocks needs to be updated first which triggers a query update
    }

    updateTimeblock(selectedBlocks) {
        this.setState({timeblocks: selectedBlocks});
        this.updateQuery(selectedBlocks);
    }

    updateQuery(newTimeblocks) {
        // grab all data needed to represent the state of the page
        // only store index of selected blocks instead of using the entire array
        let blocks = newTimeblocks.map((p) => {
            let blocks = [];
            p.forEach((value, i) => {
                if (value) {
                    blocks.push(i);
                }
            })
            return blocks;
        })
        let data = {
            offset: this.state.offset,
            y: this.state.startDateUTC.getFullYear(),
            m: this.state.startDateUTC.getMonth(),
            d: this.state.startDateUTC.getDate(),
            h: this.state.startDateUTC.getHours()
        }
        blocks.forEach((b, i) => {
            data[`blocks${i}`] = b.join(",");
        })
        location.hash = qs.stringify(data);
    }

    readDataFromUrl() {
        if (!location.hash) return {};
        let parsed = qs.parse(location.hash);
        let selectedBlocks = [];
        _.range(NUM_PEOPLE).forEach((i) => {
            let blocks = [];
            if (parsed[`blocks${i}`]) {
                parsed[`blocks${i}`].split(",").forEach((j) => blocks[j] = true);
            }
            selectedBlocks[i] = blocks;
        })
        return {
            blocks: selectedBlocks,
            offset: parsed.offset,
            startDateUTC: new Date(parseInt(parsed.y), parseInt(parsed.m), parseInt(parsed.d), parseInt(parsed.h), 0, 0, 0)
        }

    }

    formatTzLabel(offset) {
        return `UTC ${offset > 0 ? "+" : ""}${offset}`;
    }

}

let getUTCDate = (d) => new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(),  d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds())

export default TimeZone;
