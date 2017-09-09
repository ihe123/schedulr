import React, { Component } from 'react'
import {GridList, GridTile} from 'material-ui/GridList';
import Subheader from 'material-ui/Subheader';
import IconButton from 'material-ui/IconButton';
// import CheckBox from 'material-ui/svg-icons/toggle/check-box-outline-blank';
import Checkbox from 'material-ui/Checkbox';
import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn,
} from 'material-ui/Table';

const styles = {
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  gridList: {
    width: 700,
    height: 600,
    overflowY: 'auto',
  },
};

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

export default class Dashboard extends Component {
  state = {
    tilesData: [],
    busySlots: []
  }


  onCellClick(row,col) {
    console.log('row',row);
    console.log('col',col);
  }

  componentWillMount() {
    let count = 0;
    let hour = 8;
    let hourMax = 9;
    let day = 0;

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
    console.log(this.state.tilesData);
    console.log(this.state.busySlots);
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
         {this.state.tilesData.map((tile, index) => (
            <TableRow key={index}>
                <TableRowColumn onCellClick={this.onCellClick}><span>{tile.title}</span></TableRowColumn>
                <TableRowColumn onCellClick={this.onCellClick}>{tile.title}</TableRowColumn>
                <TableRowColumn onCellClick={this.onCellClick}>{tile.title}</TableRowColumn>
                <TableRowColumn onCellClick={this.onCellClick}>{tile.title}</TableRowColumn>
                <TableRowColumn onCellClick={this.onCellClick}>{tile.title}</TableRowColumn>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    )
  }
}