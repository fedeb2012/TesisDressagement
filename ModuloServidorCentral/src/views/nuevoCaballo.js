import React, { useEffect, useState } from "react";

import {TextField, Paper, Box, Grid} from '@material-ui/core'
import Button from '@material-ui/core/Button';

import CssBaseline from '@material-ui/core/CssBaseline';
import Avatar from '@material-ui/core/Avatar';
import Pets from '@material-ui/icons/Pets';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';

import { authFetch } from "../auth";

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: '#303f9f ',
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
    background: '#303f9f',
    color: '#FFFFFF',
  },
}));

function NuevoCaballo() {
    const [logged, setLogged] = useState('')
  
    useEffect(() => {
      authFetch("/api/protected").then(response => {
        if (response.status === 401) {
          setLogged(0)
          return null
        }
        return response.json()
      }).then(response => {
        if (response && response.message) {
          setLogged(1)
        }
      })
    }, [])
    
    const [caballoNombre, setCaballoNombre] = useState('');

    const [estadoCarga, setEstadoCarga] = useState(0);
  
    const handleNombreChange = (event) => {
      setCaballoNombre(event.target.value);
    };
  
    const onSubmitClick = (e)=>{
      e.preventDefault()
      console.log("You pressed submit")
      let opts = {
        'caballoNombre': caballoNombre,
      }
      console.log(opts)
      fetch('/api/caballo/new', {
        method: 'post',
        body: JSON.stringify(opts)
      }).then(r => r.json())
      
      setEstadoCarga(1);
    }
  
    const classes = useStyles();

    if(logged==1){
      if (estadoCarga==0){
        return (
          <Container component="main" maxWidth="xs">
          <CssBaseline />
          <div className={classes.paper}>
            <Avatar className={classes.avatar}>
              <Pets />
            </Avatar>
            <Typography component="h1" variant="h5">
            Registro caballo
            </Typography>
            <form className={classes.form} noValidate>
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                id="select-personaName"
                label="Nombre"
                name="nombre"
                autoComplete="Nombre"
                autoFocus
                value={caballoNombre}
                onChange={handleNombreChange}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                className={classes.submit}
                onClick={onSubmitClick} 
              >Registrar</Button>
            </form>
          </div>
        </Container>
        );
      } else if (estadoCarga===1){
        return (
          <Container component="main" maxWidth="xs">
            <CssBaseline />
            <div className={classes.paper}>
              <Avatar className={classes.avatar}>
                <Pets />
              </Avatar>
              <Typography component="h1" variant="h5">
              Registro exitoso de <b>{caballoNombre}</b>
              </Typography>
            </div>
          </Container>
        );
      }
      } else{
        return(<h2>No autorizado</h2>)
    }
  }

  export default NuevoCaballo;