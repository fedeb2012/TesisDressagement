import React, { useEffect, useState } from "react";

import axios from "axios"
import Select from '@material-ui/core/Select';
import Button from '@material-ui/core/Button';
import MenuItem from '@material-ui/core/MenuItem';

import InputLabel from '@material-ui/core/InputLabel';
import CssBaseline from '@material-ui/core/CssBaseline';
import Avatar from '@material-ui/core/Avatar';
import Add from '@material-ui/icons/Add';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import FormControl from '@material-ui/core/FormControl';

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
    margin: theme.spacing(1),
    minWidth: 120,
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
    background: '#303f9f',
    color: '#FFFFFF',
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
  inputlbl: {
    marginTop: theme.spacing(2),
  },
}));

function AsignarRol() {
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
    
    const [personas, setPersonas] = useState([]);
    const [caballos, setCaballos] = useState([]);
    const [personaID, setPersonaID] = useState('');
    const [caballoID, setCaballoID] = useState('');
    const [rolID, setRolID] = useState('');
  
    const handleChangePersona = (event) => {
      setPersonaID(event.target.value);
    };
  
    const handleChangeCaballo = (event) => {
      setCaballoID(event.target.value);
    };
  
    const handleChangeRol = (event) => {
      setRolID(event.target.value);
    };
  
    useEffect(() => {
      const fetchData = async () => {
        const result = await axios({
          url: 'http://127.0.0.1:5000/api/persona/get',
        });
  
        setPersonas(result.data);
      };
  
      const fetchData2 = async () => {
        const result = await axios({
          url: 'http://127.0.0.1:5000/api/caballo/get',
        });
  
        setCaballos(result.data);
      };
      
      fetchData();
      fetchData2();
    }, []);
  
    const onSubmitClick = (e)=>{
      e.preventDefault()
      console.log("You pressed submit")
      let opts = {
        'personaID': personaID,
        'caballoID': caballoID,
        'rolID': rolID,
      }
      console.log(opts)
      fetch('/api/rol/new', {
        method: 'post',
        body: JSON.stringify(opts)
      }).then(r => r.json())
    }

    const classes = useStyles();

    if(logged==1){
      return (
        <Container component="main" maxWidth="xs">
          <CssBaseline />
          <div className={classes.paper}>
            <Avatar className={classes.avatar}>
              <Add />
            </Avatar>
            <Typography component="h1" variant="h5">
            Asignar rol
            </Typography>
            <FormControl className={classes.form} noValidate>
              <InputLabel          
                id="demo-simple-select-label">
              Persona
              </InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="select-entrenamientoid"
                fullWidth
                value={personaID}
                onChange={handleChangePersona}
              >
                { personas.map( ( {nombre, persona_id} ) => {
                  return <MenuItem value={persona_id}>{nombre}</MenuItem>
                })}
              </Select>
            </FormControl>
            <FormControl className={classes.form} noValidate>
              <InputLabel       
                id="caballoid">
              Caballo
              </InputLabel>
              <Select
                labelId="caballoid"
                id="select-entrenamientoid"
                fullWidth
                value={caballoID}
                onChange={handleChangeCaballo}
              >
                { caballos.map( ( {nombre, caballo_id} ) => {
                  return <MenuItem value={caballo_id}>{nombre}</MenuItem>
                })}
              </Select>
              </FormControl>
            <FormControl className={classes.form} noValidate>
              <InputLabel       
                id="rolid">
              Rol
              </InputLabel>
              <Select
                labelId="rolid"
                id="select-entrenamientoid"
                fullWidth
                value={rolID}
                onChange={handleChangeRol}
              >
                <MenuItem value="1">Jinete</MenuItem>
                <MenuItem value="2">Entrenador</MenuItem>
                <MenuItem value="3">Otro</MenuItem>  
              </Select>
              </FormControl>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"x  
                className={classes.submit}
                onClick={onSubmitClick} 
              >Registrar</Button>
            
          </div>
        </Container>
      );
    } else{
      return(<h2>No autorizado</h2>)
    }
  }

  export default AsignarRol;