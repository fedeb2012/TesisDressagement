import * as React from 'react';
import {
  BrowserRouter as Router,
} from "react-router-dom";

import Menu from './components/menu'
import 'bootstrap/dist/css/bootstrap.min.css';
import "./styles/bootstrap-dashboard.css";

import "./styles/demo.css";

export default function App() {
  return (
    <Router>
      <div>
        <Menu />        
      </div>
    </Router>
  );
}










