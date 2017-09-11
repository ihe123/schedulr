import React, { Component } from 'react'
import firebase from 'firebase'
import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn
} from 'material-ui/Table';
import RaisedButton from 'material-ui/RaisedButton';
import _ from 'underscore';

const days = ['M', 'T', 'W', 'R', 'F']

export default class Dashboard extends Component {
  /** #E59500 (yellow) for unselected timeslot/available
  #840032 (red) for selected timeslot/unavailable
  **/
  state = {
    user: 'William Kell',
    tilesData: [],
    slots: {}
  }

  onCellClick = this.onCellClick.bind(this);
  submitSchedule = this.submitSchedule.bind(this);

  onCellClick(row,col) {
    let newBusy = _.extend({}, this.state.slots);
  
    if (this.state.slots[row+','+col][0] === false) {
      newBusy[row+','+col] = [true,"#840032"];
      this.setState({ slots: newBusy});
      
    } else {
      newBusy[row+','+col] = [false,"#E59500"];
      this.setState({ slots: newBusy});
    }
  }

  submitSchedule() {
    // let time = this.state.tilesData[row].title;
    // let day = days[col] + ' '+ new Date();
    const userRef = firebase.database().ref(this.state.user + '/schedule/available');
    // userRef.update({[day]: time});
    let slots = Object.keys(this.state.slots);
    let self = this;
    let available = slots.filter(function(slot) {
      return self.state.slots[slot][0] === false; 
    });


    let availabilityDays = [];

   /** 
    let availabilityDays = [[],[],[],[],[]];
    note: refactor lines 65-80 for on iteration, make use of indices, push first char, no need to sort
          create and use algo on new availabilityDays, build tuples on consecutives
          still need to iterate through each day (better than nm?)   
          goal: availability: {M: [[],[],[]], T: [[],[]], W: [[]] ...}  
  **/
  
    let availableDay = available[0][available[0].length - 1];
    let last = 0;
    let availableDaySlots;
  
    for (let l = 0; l < available.length; l++) {
      if (available[l + 1] && available[l + 1][available[l + 1].length - 1] !== availableDay) {
        availableDaySlots = available.slice(last, l + 1);
        availabilityDays.push(availableDaySlots);
        availableDay = available[l + 1][available[l + 1].length - 1];
        last = l + 1;
      } else if (available[l + 1] === undefined) {
        availableDaySlots = available.slice(last);
        availabilityDays.push(availableDaySlots);
      }
    }  
  }

  componentWillMount() {
    let count = 0;
    let hour = 8;
    let hourMax = 9;

    for (let i = 0; i < 9; i++) { 
        hour = hourMax;

        if (hour === 12) {
          hourMax = 1;
        } else {
          hourMax++; 
        }
          this.state.tilesData.push({ key: i, title: [hour, hourMax] });
          count++;
    }

    for (let j = 0; j < 9; j++) {
      for (let k = 0; k < 5; k++) {
        this.state.slots[j+','+k] = [false,"#E59500"];
      }
    }
  }
  
  render () {
    return (
      <div>
      <Table selectable={false} onCellClick={this.onCellClick}>
        <TableHeader adjustForCheckbox={false} displaySelectAll={false}>
          <TableRow>
            {days.map((day) => (
              <TableHeaderColumn>{day}</TableHeaderColumn>    
            ))}
          </TableRow>
        </TableHeader>
        <TableBody displayRowCheckbox={false}>
         {
          this.state.tilesData.map((tile, index) => (
            <TableRow key={index}>
                <TableRowColumn key={index+','+'0'} style={{color: "white", backgroundColor: this.state.slots[index+','+'0'][1]}} onCellClick={this.onCellClick}>{tile.title[0] + '-' + tile.title[1]}</TableRowColumn> 
                <TableRowColumn key={index+','+'0'} style={{color: "white", backgroundColor: this.state.slots[index+','+'1'][1]}} onCellClick={this.onCellClick}>{tile.title[0] + '-' + tile.title[1]}</TableRowColumn> 
                <TableRowColumn key={index+','+'0'} style={{color: "white", backgroundColor: this.state.slots[index+','+'2'][1]}} onCellClick={this.onCellClick}>{tile.title[0] + '-' + tile.title[1]}</TableRowColumn> 
                <TableRowColumn key={index+','+'0'} style={{color: "white", backgroundColor: this.state.slots[index+','+'3'][1]}} onCellClick={this.onCellClick}>{tile.title[0] + '-' + tile.title[1]}</TableRowColumn> 
                <TableRowColumn key={index+','+'0'} style={{color: "white", backgroundColor: this.state.slots[index+','+'4'][1]}} onCellClick={this.onCellClick}>{tile.title[0] + '-' + tile.title[1]}</TableRowColumn>        
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="submitSchedule" style={{display: 'flex', justifyContent: 'center'}} onClick={this.submitSchedule}>
        <RaisedButton label="Submit" labelColor="white" backgroundColor="#840032"/>
      </div>
      </div>
    )
  }
}