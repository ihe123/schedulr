import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/';
import Dashboard from './components/protected/Dashboard.js';
import mergedRange from './components/protected/Dashboard.mergeRange.js';

const range = [[9,10]];

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<App />, div);
});

describe('merged ranges', () => {
  it('should not be empty', () => {
    expect(mergedRange(range)).not.toHaveLength(0);
  });
});
