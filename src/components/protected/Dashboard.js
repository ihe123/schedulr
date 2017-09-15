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
      userKey: 'randomKey',
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

    let users = firebase.database().ref('Users/');
    let display = firebase.database().ref('Users/' + this.state.userKey + '/display');
    let self = this;
    // let listUsers;
    // let teamUsers;
    // let count;
    // let hour;
    // let hourMax;

    

    display.on('value', snapshot => {
      console.log('replace', snapshot.val());

      self.setState({ slots: snapshot.val() })
  
    })
    
  }
  //   users.once('value')
  //   .then((snapshot) => {
  //     self.setState({ users: snapshot.val() });
  //   })
  //   .then(() => {

  //     listUsers = Object.keys(self.state.users);
      
  //     for (let l = 0; l < listUsers.length; l++) {
  //       let user = listUsers[l];
        
  //       if (self.state.users[user].email === self.state.user) {   
  //         self.setState({ 
  //           team: self.state.users[user].team, 
  //           type: self.state.users[user].type, 
  //           userKey: user,
  //           userInfo: self.state.users[user],
  //           slots: self.state.users[user].display
  //         });
  //       }
  //     }

  //     if (Object.keys(self.state.slots) === 0) {
  //       for (let j = 0; j < 9; j++) {
  //         for (let k = 0; k < 5; k++) {
  //           self.state.slots[j+','+k] = [false,"#E59500"];
  //         }
  //       }
  //     } 
  //   })
  //   .catch( e => {
  //     console.log('error', e);
  //   })
  // }

  // updateStates(data) {

  //   const datum = data.val();
  //   let users = firebase.database().ref('Users/');
  //   let supervisors = firebase.database().ref('Supervisors/');
  //   let display = firebase.database().ref('Users/' + this.state.userKey+ '/');
  //   let self = this;
  //   let listUsers;
  //   let teamUsers;
  //   let count;
  //   let hour;
  //   let hourMax;
  
  //   // users.once('value')
  //   // .then((snapshot) => {
  //   //   self.setState({ users: snapshot.val() });
  //   // })
  //   // .then(() => {
  //     // console.log('datatatata',datum)
  //     listUsers = Object.keys(datum);
      
  //     for (let l = 0; l < listUsers.length; l++) {
  //       let user = listUsers[l];
        
  //       if (self.state.users[user].email === self.state.user) {   
  //         this.setState({ 
  //           team: self.state.users[user].team, 
  //           type: self.state.users[user].type, 
  //           userKey: user,
  //           userInfo: self.state.users[user],
  //           slots: self.state.users[user].display
  //         });
  //       }
  //     }
  //   // })
  //   // .then (() => {
      
  //     if (Object.keys(self.state.slots) === 0) {
  //       for (let j = 0; j < 9; j++) {
  //         for (let k = 0; k < 5; k++) {
  //           this.state.slots[j+','+k] = [false,"#E59500"];
  //         }
  //       }
  //     } 
    //  })
    // .then(() => {
      // teamUsers = firebase.database().ref([self.state.team] +'/');
      // teamUsers.once('value').then(snapshot => {
      //   this.setState({ teamUsers: snapshot.val() });
      // });
    // })
    // .catch((reason) => {
    //   console.log('setting state erred: ', reason);
    // })
   
  //  supervisors.once('value').then((snapshot) => {
  //   self.setState({ supervisors: snapshot.val() });
  //  })
  //  .catch((e) => {
  //   console.log('error', e)
  //  });
   
  // }


  onCellClick(row,col) {
    console.log(this.state.slots);

    let newBusy = _.extend({}, this.state.slots);
    let display = firebase.database().ref('Users/' + this.state.userKey +'/');
    let self = this;

    if (this.state.slots[row+','+col][0] === false) {
      newBusy[row+','+col] = [true,"#840032"];
      
      display.set({ display: newBusy })
      .then(() => {
        this.setState({ slots: newBusy });
      })
      
    } else {
      newBusy[row+','+col] = [false,"#E59500"];
      display.set({ display: newBusy })
      .then(() => {
        this.setState({ slots: newBusy });
      })
    } 
  }

  
  render () {
    let thing;
    if (Object.keys(this.state.slots).length > 0) {
      thing =  tilesData.map((tile, index) => (
      
      
        <TableRow key={index}>
            <TableRowColumn key={index+',0'} style={{color: "#FFFFFF", backgroundColor: this.state.slots[index+','+'0'][1]}}>{tile.title[0] + '-' + tile.title[1] }</TableRowColumn> 
            <TableRowColumn key={index+',1'} style={{color: "#FFFFFF", backgroundColor: this.state.slots[index+','+'1'][1]}}>{tile.title[0] + '-' + tile.title[1]}</TableRowColumn> 
            <TableRowColumn key={index+',2'} style={{color: "#FFFFFF", backgroundColor: this.state.slots[index+','+'2'][1]}}>{tile.title[0] + '-' + tile.title[1]}</TableRowColumn> 
            <TableRowColumn key={index+',3'} style={{color: "#FFFFFF", backgroundColor: this.state.slots[index+','+'3'][1]}}>{tile.title[0] + '-' + tile.title[1]}</TableRowColumn> 
            <TableRowColumn key={index+',4'} style={{color: "#FFFFFF", backgroundColor: this.state.slots[index+','+'4'][1]}}>{tile.title[0] + '-' + tile.title[1]}</TableRowColumn>        
        </TableRow>
        
      ))
    } else {
      thing = 'not working'
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
          thing
          }
          </TableBody>
      </Table>
      </div>
     
    )
  }
}