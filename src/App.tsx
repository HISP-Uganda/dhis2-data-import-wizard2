import { HeaderBar } from '@dhis2/ui-widgets';
import React from 'react';
import { HashRouter as Router, Route, Switch } from "react-router-dom";
import { AggregateWizard } from './components/AggregateWizard';
import './App.css';

function App() {
  return (
    <Router>
      <div className="w-screen h-screen container-grid bg-white">
        <HeaderBar appName={'Data Import Wizard'}
          style={{
            left: 0,
            position: 'fixed',
            top: 0,
            width: '100%',
            zIndex: 1000,
          }}
        />
        <Switch>
          <Route exact path="/">
            <AggregateWizard />
          </Route>
        </Switch>
      </div>
    </Router>
  );
}

export default App;
