from classes.db_models import db, User, Dispositivo, Persona, Caballo, Entrenamiento, Pata, Rol, Medida, Entrena
from datetime import datetime
import os
import flask
from flask.globals import request
import flask_praetorian
import flask_cors
from flask import jsonify, make_response
import pandas as pd
import json
import threading
from angulo_e_impacto_v2 import calculo_angulo, calculo_impacto, calculo_max_impacto, calculo_max_angulo
from datos_y_angulos_filtrar import calculo_Datos_filtrados
from scipy.signal import butter, lfilter

import h2o
from h2o.estimators import H2OGradientBoostingEstimator


import csv

UPLOAD_FOLDER = '../public/assets/videos'
ALLOWED_EXTENSIONS = {'txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif', 'mp4'}

# db = flask_sqlalchemy.SQLAlchemy()
guard = flask_praetorian.Praetorian()
cors = flask_cors.CORS()

# Initialize flask app for the example
app = flask.Flask(__name__)
app.debug = True
app.config['SECRET_KEY'] = 'top secret'
app.config['JWT_ACCESS_LIFESPAN'] = {'hours': 24}
app.config['JWT_REFRESH_LIFESPAN'] = {'days': 30}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Initialize the flask-praetorian instance for the app
guard.init_app(app, User)

# Initialize a local database for the example
app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{os.path.join(os.getcwd(), 'database.db')}"
db.init_app(app)

# Initializes CORS so that the api_tool can talk to the example app
cors.init_app(app)

# specify max number of bytes of memory. uses all cores by default.
h2o.init(max_mem_size="8G")
h2o.remove_all()

# Import the prostate dataset into H2O:
# dispositivo1 = h2o.import_file("./analytics/e2d1.csv")
# dispositivo2 = h2o.import_file("./analytics/e2d2.csv")
# dispositivo3 = h2o.import_file("./analytics/e2d3.csv")
# dispositivo4 = h2o.import_file("./analytics/e2d4.csv")

dispositivo1 = h2o.import_file("./analytics/datasets_filtrados_modelo_2/d1_Paso_Trote_filtrado.csv")
dispositivo2 = h2o.import_file("./analytics/datasets_filtrados_modelo_2/d4_Paso_Trote_filtrado.csv")
dispositivo3 = h2o.import_file("./analytics/datasets_filtrados_modelo_2/d4_Paso_Trote_filtrado.csv")
dispositivo4 = h2o.import_file("./analytics/datasets_filtrados_modelo_2/d4_Paso_Trote_filtrado.csv")


# # # Set the predictors and response; set the factors:
dispositivo1["hay_paso"] = dispositivo1["hay_paso"].asfactor()
dispositivo2["hay_paso"] = dispositivo2["hay_paso"].asfactor()
dispositivo3["hay_paso"] = dispositivo3["hay_paso"].asfactor()
dispositivo4["hay_paso"] = dispositivo4["hay_paso"].asfactor()


#Predictores modelo 2:
predictors = ["fecha_hora","roll", "pitch", "yaw", "ax", "ay", "az", "gx", "gy", "gz"]
response = "hay_paso"

#modelo 2
pros_gbm = H2OGradientBoostingEstimator(
    ntrees=3000,    ##lleva más arboles al tener datasets más pequeños
    learn_rate=0.1,
    max_depth=20,
    sample_rate=0.7,
    col_sample_rate=0.7,
    stopping_rounds=2,
    stopping_tolerance=0.0001,  # 10-fold increase in threshold as defined in rf_v1
    score_each_iteration=True,
    seed=2000000
)

#Predictores modelo caballo
# predictors = ["fecha_hora", "ax", "ay", "az", "gx", "gy", "gz"]
# response = "hay_paso"

# pros_gbm = H2OGradientBoostingEstimator(
#     ntrees=30,
#     learn_rate=0.3,
#     max_depth=10,
#     sample_rate=0.7,
#     col_sample_rate=0.7,
#     stopping_rounds=2,
#     stopping_tolerance=0.01,  # 10-fold increase in threshold as defined in rf_v1
#     score_each_iteration=True,
#     seed=2000000
# )


# Add users for the example
with app.app_context():
    # db.drop_all()
    # db.create_all()

    if db.session.query(User).filter_by(username='Dressage').count() < 1:
        db.session.add(User(
            username='Dressage',
            password=guard.hash_password('1234'),
            roles='admin'
        ))
    if db.session.query(Entrenamiento).filter_by(duracion='100').count() < 1:
        entrenamiento1 = Entrenamiento(
            fecha_hora=datetime.now(),
            duracion='100',
            bitstream='pepe/pepe1'
        )
        db.session.add(entrenamiento1)

    if db.session.query(Dispositivo).filter_by(number='1').count() < 1:
        dispositivo1 = Dispositivo(number='1', tipo='1')
        dispositivo2 = Dispositivo(number='2', tipo='1')
        db.session.add(dispositivo1)
        db.session.add(dispositivo2)
    if db.session.query(Pata).filter_by(entrenamiento_id='1').count() < 1:
        entrenamiento1.patas.append(dispositivo1)
    data = {}
    csvFilePath = './analytics/dataset_training_250_segundos.csv'
    with open(csvFilePath) as csvFile:
        csvReader = csv.DictReader(csvFile)
        for rows in csvReader:
            fecha_hora = rows['fecha_hora']
            entrenamiento_id = 1
            dispositivo_id = 1
            ax = rows['ax']
            ay = rows['ax']
            az = rows['ax']
            gx = rows['ax']
            gy = rows['ax']
            gz = rows['ax']
            mx = 0
            my = 0
            mz = 0
            tiempo = rows['fecha_hora']
            nuevaMedida = Medida(
                entrenamiento_id=entrenamiento_id,
                dispositivo_id=dispositivo_id,
                ax=ax,
                ay=ay,
                az=az,
                gx=gx,
                gy=gy,
                gz=gz,
                mx=mx,
                my=my,
                mz=mz,
                fecha_hora=tiempo
            )
            db.session.add(nuevaMedida)
    with open(csvFilePath) as csvFile:
        csvReader = csv.DictReader(csvFile)
        for rows in csvReader:
            fecha_hora = rows['fecha_hora']
            entrenamiento_id = 1
            dispositivo_id = 2
            ax = rows['ax']
            ay = rows['ax']
            az = rows['ax']
            gx = rows['ax']
            gy = rows['ax']
            gz = rows['ax']
            mx = 0
            my = 0
            mz = 0
            tiempo = rows['fecha_hora']
            nuevaMedida = Medida(
                entrenamiento_id=entrenamiento_id,
                dispositivo_id=dispositivo_id,
                ax=ax,
                ay=ay,
                az=az,
                gx=gx,
                gy=gy,
                gz=gz,
                mx=mx,
                my=my,
                mz=mz,
                fecha_hora=tiempo
            )
            db.session.add(nuevaMedida)
    with open(csvFilePath) as csvFile:
        csvReader = csv.DictReader(csvFile)
        for rows in csvReader:
            fecha_hora = rows['fecha_hora']
            entrenamiento_id = 1
            dispositivo_id = 3
            ax = rows['ax']
            ay = rows['ax']
            az = rows['ax']
            gx = rows['ax']
            gy = rows['ax']
            gz = rows['ax']
            mx = 0
            my = 0
            mz = 0
            tiempo = rows['fecha_hora']
            nuevaMedida = Medida(
                entrenamiento_id=entrenamiento_id,
                dispositivo_id=dispositivo_id,
                ax=ax,
                ay=ay,
                az=az,
                gx=gx,
                gy=gy,
                gz=gz,
                mx=mx,
                my=my,
                mz=mz,
                fecha_hora=tiempo
            )
            db.session.add(nuevaMedida)
    with open(csvFilePath) as csvFile:
        csvReader = csv.DictReader(csvFile)
        for rows in csvReader:
            fecha_hora = rows['fecha_hora']
            entrenamiento_id = 1
            dispositivo_id = 4
            ax = rows['ax']
            ay = rows['ax']
            az = rows['ax']
            gx = rows['ax']
            gy = rows['ax']
            gz = rows['ax']
            mx = 0
            my = 0
            mz = 0
            tiempo = rows['fecha_hora']
            nuevaMedida = Medida(
                entrenamiento_id=entrenamiento_id,
                dispositivo_id=dispositivo_id,
                ax=ax,
                ay=ay,
                az=az,
                gx=gx,
                gy=gy,
                gz=gz,
                mx=mx,
                my=my,
                mz=mz,
                fecha_hora=tiempo
            )
            db.session.add(nuevaMedida)

    personaDefault = Persona(
        nombre='Haras',
        celular='0',
        email='haras@haras.com'
    )
    caballoDefault = Caballo(
        nombre='Haras'
    )
    rolDefault = Rol(
        persona_id=1,
        caballo_id=1,
        rol='1'
    )
    entrena1 = Entrena(
        persona_id=1,
        caballo_id=1,
        rol_text='1',
        entrenamiento_id=1)
    # db.session.add(personaDefault)
    # db.session.add(caballoDefault)
    # db.session.add(rolDefault)
    # db.session.add(entrena1)
    # db.session.commit()


def thread_newmedida(req):
    print(datetime.now())
    with app.app_context():
        # df = pd.DataFrame(flask.request.get_json(force=True))
        # df.to_csv("pepe.csv")
        for medida in req:
            # print(medida)

            entrenamiento_id = medida.get('entrenamiento_id', None)
            dispositivo_id = medida.get('id', None)
            ax = medida.get('ax', None)
            ay = medida.get('ay', None)
            az = medida.get('az', None)
            gx = medida.get('gx', None)
            gy = medida.get('gy', None)
            gz = medida.get('gz', None)
            mx = medida.get('mx', None)
            my = medida.get('my', None)
            mz = medida.get('mz', None)
            tiempo = medida.get('tiempo', None)
            nuevaMedida = Medida(
                entrenamiento_id=entrenamiento_id,
                dispositivo_id=dispositivo_id,
                ax=ax,
                ay=ay,
                az=az,
                gx=gx,
                gy=gy,
                gz=gz,
                mx=mx,
                my=my,
                mz=mz,
                fecha_hora=tiempo
            )

            db.session.add(nuevaMedida)
        print(datetime.now())
        db.session.commit()
        print(datetime.now())


def thread_pruebanuevamedida(req):
    print(datetime.now())
    df = pd.DataFrame(req)
    df.to_csv("pepe.csv", mode='a', header=False)
    print(datetime.now())


# Set up some routes for the example


@ app.route('/api')
def home():
    return {"Hello": "Juan"}, 200


@ app.route('/api/login', methods=['POST'])
def login():
    """
    Logs a user in by parsing a POST request containing user credentials and
    issuing a JWT token.
    .. example::
       $ curl http://localhost:5000/api/login -X POST -d '{"username":"Yasoob","password":"strongpassword"}'
    """
    req = flask.request.get_json(force=True)
    username = req.get('username', None)
    password = req.get('password', None)
    user = guard.authenticate(username, password)
    ret = {'access_token': guard.encode_jwt_token(user)}
    return ret, 200


@ app.route('/api/refresh', methods=['POST'])
def refresh():
    """
    Refreshes an existing JWT by creating a new one that is a copy of the old
    except that it has a refrehsed access expiration.
    .. example::
       $ curl http://localhost:5000/api/refresh -X GET \
         -H "Authorization: Bearer <your_token>"
    """
    print("refresh request")
    old_token = request.get_data()
    new_token = guard.refresh_jwt_token(old_token)
    ret = {'access_token': new_token}
    return ret, 200


@ app.route('/api/protected')
@ flask_praetorian.auth_required
def protected():
    """
    A protected endpoint. The auth_required decorator will require a header
    containing a valid JWT
    .. example::
       $ curl http://localhost:5000/api/protected -X GET \
         -H "Authorization: Bearer <your_token>"
    """
    return {'message': f'protected endpoint (allowed user {flask_praetorian.current_user().username})'}


@ app.route('/api/persona/new', methods=['POST'])
def newpersona():

    req = flask.request.get_json(force=True)
    personaNombre = req.get('personaNombre', None)
    personaCelular = req.get('personaCelular', None)
    personaEmail = req.get('personaEmail', None)
    newPersona = Persona(
        nombre=personaNombre,
        celular=personaCelular,
        email=personaEmail
    )
    # print(req)
    db.session.add(newPersona)
    db.session.commit()
    ret = "Guardado correctamente"
    return ret, 200


@ app.route('/api/caballo/new', methods=['POST'])
def newcaballo():

    req = flask.request.get_json(force=True)
    caballoNombre = req.get('caballoNombre', None)
    newCaballo = Caballo(
        nombre=caballoNombre,
    )
    # print(req)
    db.session.add(newCaballo)
    db.session.commit()
    ret = "Guardado correctamente"
    return ret, 200


@ app.route('/api/rol/new', methods=['POST'])
def newrol():

    req = flask.request.get_json(force=True)
    personaID = req.get('personaID', None)
    caballoID = req.get('caballoID', None)
    rolID = req.get('rolID', None)
    newRol = Rol(
        persona_id=personaID,
        caballo_id=caballoID,
        rol=rolID
    )
    # print(req)
    db.session.add(newRol)
    db.session.commit()
    ret = "Guardado correctamente"
    return ret, 200


@ app.route('/api/entrenamiento/new', methods=['GET'])
def newtraining():

    # req = flask.request.get_json(force=True)
    fecha_hora = datetime.now()
    # duracion = req.get('duracion', None)
    # bitstream = req.get('bitstream', None)
    newtraining = Entrenamiento(
        fecha_hora=fecha_hora,
    )
    db.session.add(newtraining)
    db.session.commit()
    newentrena = Entrena(
        persona_id=1,
        caballo_id=1,
        rol_text='1',
        entrenamiento_id=newtraining.id)
    db.session.add(newentrena)
    db.session.commit()
    # print(newtraining.id)
    ret = str(newtraining.id)
    return ret, 200


@ app.route('/api/medida/new', methods=['POST'])
def newmedida():

    req = flask.request.get_json(force=True)
    # print(type(req))
    thread = threading.Thread(target=thread_newmedida, args=(req,))
    thread.start()

    ret = "Guardado correctamente"
    return ret, 200


@ app.route('/api/pruebanuevamedida', methods=['POST'])
def pruebanuevamedida():

    req = flask.request.get_json(force=True)
    thread = threading.Thread(target=thread_pruebanuevamedida, args=(req,))
    thread.start()

    ret = "Guardado correctamente"
    return ret, 200

# Devuelve el jinete y el caballo de un entrenamiento dado.
# Recibe el ID de entrenamiento y devuelve objetos persona, caballo y rol.


@ app.route('/api/entrena/get', methods=['POST'])
def getentrena():
    req = flask.request.get_json(force=True)
    entrenamiento_id = req.get('entrenamiento_id', None)
    # print("refresh request")
    datosEntrena = Entrena.get_entrena(entrenamiento_id)
    return datosEntrena


@ app.route('/api/medida/get', methods=['POST'])
def getmedidas():
    req = flask.request.get_json(force=True)
    entrenamiento_id = req.get('entrenamiento_id', None)
    dispositivo_id = req.get('dispositivo_id', None)
    # print("refresh request")
    datosMedidas = Medida.get_medidas(entrenamiento_id, dispositivo_id)
    return datosMedidas


@ app.route('/api/medida/dispositivo/get', methods=['POST'])
def dispositivosEntrenamiento():
    print("All dispositivos entrenamiento")
    req = flask.request.get_json(force=True)
    entrenamiento_id = req.get('entrenamiento_id', None)
    medidaDispositivos = Medida.get_entrenamiento_dispositivos(
        entrenamiento_id)
    return medidaDispositivos


@ app.route('/api/analytics/paso/get', methods=['POST'])
def getpaso():
    req = flask.request.get_json(force=True)
    entrenamiento_id = req.get('entrenamiento_id', None)
    dispositivo_id = req.get('dispositivo_id', None)
    
    if(dispositivo_id == 1):
        # split the data as described above
        train, valid, test = dispositivo1.split_frame([0.6, 0.2], seed=1234)
        pros_gbm.train(x=predictors, y=response,
                       training_frame=train, validation_frame=valid)
    elif(dispositivo_id == 2):
        train, valid, test = dispositivo2.split_frame([0.6, 0.2], seed=1234)
        pros_gbm.train(x=predictors, y=response,
                       training_frame=train, validation_frame=valid)
    elif(dispositivo_id == 3):
        train, valid, test = dispositivo3.split_frame([0.6, 0.2], seed=1234)
        pros_gbm.train(x=predictors, y=response,
                       training_frame=train, validation_frame=valid)
    elif(dispositivo_id == 4):
        train, valid, test = dispositivo4.split_frame([0.6, 0.2], seed=1234)
        pros_gbm.train(x=predictors, y=response,
                       training_frame=train, validation_frame=valid)

    datosMedidas = Medida.get_medidas_array(entrenamiento_id, dispositivo_id)

    #csvConstruct(datosMedidas)

    ##para construir el csv temporal con los datos filtrados, y también roll,pitch y yaw filtrados
    csvConstruct_filtered(datosMedidas)

    # datos_a_probar = h2o.import_file(
    #     "./analytics/temp_datos_medidas.csv")

    datos_a_probar = h2o.import_file(
        "./analytics/temp_datos_medidas_filtradas.csv")

    resultado = pros_gbm.predict(datos_a_probar)

    h2o.export_file(
        resultado, path="./analytics/predicciones/temp_prediccion.csv", force=True)

    csvAppend(datosMedidas)

    csvFilePath = './analytics/predicciones/return_prediccion.csv'

    with open(csvFilePath) as csvFile:
        csvReader = csv.DictReader(csvFile)
        out = json.dumps([row for row in csvReader])

    return out


@ app.route('/api/analytics/angulo/get', methods=['POST'])
def getangulo():
    req = flask.request.get_json(force=True)
    entrenamiento_id = req.get('entrenamiento_id', None)
    dispositivo_id = req.get('dispositivo_id', None)
    # print("refresh request")
    # devuelve un diccionario en este caso
    datosMedidas = Medida.get_medidas_dict(entrenamiento_id, dispositivo_id)
    print(datetime.now())
    angulo = calculo_angulo(datosMedidas)
    print(datetime.now())

    return jsonify(json.loads(angulo))


@ app.route('/api/analytics/impacto/get', methods=['POST'])
def getimpacto():
    req = flask.request.get_json(force=True)
    entrenamiento_id = req.get('entrenamiento_id', None)
    dispositivo_id = req.get('dispositivo_id', None)
    # print("refresh request")
    # devuelve un diccionario en este caso
    datosImpacto = Medida.get_medidas_dict(entrenamiento_id, dispositivo_id)
    impacto = calculo_impacto(datosImpacto)
    return jsonify(json.loads(impacto))


@ app.route('/api/analytics/maximpacto/get', methods=['POST'])
def getmaximpacto():
    req = flask.request.get_json(force=True)
    entrenamiento_id = req.get('entrenamiento_id', None)
    dispositivo_id = req.get('dispositivo_id', None)
    # print("refresh request")
    # devuelve un diccionario en este caso
    datosImpacto = Medida.get_medidas_dict(entrenamiento_id, dispositivo_id)
    maxImpacto = calculo_max_impacto(datosImpacto)

    return jsonify(json.loads(maxImpacto))


@ app.route('/api/analytics/maxangulo/get', methods=['POST'])
def getmaxangulo():
    req = flask.request.get_json(force=True)
    entrenamiento_id = req.get('entrenamiento_id', None)
    dispositivo_id = req.get('dispositivo_id', None)
    # print("refresh request")
    # devuelve un diccionario en este caso
    datosAngulo = Medida.get_medidas_dict(entrenamiento_id, dispositivo_id)
    maxAngulo = calculo_max_angulo(datosAngulo)

    return jsonify(json.loads(maxAngulo))


@ app.route('/api/persona/count', methods=['GET'])
def countpersona():
    # print("refresh request")
    personaCount = Persona.count()
    return personaCount


@ app.route('/api/caballo/count', methods=['GET'])
def countcaballo():
    # print("refresh request")
    caballoCount = Caballo.count()
    return caballoCount


@ app.route('/api/entrenamiento/count', methods=['GET'])
def countentrenamiento():
    # print("refresh request")
    entrenamientoCount = Entrenamiento.count()
    return entrenamientoCount


@ app.route('/api/setgrabacion', methods=['GET', 'POST'])
def setgrabacion():
    if request.method == 'POST':
        if 'file' not in flask.request.files:
            flask.flash('No file part')
            print('No file part')
            return flask.redirect(flask.request.url)
        file = flask.request.files['file']
        print(file)
        # If the user does not select a file, the browser submits an
        # empty file without a filename.
        if file.filename == '':
            flask.flash('No selected file')
            print('No selected file')
            return flask.redirect(flask.request.url)
        if file and allowed_file(file.filename):
            filename = file.filename
            print(file.filename)
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            return 'recibido'
    return '''
    <!doctype html>
    <title>Upload new File</title>
    <h1>Upload new File</h1>
    <form method=post enctype=multipart/form-data>
      <input type=file name=file>
      <input type=submit value=Upload>
    </form>
    '''


def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Actualiza que caballo y que jinete realizo el entrenamiento.


@ app.route('/api/entrena/update', methods=['POST'])
def updatetraining():
    req = flask.request.get_json(force=True)
    persona_id = req.get('persona_id', None)
    caballo_id = req.get('caballo_id', None)
    entrenamiento_id = req.get('entrenamiento_id', None)
    db.session.query(Entrena).filter_by(
        id=entrenamiento_id).update({"persona_id": persona_id, "caballo_id": caballo_id})
    db.session.commit()

    ret = "OK"
    return ret, 200


@ app.route('/api/entrena/countcaballo', methods=['GET'])
def countentrenacaballo():
    # print("refresh request")
    caballoCount = Entrena.count_entrena_caballos()
    return caballoCount


@ app.route('/api/entrena/get')
def alltraining():
    print("All trainings")
    allEntrena = Entrena.get_entrenas()
    return allEntrena


@ app.route('/api/persona/get')
def allpersonas():
    print("All personas")
    allPersona = Persona.get_personas()
    return allPersona


@ app.route('/api/caballo/get')
def allcaballos():
    print("All caballos")
    allCaballo = Caballo.get_caballos()
    return allCaballo


def csvConstruct(datosmedida):
    fieldnames = ["fecha_hora", "ax", "ay", "az", "gx", "gy", "gz"]

    with open('./analytics/temp_datos_medidas.csv', 'w') as csv_file:
        csv_writer = csv.DictWriter(csv_file, fieldnames=fieldnames)
        csv_writer.writeheader()

    for medida in datosmedida:

        with open('./analytics/temp_datos_medidas.csv', 'a') as csv_file:
            csv_writer = csv.DictWriter(csv_file, fieldnames=fieldnames)

            info = {
                "fecha_hora": medida['fecha_hora'],
                "ax": medida['ax'],
                "ay": medida['ay'],
                "az": medida['az'],
                "gx": medida['gx'],
                "gy": medida['gy'],
                "gz": medida['gz']
            }

            csv_writer.writerow(info)

    return 0

def csvConstruct_filtered(datosmedida):

    fieldnames = ["fecha_hora", "roll", "pitch", "yaw", "ax", "ay", "az", "gx", "gy", "gz"]

    t_muestra, filtered_roll, filtered_pitch, filtered_yaw, acc_x_filtered, acc_y_filtered, acc_z_filtered, gyr_x_filtered, gyr_y_filtered, gyr_z_filtered = calculo_Datos_filtrados(datosmedida)

    with open('./analytics/temp_datos_medidas_filtradas.csv', 'w') as csv_file:
        csv_writer = csv.DictWriter(csv_file, fieldnames=fieldnames)
        csv_writer.writeheader()

    for i in range(filtered_roll.size):

        with open('./analytics/temp_datos_medidas_filtradas.csv', 'a') as csv_file:
            csv_writer = csv.DictWriter(csv_file, fieldnames=fieldnames)

            info = {
                "fecha_hora": t_muestra[i],
                "roll": filtered_roll[i],
                "pitch": filtered_pitch[i],
                "yaw": filtered_yaw[i],
                "ax": acc_x_filtered[i],
                "ay": acc_y_filtered[i],
                "az": acc_z_filtered[i],
                "gx": gyr_x_filtered[i],
                "gy": gyr_y_filtered[i],
                "gz": gyr_z_filtered[i]
            }

            csv_writer.writerow(info)

    return 0


def csvAppend(datosmedida):
    filename = open('./analytics/predicciones/temp_prediccion.csv', 'r')

    file = csv.DictReader(filename)

    predict = []
    for col in file:
        predict.append(col['predict'])

    fieldnames = ["fecha_hora", "predict"]

    with open('./analytics/predicciones/return_prediccion.csv', 'w') as csv_file:
        csv_writer = csv.DictWriter(csv_file, fieldnames=fieldnames)
        csv_writer.writeheader()

    i = 0

    for medida in datosmedida:
        with open('./analytics/predicciones/return_prediccion.csv', 'a') as csv_file:
            csv_writer = csv.DictWriter(csv_file, fieldnames=fieldnames)

            preditAmplificado = int(predict[i]) * 4

            info = {
                "fecha_hora": medida['fecha_hora'],
                "predict": preditAmplificado
            }

            csv_writer.writerow(info)
            i = i+1

    return 0


# Run the example
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
