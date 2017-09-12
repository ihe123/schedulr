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
    user: firebase.auth().currentUser.email,
    userKey: '',
    type: '',
    team: '',
    tilesData: [],
    slots: {},
    available: [],
    teamAvailability: [],
    users: {},
    supervisors: {},
    teamUsers: {}
  }

  onCellClick = this.onCellClick.bind(this);
  submitSchedule = this.submitSchedule.bind(this);

  onCellClick(row,col) {
    let newBusy = _.extend({}, this.state.slots);
  
    if (this.state.slots[row+','+col][0] === false) {
      newBusy[row+','+col] = [true,"#840032"];
      this.setState({ slots: newBusy });
      
    } else {
      newBusy[row+','+col] = [false,"#E59500"];
      this.setState({ slots: newBusy });
    }
  }

  submitSchedule() {
      
    let userRef;
    let display = firebase.database().ref('Users/' + this.state.userKey + '/');
    display.update({ display: this.state.slots });

    if (this.state.team.length > 0) {
      userRef = firebase.database().ref(this.state.userKey + '/'); 
    } 
  
   
    let slots = Object.keys(this.state.slots);
    let self = this;
    let available = slots.filter(function(slot) {
      return self.state.slots[slot][0] === false; 
    });

    let availabilityDays = [];

    for (let m = 0; m < 5; m++) {
      let timeslotsDay = new Array(9);
      availabilityDays.push(timeslotsDay);
    }

    for (let n = 0; n < available.length; n++) {
      let day = available[n].slice(2);
      availabilityDays[day][available[n][0]] = available[n][0];
    }
    
    this.setState({ 
      available: availabilityDays
    });

     userRef.update({ schedule: availabilityDays });
  }

  componentWillMount() {

    let users = firebase.database().ref('Users/');
    let supervisors = firebase.database().ref('Supervisors/');
    let self = this;

    users.once('value').then((snapshot) => {
       self.setState({ users: snapshot.val() });
    });

    supervisors.once('value').then((snapshot) => {
      self.setState({ supervisors: snapshot.val() });
    });

    /* find team, userKey, and type of user -- must make sure users are properly read and stored in state */
    let listUsers = Object.keys(this.state.users);
   
    for (let l = 0; l < listUsers.length; l++) {

      let user = listUsers[l];
      if (this.state.users[user].email === this.state.user) {
     
        this.setState({ team: this.state.users[user].team });
        this.setState({ type: this.state.users[user].type });  
        this.setState({ userKey: this.state.users[user].userKey }); 
      }
    }

    let teamUsers = firebase.database().ref([this.state.team] +'/');
    
    teamUsers.once('value').then(snapshot => {
      this.setState({ teamUsers: snapshot.val() });
    });
    

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
    /** if user has no availability -- needs to be corrected for display in db**/
    if (this.state.available.length === 0) {
      for (let j = 0; j < 9; j++) {
        for (let k = 0; k < 5; k++) {
          this.state.slots[j+','+k] = [false,"#E59500"];
        }
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
                <TableRowColumn key={index+','+'0'} style={{color: "#FFFFFF", backgroundColor: this.state.slots[index+','+'0'][1]}} onCellClick={this.onCellClick}>{tile.title[0] + '-' + tile.title[1]}</TableRowColumn> 
                <TableRowColumn key={index+','+'0'} style={{color: "#FFFFFF", backgroundColor: this.state.slots[index+','+'1'][1]}} onCellClick={this.onCellClick}>{tile.title[0] + '-' + tile.title[1]}</TableRowColumn> 
                <TableRowColumn key={index+','+'0'} style={{color: "#FFFFFF", backgroundColor: this.state.slots[index+','+'2'][1]}} onCellClick={this.onCellClick}>{tile.title[0] + '-' + tile.title[1]}</TableRowColumn> 
                <TableRowColumn key={index+','+'0'} style={{color: "#FFFFFF", backgroundColor: this.state.slots[index+','+'3'][1]}} onCellClick={this.onCellClick}>{tile.title[0] + '-' + tile.title[1]}</TableRowColumn> 
                <TableRowColumn key={index+','+'0'} style={{color: "#FFFFFF", backgroundColor: this.state.slots[index+','+'4'][1]}} onCellClick={this.onCellClick}>{tile.title[0] + '-' + tile.title[1]}</TableRowColumn>        
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