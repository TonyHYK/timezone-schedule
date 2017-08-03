import React, { Component } from 'react';
import * as d3 from 'd3';

class TimeZonePicker extends Component {
	constructor(props) {
		super(props);
        this.onClick = this.onClick.bind(this);
	}

	render() {
		return <div className="pContainer">
            {[0,1,2,3].map((i) => {
                return <div className={this.props.selected === i ? "selectedP" : ""} key={i} onClick={() => this.onClick(i)}>
                    {`Participant ${i+1}`}
                </div>
            })}      
        </div>
	}

    onClick(i) {
        this.props.changePerson(i);
    }
}



export default TimeZonePicker;
