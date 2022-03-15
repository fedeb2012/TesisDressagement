import React, { useEffect, useState } from "react";

import Button from '@material-ui/core/Button';

import {TextField} from '@material-ui/core'

import CssBaseline from '@material-ui/core/CssBaseline';
import Avatar from '@material-ui/core/Avatar';
import PersonAdd from '@material-ui/icons/PersonAdd';
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
    backgroundColor: '#303f9f',
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

function NuevaPersona() {
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

  const [personaNombre, setPersonaNombre] = useState('');
  const [personaCelular, setPersonaCelular] = useState('');
  const [personaEmail, setPersonaEmail] = useState('');

  const [estadoCarga, setEstadoCarga] = useState(0);

  const handleNombreChange = (event) => {
    setPersonaNombre(event.target.value);
  };

  const handleCelularChange = (event) => {
    setPersonaCelular(event.target.value);
  };

  const handleEmailChange = (event) => {
    setPersonaEmail(event.target.value);
  };

  const onSubmitClick = (e)=>{
    e.preventDefault()
    console.log("You pressed submit")
    let opts = {
      'personaNombre': personaNombre,
      'personaCelular': personaCelular,
      'personaEmail': personaEmail,
    }
    console.log(opts);

    fetch('/api/persona/new', {
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
              <PersonAdd />
            </Avatar>
            <Typography component="h1" variant="h5">
            Registro persona
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
                value={personaNombre}
                onChange={handleNombreChange}
              />
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                id="select-personaCelular"
                label="Telefono"
                name="Telefono"
                autoComplete="Teléfono"
                value={personaCelular}
                onChange={handleCelularChange}
              />
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                id="select-personaEmail"
                label="Email"
                name="nombre"
                autoComplete="Nombre"
                value={personaEmail}
                onChange={handleEmailChange}
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
              <PersonAdd />
            </Avatar>
            <Typography component="h1" variant="h5">
            Registro exitoso de <b>{personaNombre}</b>
            </Typography>
          </div>
        </Container>
      );
    }
  } else{
    return(<h2>No autorizado</h2>)
  }
}

export default NuevaPersona;