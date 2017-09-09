import React, { Component } from 'react'
import $ from 'jquery'
import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn,
} from 'material-ui/Table';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

export default class Dashboard extends Component {
  /** #E59500 (yellow) for unselected timeslot/available
  #840032 (red) for selected timeslot/unavailable
  **/
  state = {
    tilesData: [],
    busySlots: []
  }

  onCellClick = this.onCellClick.bind(this);

  onCellClick(row,col) {
    this.state.busySlots.push([row, col]);

    if (this.state[row+','+col] === "#E59500") {
      this.setState ({
       [row+','+col] : "#840032"
      })
    } else {
      this.setState ({
        [row+','+col] : "#E59500"
      })
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
          this.state.tilesData.push({ key: i, title: hour + '-' + hourMax });
          count++;
    }

    for (let j = 0; j < 9; j++) {
      for (let k = 0; k < 5; k++) {
        this.state[j+','+k] = "#E59500";
      }
    }
  }
  
  render () {
    return (
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
                <TableRowColumn key={index+','+'0'} style={{color: "white", backgroundColor: this.state[index+','+'0']}} onCellClick={this.onCellClick}>{tile.title}</TableRowColumn> 
                <TableRowColumn key={index+','+'0'} style={{color: "white", backgroundColor: this.state[index+','+'1']}} onCellClick={this.onCellClick}>{tile.title}</TableRowColumn> 
                <TableRowColumn key={index+','+'0'} style={{color: "white", backgroundColor: this.state[index+','+'2']}} onCellClick={this.onCellClick}>{tile.title}</TableRowColumn> 
                <TableRowColumn key={index+','+'0'} style={{color: "white", backgroundColor: this.state[index+','+'3']}} onCellClick={this.onCellClick}>{tile.title}</TableRowColumn> 
                <TableRowColumn key={index+','+'0'} style={{color: "white", backgroundColor: this.state[index+','+'4']}} onCellClick={this.onCellClick}>{tile.title}</TableRowColumn>        
            </TableRow>
          ))}
        </TableBody>
      </Table>
    )
  }
}