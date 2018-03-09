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
      available: {},
      users: {},
      supervisors: {},
      teamUsers: [],
      userInfo: {},
      teamSchedules: [],
      totalSchedules: [],
      totalScheds: [],
      supervisorSchedule: [],
      totalSchedsWithSupervisor: [],
      teamOverlappings: [],
      teamAndSupervisorOverlappings: [],
      ownSchedule: [],
      overlapObject: {},
      overlapWithSupervisorObject: {}
    }
    this.onCellClick = this.onCellClick.bind(this);
    this.showNewDisplay = this.showNewDisplay.bind(this);
    this.createAvailability = this.createAvailability.bind(this);
    this.mergeRange = this.mergeRange.bind(this);
    this.displaySlotsForStudentOrSupervisor = this.displaySlotsForStudentOrSupervisor.bind(this);
    this.findOverlap = this.findOverlap.bind(this);
    this.changeSlotsToRanges = this.changeSlotsToRanges.bind(this);
  }

  displaySlotsForStudentOrSupervisor(self, user) {
    let displaySlots = {};
    if(this.state.type === 'supervisor') {
      displaySlots = self.state.supervisors[user].display;
    } else {
      displaySlots = self.state.users[user].display;
    }
    if(!displaySlots) {
      displaySlots = [];
    }

    return displaySlots;
  }

  showNewDisplay (userRef) {
    let freshDisplay = {};
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

  createAvailability(self) {
    let slots = Object.keys(this.state.slots);
    let available = slots.filter(function(slot) {
      return self.state.slots[slot][0] === false;
    });

    let userRef;
    userRef = firebase.database().ref('Spring2018/Users/' + this.state.userKey + '/');

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
    })

    userRef.update({
      schedule: availabilityDays
    });
  }

  mergeRange(range) {
    let merged = [range[0]];
    for(let i = 1; i < range.length; i++) {
      let last = merged[merged.length - 1];
      if(last[1] === range[i][0]) {
        last[1] = range[i][1];
      } else {
        merged.push(range[i]);
      }
    }

    return merged;
  }

  findOverlap(teamSchedules)  {
    let overlaps = teamSchedules.slice();
    overlaps = overlaps[0];
    let overlapObject = {};

    if(teamSchedules && overlaps) {
      for(let i = 1; i < teamSchedules.length; i++) {
        let teamMember = teamSchedules[i];

        for(let j = 0; j < 5; j++) {
          if(!overlaps[j]) {
            continue;
          }
          for(let k = 0; k < 9; k++) {
            if(teamMember === undefined) {
              overlaps.push([]);
              continue;
            }

            if(teamMember[j]) {
              if(teamMember[j][k] === undefined) {
                delete overlaps[j][k];
              }
            }
            else {
              delete overlaps[j];
            }
          }
        }
      }

      for(let i = 0; i < overlaps.length; i++) {
        overlapObject[i] = [];
        if(!overlaps[i]) {
          continue;
        }
        for(let j = 0; j  < overlaps[i].length; j++) {
          overlapObject[i].push(overlaps[i][j]);
        }
      }

      return overlapObject;
    }
  }

  changeSlotsToRanges(scheduleObject, tilesData, mergeRange, days) {
    let ownSched= {};

    return Object.keys(scheduleObject).map((date, index) => {
      let timeSlot = scheduleObject[date];
      let time = '';
      let range = [];
      let loaded = false;

      for (let i = 0; i < timeSlot.length; i++) {
        let last = range[range.length - 1];
        let slot = tilesData[timeSlot[i]];
          if(timeSlot[i] !== undefined && timeSlot[i] !== null && !loaded) {
            range.push([slot.title[0], slot.title[1]]);
            if(i === timeSlot.length - 1) {
              loaded = true;
            }
          } else if(loaded && last[1] < timeSlot[i][0]) {
            range.push([slot.title[0], slot.title[1]]);
          }
      }

      let rangeMerged = mergeRange(range);
      ownSched[index] = rangeMerged;

      if (rangeMerged.length > 0) {
        for (let j = 0; j < rangeMerged.length; j++) {
          if(rangeMerged[j]) {
            if(j === rangeMerged.length - 1) {
              time += rangeMerged[j][0] + '-' + rangeMerged[j][1];
            } else {
              time += rangeMerged[j][0] + '-' + rangeMerged[j][1] + ', ';
            }
          }
        }
      }

    return <div key={`${date}-${index}`}>{days[date] + ': ' + time}</div>;
    })
  }

  componentDidMount() {
    let users = firebase.database().ref('Spring2018/Users/');
    let supervisors = firebase.database().ref('Supervisors/User/');

    supervisors.on('value', snapshot => {
     this.setState({
       supervisors: snapshot.val()
     }, () => {
         users.on('value', snapshot => {
         this.setState({ users: snapshot.val() }, () => {
          let userRef;
          let self = this;
          let listUsers;

          /* insert supervisor email address */

          // if(this.state.user === "wkell@berkeley.edu") {
          //   let listSupervisorUsers = Object.keys(this.state.supervisors);
          // }

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
                let displaySlots = this.displaySlotsForStudentOrSupervisor(self, user);

                self.setState({
                  slots: displaySlots
                }, () => {
                  if(this.state.userKey.length > 0 && this.state.type === 'student') {
                    userRef = firebase.database().ref('Spring2018/Users/' + this.state.userKey + '/');
                  } else if(this.state.userKey.length > 0 && this.state.type === 'supervisor') {
                    userRef = firebase.database().ref('Supervisors/User/' + this.state.userKey + '/');

                  }
                  if (Object.keys(this.state.slots) && Object.keys(this.state.slots).length < 3 ) {
                      this.showNewDisplay(userRef);
                  }
                  this.createAvailability(self);
                })

                if(this.state.userKey.length > 0) {

                  let display = firebase.database().ref('Spring2018/Users/' + this.state.userKey + '/display');
                  // let userRef = firebase.database().ref('Spring2018/Users/' + this.state.userKey + '/');

                  display.on('value', snapshot => {
                    this.setState({ slots: snapshot.val() })
                  })
                }

                let newTeamUsers = [];
                let teamSchedules = [];
                let teamAndSupervisorSchedules = [];
                let overlappedWithSupervisorYetToRange;
                let overlapedYetToRange;

                const findIdeal = function() {
                    let displaySlots;

                    if(this.state.type === 'supervisor') {
                      displaySlots = self.state.supervisors[user].display;
                    } else {
                      displaySlots = self.state.users[user].display;
                    }

                      self.setState({
                        slots: displaySlots,

                      }, () => {

                        if (Object.keys(this.state.slots).length < 3) {
                          this.showNewDisplay(userRef);
                        }
                        this.createAvailability(self);
                        }
                      )

                      teamAndSupervisorSchedules.push(this.state.supervisorSchedule);

                      this.setState({
                        teamUsers: newTeamUsers,
                        totalSchedsWithSupervisor: teamAndSupervisorSchedules
                      }, () => {
                        /*********************************TEAM users callback ******************************************* */

                        if(this.state.totalScheds.length > 0) {
                          let totalScheds = this.state.totalScheds.slice();
                          overlapedYetToRange = this.findOverlap(totalScheds);
                          let totalSchedsWithSupervisorVar = this.state.totalSchedsWithSupervisor.slice();
                          overlappedWithSupervisorYetToRange = this.findOverlap(totalSchedsWithSupervisorVar);
                        }

                        this.setState({
                          overlapObject: overlapedYetToRange,
                          overlapWithSupervisorObject: overlappedWithSupervisorYetToRange
                        }, () => {


                          if(Object.keys(this.state.available).length > 0) {
                            let available = JSON.parse(JSON.stringify(this.state.available));
                            let overlapObjectVar = JSON.parse(JSON.stringify(this.state.overlapObject));
                            let overlapWithSupervisorObject = JSON.parse(JSON.stringify( this.state.overlapWithSupervisorObject));
                            let schedule = this.changeSlotsToRanges(available, tilesData, this.mergeRange, days);
                            let idealTimeSlotsInRange = this.changeSlotsToRanges(overlapObjectVar, tilesData, this.mergeRange, days);
                            let idealTimeSlotsWithSupervisor = this.changeSlotsToRanges(overlapWithSupervisorObject, tilesData, this.mergeRange, days);

                            this.setState({
                              ownSchedule: schedule,
                              teamOverlappings: idealTimeSlotsInRange,
                              teamAndSupervisorOverlappings: idealTimeSlotsWithSupervisor
                            })
                          }
                        })
                      });
                  };


                for(let l = 0; l < listUsers.length; l++) {
                  let user = listUsers[l];
                  if(this.state.users[user].team === this.state.team) {
                    newTeamUsers.push(user);
                    teamSchedules.push(this.state.users[user].schedule);
                  }
                }

                this.setState({
                  totalScheds: teamSchedules
                })

                teamAndSupervisorSchedules.push(...teamSchedules);

                supervisors.once('value')
                  .then((snapshot) => {
                    this.setState({ supervisors: snapshot.val() }, () => {
                        let objectUser;
                        let listUsers;
                        if(this.state.user === 'yoohoo@gmail.com') {
                          listUsers = Object.keys(this.state.supervisors)
                          objectUser = this.state.supervisors;
                        } else {
                          listUsers = Object.keys(this.state.users);
                          objectUser = this.state.users;
                        }

                        for (let l = 0; l < listUsers.length; l++) {
                          let user = listUsers[l];

                          if (objectUser[user].email === this.state.user){
                            this.setState({
                              team: objectUser[user].team,
                              type: objectUser[user].type,
                              supervisorSchedule: this.state.supervisors.cndRfJhA9sO4NDnLYHgBhqNu57i2.schedule,
                              userKey: user
                            }, findIdeal);
                          }
                        }
                      }
                    );
                  })
                });
              }
            }
        })
      })
    })
  })
}

  onCellClick(row,col) {

    if(this.state.userKey.length > 0 && this.state.type === 'student') {
      // let userRef = firebase.database().ref('Spring2018/Users/' + this.state.userKey + '/');
    } else if(this.state.userKey.length > 0 && this.state.type === 'supervisor') {
      // let userRef = firebase.database().ref('Supervisors/User/' + this.state.userKey + '/');
    }

    let newBusy = _.extend({}, this.state.slots);
    let display;
    if(this.state.userKey.length > 0 && this.state.type === 'student') {
      display = firebase.database().ref('Spring2018/Users/' + this.state.userKey +'/');

    } else if(this.state.userKey.length > 0 && this.state.type === 'supervisor') {
      display = firebase.database().ref('Supervisors/User/' + this.state.userKey + '/');
    }

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
            this.createAvailability(self);
          })
        })
    }

    let available = JSON.parse(JSON.stringify(this.state.available));
    let schedule =  this.changeSlotsToRanges(available, tilesData, this.mergeRange, days);

    this.setState({
      ownSchedule: schedule
    })
  }

  render () {
    let table;
    if (Object.keys(this.state.slots).length > 5) {
      table =  tilesData.map((tile, index) => (
        <TableRow key={index}>
            <TableRowColumn key={index+'0'} style={{color: "#FFFFFF", backgroundColor: this.state.slots[index+',0'][1]}}>{tile.title[0] + '-' + tile.title[1]}</TableRowColumn>
            <TableRowColumn key={index+'1'} style={{color: "#FFFFFF", backgroundColor: this.state.slots[index+',1'][1]}}>{tile.title[0] + '-' + tile.title[1]}</TableRowColumn>
            <TableRowColumn key={index+'2'} style={{color: "#FFFFFF", backgroundColor: this.state.slots[index+',2'][1]}}>{tile.title[0] + '-' + tile.title[1]}</TableRowColumn>
            <TableRowColumn key={index+'3'} style={{color: "#FFFFFF", backgroundColor: this.state.slots[index+',3'][1]}}>{tile.title[0] + '-' + tile.title[1]}</TableRowColumn>
            <TableRowColumn key={index+'4'} style={{color: "#FFFFFF", backgroundColor: this.state.slots[index+',4'][1]}}>{tile.title[0] + '-' + tile.title[1]}</TableRowColumn>
        </TableRow>
      ));

    } else {
      table = 'not rendering';
    }

    return (
      <div>
      <Table selectable={false} onCellClick={this.onCellClick}>
        <TableHeader adjustForCheckbox={false} displaySelectAll={false}>
          <TableRow>
            {days.map((day, i) => (
              //KX: added key for TableHeaderColumn
              <TableHeaderColumn key={`${day}`}>{day}</TableHeaderColumn>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody displayRowCheckbox={false}>
          {table}
        </TableBody>
      </Table>
      <div style={{display: "flex", flexDirection:"row", justifyContent: "space-between"}}>
          <div style={{display: "flex", flexDirection:"column", margin:"10px"}}>
            <div style={{fontWeight:"bold"}}>Own Availability:
            </div>
            <div>{this.state.ownSchedule}</div>
          </div>
          <div style={{display: "flex", flexDirection:"column", margin:"10px"}}>
            <div style={{fontWeight:"bold"}}>Team Availability:</div>
            <div>{this.state.teamOverlappings}</div>
          </div>
          <div style={{display: "flex", flexDirection:"column", margin:"10px"}}>
            <div style={{fontWeight:"bold"}}>Team and Supervisor: </div>
            <div>{this.state.teamAndSupervisorOverlappings}</div>
          </div>
      </div>
      </div>
    )
  }
}
