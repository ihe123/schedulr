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

const days = ['M', 'T', 'W', 'R', 'F'];
const tilesData = [{"key":0,"title":[9,10]},{"key":1,"title":[10,11]},{"key":2,"title":[11,12]},{"key":3,"title":[12,1]},{"key":4,"title":[1,2]},{"key":5,"title":[2,3]},{"key":6,"title":[3,4]},{"key":7,"title":[4,5]},{"key":8,"title":[5,6]}];

export default class Dashboard extends Component {

  /** #E59500 (yellow) for unselected timeslot/available
  #840032 (red) for selected timeslot/unavailable
  **/
  constructor(props) {
    super(props);
    this.state = {
      user: firebase.auth().currentUser.email,
      userKey: '',
      type: '',
      team: '',
      slots: {},
      available: [],
      teamAvailability: [],
      users: {},
      supervisors: {},
      teamUsers: {},
      userInfo: {}
    }
  }
  
  onCellClick = this.onCellClick.bind(this);

  componentWillMount() {

    let display;
    let userRef;
    let users = firebase.database().ref('Users/');

    let self = this;
    let listUsers;
    let teamUsers;
    let supervisors = firebase.database().ref('Supervisors/');
    let freshDisplay = {};
    let first = false;

    users.on('value', snapshot => {
      this.setState({ users: snapshot.val() })
    })

    users.once('value')
    .then((snapshot) => {
      self.setState({ users: snapshot.val() });
    })
    .then(() => {
      listUsers = Object.keys(this.state.users); 
      
      for (let l = 0; l < listUsers.length; l++) {
       let user = listUsers[l];
       
       if (this.state.users[user].email === this.state.user) {   
         this.setState({ 
           team: this.state.users[user].team, 
           type: this.state.users[user].type, 
           userKey: user,
           userInfo: this.state.users[user]
         }, function() {          
             self.setState({
               slots: self.state.users[user].display
             })       
         });
       }
     }
    })
    .then(() => {
      
      if(this.state.userKey.length > 0) {
       display = firebase.database().ref('Users/' + this.state.userKey + '/display');
       userRef = firebase.database().ref('Users/' + this.state.userKey + '/'); 
       display.on('value', snapshot => {
         this.setState({ slots: snapshot.val() })
       })
     }
 
     if (Object.keys(this.state.slots).length < 3) {
       for (let j = 0; j < 9; j++) {
         for (let k = 0; k < 5; k++) {
          freshDisplay[j+','+k] = [false,"#E59500"];
         }
       }
       this.setState({
         slots: freshDisplay
       }, function() {
         userRef.update({
           display: self.state.slots
         }) 
       }) 
      }
    })
   .then(() => {
    teamUsers = firebase.database().ref([self.state.team] +'/');
    teamUsers.once('value').then(snapshot => {
      this.setState({ teamUsers: snapshot.val() });
    });
  })
   .catch((reason) => {
    console.log('setting state erred: ', reason);
   })

    supervisors.once('value').then((snapshot) => {
      this.setState({ supervisors: snapshot.val() });
    })
    .catch((e) => {
      console.log('error', e)
    })
    
  }

  onCellClick(row,col) {
    let userRef;

    if(this.state.userKey.length > 0) {
      userRef = firebase.database().ref('Users/' + this.state.userKey + '/'); 
    } 

    let newBusy = _.extend({}, this.state.slots);
    let display = firebase.database().ref('Users/' + this.state.userKey +'/');
    let self = this;  
  
    
    if (Object.keys(this.state.slots).length > 2) {

      if (this.state.slots[row+','+col][0] === false) {
        newBusy[row+','+col] = [true,"#840032"];
      } else {
        newBusy[row+','+col] = [false,"#E59500"];
      }
        display.update({ display: newBusy })
        .then(() => {
          this.setState({ slots: newBusy }, function() {

            let slots = Object.keys(this.state.slots);
            let available = slots.filter(function(slot) {
              return self.state.slots[slot][0] === false; 
            });
        
            let availabilityDays = {};

            for (let m = 0; m < 5; m++) {
              let timeslotsDay = new Array(9);
              availabilityDays[m] = timeslotsDay;
            }
        
            for (let n = 0; n < available.length; n++) {
              let day = available[n].slice(2);
              availabilityDays[day][available[n][0]] = available[n][0];
            }
      
            this.setState({ 
              available: availabilityDays
            }, function() {
                if (userRef) {
                  userRef.update({ schedule: availabilityDays });
                  console.log('av', this.state.available);
                }
            })
          })
        })        
    }   
  }

  render () {
    let table;
    let schedule;
    if (Object.keys(this.state.slots).length > 5) {
      table =  tilesData.map((tile, index) => ( 
        <TableRow key={index}>
            <TableRowColumn key={index+',0'} style={{color: "#FFFFFF", backgroundColor: this.state.slots[index+','+'0'][1]}}>{tile.title[0] + '-' + tile.title[1]}</TableRowColumn> 
            <TableRowColumn key={index+',1'} style={{color: "#FFFFFF", backgroundColor: this.state.slots[index+','+'1'][1]}}>{tile.title[0] + '-' + tile.title[1]}</TableRowColumn> 
            <TableRowColumn key={index+',2'} style={{color: "#FFFFFF", backgroundColor: this.state.slots[index+','+'2'][1]}}>{tile.title[0] + '-' + tile.title[1]}</TableRowColumn> 
            <TableRowColumn key={index+',3'} style={{color: "#FFFFFF", backgroundColor: this.state.slots[index+','+'3'][1]}}>{tile.title[0] + '-' + tile.title[1]}</TableRowColumn> 
            <TableRowColumn key={index+',4'} style={{color: "#FFFFFF", backgroundColor: this.state.slots[index+','+'4'][1]}}>{tile.title[0] + '-' + tile.title[1]}</TableRowColumn>        
        </TableRow>
      ));

    } else {
      table = 'not rendering';
    }

    if(Object.keys(this.state.available).length > 0) {

      schedule = Object.keys(this.state.available).map((date, index) => {
        let timeSlot = this.state.available[date];
        let time = '';
        
        for (let i = 0; i < timeSlot.length; i++) {

          if(timeSlot[i] !== undefined) {
            let slot = tilesData[timeSlot[i]];

            if (i !== timeSlot.length - 1) {
              time += slot.title[0] + '-' + slot.title[1]+ ', ';
            } else {
              time += slot.title[0] + '-' + slot.title[1];
            }
          }
        }

      return <div>{days[date] + ': ' + time}</div>;

      })
    } 

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
          table
          }
          </TableBody>
      </Table>   
          Own Availability: {schedule}
          
      </div> 

    )
  }
}