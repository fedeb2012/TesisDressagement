import React, { useEffect, useState } from "react";

import axios from "axios"

import Box from '@material-ui/core/Box';
import CssBaseline from '@material-ui/core/CssBaseline';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import {
  Chart,
  PieSeries,
  LineSeries,
  ArgumentAxis,
  ValueAxis,
  Legend,
  Title,
  ZoomAndPan
} from '@devexpress/dx-react-chart-material-ui';


import LastEntrenamiento from '../components/lastEntrenamientosCard';
import StatsCards from '../components/statsCards';
import Card from '../components/card';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHorseHead, faUser, faStopwatch, faHistory } from '@fortawesome/free-solid-svg-icons'
import { Container, Row, Col, Table } from "react-bootstrap";

import { authFetch } from "../auth";

// Import css
import "../styles/home.css"

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
  },
  title: {
    flexGrow: 1,
  },
  content: {
    flexGrow: 1,
    height: '100vh',
    overflow: 'auto',
  },
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  paper: {
    padding: theme.spacing(2),
    display: 'flex',
    overflow: 'auto',
    flexDirection: 'column',
  },
  fixedHeight: {
    height: 240,
  },
  highlight:{
    color:'blue'
  }
}));

function Home() {
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

    useEffect(() => {
      const fetchData = async () => {
        const result = await axios({
          url: 'http://127.0.0.1:5000/api/entrena/get',
        });
  
        setData(result.data);
      };
      
      const fetchPersonasCount = async () => {
        const aaa = await axios({
          url: 'http://127.0.0.1:5000/api/persona/count',
        });
  
        setPersonasCount(aaa.data);
        console.log(aaa.data)
      };

      const fetchCaballosCount = async () => {
        const bbb = await axios({
          url: 'http://127.0.0.1:5000/api/caballo/count',
        });
  
        setCaballosCount(bbb.data);
      };

      const fetchEntrenamientosCount = async () => {
        const ccc = await axios({
          url: 'http://127.0.0.1:5000/api/entrenamiento/count',
        });
  
        setEntrenamientosCount(ccc.data);
      };

      const fetchEntrenaCaballos = async () => {
        const ddd = await axios({
          url: 'http://127.0.0.1:5000/api/entrena/countcaballo',
        });
  
        setEntrenaCaballo(ddd.data);
        console.log(ddd.data);
      };
  
      fetchPersonasCount();
      fetchCaballosCount();
      fetchEntrenamientosCount();
      fetchEntrenaCaballos();
      fetchData();
    }, []);

    const classes = useStyles();
    const [data, setData] = useState(2);

    const [personasCount, setPersonasCount] = useState('0');
    const [caballosCount, setCaballosCount] = useState('0');
    const [entrenamientosCount, setEntrenamientosCount] = useState('0');
    const [entrenaCaballo, setEntrenaCaballo] = useState('');

    if(logged==1){
      if(data && entrenaCaballo && entrenamientosCount && caballosCount && personasCount){
        return (
          <div className={classes.root}>
            <CssBaseline />
            <main className={classes.content}>
              <div className={classes.appBarSpacer} />
              <Container maxWidth="lg" className={classes.container}>
                <Row>
                  <Col lg={4} sm={6}>
                    <StatsCards
                      bigIcon={<FontAwesomeIcon icon={faUser} style={{color: "#87cb16"}} />}
                      statsText="Personas"
                      statsValue={personasCount}
                      statsIcon={<FontAwesomeIcon icon={faHistory} />}
                      statsIconText="Updated now"
                    />
                  </Col>
                  <Col lg={4} sm={6}>
                      <StatsCards
                        bigIcon={<FontAwesomeIcon icon={faHorseHead}  style={{color: "#AC6538 "}} />}
                        statsText="Caballos"
                        statsValue={caballosCount}
                        statsIcon={<FontAwesomeIcon icon={faHistory} />}
                        statsIconText="Updated now"
                      />
                  </Col>
                  <Col lg={4} sm={6}>
                      <StatsCards
                        bigIcon={<FontAwesomeIcon icon={faStopwatch} style={{color: "#1d62f0"}} />}
                        statsText="Entrenamientos"
                        statsValue={entrenamientosCount}
                        statsIcon={<FontAwesomeIcon icon={faHistory} />}
                        statsIconText="Updated now"
                      />
                  </Col>
                </Row>
                <Row>
                  <Col md={8}>
                    <Card 
                      title="Últimos entrenamientos registrados"
                      ctTableFullWidth
                      ctTableResponsive
                      content={
                        <Table striped hover>
                          <thead>
                            <tr>
                              <th>FECHA</th>
                              <th>JINETE</th>
                              <th>CABALLO</th>
                            </tr>
                          </thead>
                          <tbody>
                              {Object.values(data).map((number) =>
                              <tr>
                                <td>{number.entrenamiento.fecha_hora}</td>
                                <td>{number.persona.nombre}</td>
                                <td>{number.caballo.nombre}</td>
                              </tr>)}
                          </tbody>
                        </Table>
                      } />
                    </Col>
                  <Col md={4}>
                      <Card
                        statsIcon="fa fa-clock-o"
                        title="Estadísticas entrenamiento"
                        category="Cantidad de entrenamientos por caballo"
                        stats=" Updated now"
                        content={
                          <div
                            id="chartPreferences"
                            className="ct-chart ct-perfect-fourth"
                          >
                            <Chart
                              data={entrenaCaballo}
                              className="chartHeight"
                            >
                              <ArgumentAxis />
                              <ValueAxis />
                              <PieSeries
                                name="Cantidad"
                                valueField="count"
                                argumentField="nombre"
                              />
                            </Chart>
                          </div>
                        }
                        legend={
                          <div className="legend"></div>
                        }
                      />
                  </Col>
                </Row>
              </Container>
            </main>
          </div>
        );
      } else{
        return (
          <div className={classes.root}>
            <CssBaseline />
            <main className={classes.content}>
              <div className={classes.appBarSpacer} />
              <Container maxWidth="lg" className={classes.container}>
                <Row>
                  <Col lg={4} sm={6}>
                    <StatsCards
                      bigIcon={<FontAwesomeIcon icon={faUser} />}
                      statsText="Personas"
                      statsValue={personasCount}
                      statsIcon={<FontAwesomeIcon icon={faHistory} />}
                      statsIconText="Updated now"
                    />
                  </Col>
                  <Col lg={4} sm={6}>
                      <StatsCards
                        bigIcon={<FontAwesomeIcon icon={faHorseHead} />}
                        statsText="Caballos"
                        statsValue={caballosCount}
                        statsIcon={<FontAwesomeIcon icon={faHistory} />}
                        statsIconText="Updated now"
                      />
                  </Col>
                  <Col lg={4} sm={6}>
                      <StatsCards
                        bigIcon={<FontAwesomeIcon icon={faStopwatch} />}
                        statsText="Entrenamientos"
                        statsValue={entrenamientosCount}
                        statsIcon={<FontAwesomeIcon icon={faHistory} />}
                        statsIconText="Updated now"
                      />
                  </Col>
                  </Row>
                </Container>
              </main>
            </div>
          )
      }
    }
    else{
      return(<h2>No autorizado</h2>)
    }
  }

export default Home;