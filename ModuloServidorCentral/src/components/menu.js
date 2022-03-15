import React from 'react';

import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link
  } from "react-router-dom";

import Home from '../views/home'
import Login from '../views/login'
import Secret from '../views/secret'
import NuevaPersona from '../views/nuevaPersona'
import NuevoCaballo from '../views/nuevoCaballo'
import AsignarRol from '../views/asignarRol'
import VerEntrenamiento from '../views/verEntrenamiento'
import ModificarEntrenamientoInicial from '../views/modificarEntrenamientoInicial'
import Entrenamiento from '../views/entrenamiento'
import '../styles/menu.css'; 


const mystyle = {
    color: "white",
    backgroundColor: "Black",
    padding: "10px",
    fontFamily: "Arial"
  };

export default function Menu () {
  return (
    <React.Fragment>
        <nav className="menu">
            <ul>
                <li>
                    <Link to="/login">Login</Link>
                </li>
                <li>
                    <Link to="/">Home</Link>
                </li>
                <li>
                    <Link to="/entrenamiento/">Ver entrenamiento</Link>
                </li>
                <li>
                    <Link to="/nuevapersona">Registro persona</Link>
                </li>
                <li>
                    <Link to="/nuevocaballo">Registro caballo</Link>
                </li>
                <li>
                    <Link to="/asignarrol">Asignar rol</Link>
                </li>
            </ul>
        </nav>
        <Switch>
            <Route path="/login">
                <Login />
            </Route>
            <Route path="/secret">
                <Secret />
            </Route>
            <Route path="/verentrenamiento/:id">
                <VerEntrenamiento />
            </Route>
            <Route path="/entrenamiento/">
                <Entrenamiento />
            </Route>
            <Route path="/nuevapersona/">
                <NuevaPersona />
            </Route>
            <Route path="/nuevocaballo/">
                <NuevoCaballo />
            </Route>
            <Route path="/asignarrol">
                <AsignarRol />
            </Route>
            <Route path="/modificarentrenamientoinicial">
                <ModificarEntrenamientoInicial />
            </Route>
            <Route path="/">
                <Home />
            </Route>
        </Switch>
    </React.Fragment>
  )
}
