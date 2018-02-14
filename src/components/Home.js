import React, { Component } from 'react'
import Test from './protected/Test'

export default class Home extends Component {
  render () {
    return (
      <div>
        Home. Not Protected. Anyone can see this.
        <Test/>
      </div>
    )
  }
}