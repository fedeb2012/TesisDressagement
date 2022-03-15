import * as React from 'react';
import { useEffect, useState } from "react";

import axios from "axios"
import { DataGrid } from '@material-ui/data-grid';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import { makeStyles } from '@material-ui/core/styles';
import Avatar from '@material-ui/core/Avatar';
import Sports from '@material-ui/icons/Sports';
import Typography from '@material-ui/core/Typography';

import Container from '@material-ui/core/Container';

import { authFetch } from "../auth";

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(3),
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
    margin: theme.spacing(3, 2, 3),
    background: '#303f9f',
    color: '#FFFFFF',
  },  
}));

function Entrenamiento() {

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

    const [data, setData] = useState([]);
    const [entrenamientoID, setEntrenamientoID] = useState('');

    useEffect(() => {
      const fetchData = async () => {
        const result = await axios({
          url: 'http://127.0.0.1:5000/api/entrena/get',
        });
  
        setData(result.data);
      };
  
      fetchData();
    }, []);

    const columns = [
      {
        field: 'id',
        headerName: 'id',
        width: 100
      },
      {
        field: 'fecha_hora',
        headerName: 'Fecha hora',
        width: 200,
        valueGetter: (params) => {
          //console.log({ params });
          let result = "";
          if (params.row.entrenamiento) {
            if (params.row.entrenamiento.fecha_hora) {
              result = params.row.entrenamiento.fecha_hora;
            }
          } else {
            result = "No registrada";
          }
          return result;
        }
      },
      {
        field: 'persona_id',
        headerName: 'Caballo',
        width: 150,
        valueGetter: (params) => {
          //console.log({ params });
          let result = "";
          if (params.row.caballo) {
            if (params.row.caballo.nombre) {
              result = params.row.caballo.nombre;
            }
          } else {
            result = "Jhon doe";
          }
          return result;
        }
      },
      {
        field: 'persona',
        headerName: 'Persona',
        type: 'number',
        width: 150,
        valueGetter: (params) => {
          //console.log({ params });
          let result = "";
          if (params.row.persona) {
            if (params.row.persona.nombre) {
              result = params.row.persona.nombre;
            }
          } else {
            result = "Jhon doe";
          }
          return result;
        }
      },
      {
        field: 'rol_text',
        headerName: 'Rol',
        type: 'number',
        width: 200,
        valueGetter: (params) => {
          console.log({ params });
          let result = "";
          if (params.row.rol_text === '1') {
            result = "Jinete"
          } else if (params.row.rol_text === '2') {
            result = "Jinete"
          } else {
            result = "Otro"
          }
          return result;
        }
      },
      {
        field: 'entrenamiento_id',
        headerName: 'Entrenamiento',
        type: 'number',
        width: 200,
  
      },
      {
        field: 'Ver',
        headerName: 'Entrenamiento',
        type: 'number',
        width: 200,
        sortable: false,
        disableClickEventBubbling: true,
        renderCell: (params) => {
          if (params.row.persona) {
            if (params.row.persona.nombre==="Haras") {
              const onClick = () => {
                window.location.href = 'http://127.0.0.1:3000/modificarentrenamientoinicial?id=' + params.row.entrenamiento_id;
                return 0;
              };
              return <Button fullWidth variant="contained" color="primary" className={classes.submit} onClick={onClick}>Ver</Button>;
            } else{
              const onClick = () => {
                window.location.href = 'http://127.0.0.1:3000/verentrenamiento/' + params.row.entrenamiento_id;
                return 0;
              };
              return <Button fullWidth variant="contained" color="primary" className={classes.submit} onClick={onClick}>Ver</Button>;
            }
          }else{
            const onClick = () => {
              window.location.href = 'http://127.0.0.1:3000/verentrenamiento/' + params.row.entrenamiento_id;
              return 0;
            };
            return <Button fullWidth variant="contained" color="primary" className={classes.submit} onClick={onClick}>Ver</Button>;
          }
        }
      }
    ];
  
    const classes = useStyles();

    if(logged==1){
      return (
        <Container component="main" maxWidth="lg">
          <CssBaseline />
          <div className={classes.paper}>
            <Avatar className={classes.avatar}>
              <Sports />
            </Avatar>
            <Typography component="h1" variant="h5">
            Entrenamiento
            </Typography>
            <div style={{ height: 700, width: '100%',}}>
              <DataGrid rows={data} columns={columns} />
            </div>
          </div>
        </Container>
      );
    }
    else{
      return(<h2>No autorizado</h2>)
    }
  }
  
  export default Entrenamiento;