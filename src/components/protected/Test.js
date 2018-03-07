import React, { Component } from 'react'
import firebase from 'firebase'


export default class Test extends Component {
  constructor(props) {
    super(props);
    this.state = {
      users: {}
    }
  }

  componentDidMount() {
    let userRef = firebase.database().ref('Spring2018/Users/');
    userRef.on('value', snapshot => {
      this.setState({
        users: snapshot.val()
      }, () => {
        console.log(this.state.users);
      })
    })
  }

  render() {
    return (
      <div>HELLO</div>
    )
  }
}