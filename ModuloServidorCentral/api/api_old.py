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


# Add users for the example
with app.app_context():
    db.drop_all()
    db.create_all()

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
        entrenamiento2 = Entrenamiento(
            fecha_hora=datetime.now(),
            duracion='200',
            bitstream='pepe/pepe2'
        )
        db.session.add(entrenamiento1)
        db.session.add(entrenamiento2)
    if db.session.query(Dispositivo).filter_by(number='1').count() < 1:
        dispositivo1 = Dispositivo(number='1', tipo='1')
        dispositivo2 = Dispositivo(number='2', tipo='1')
        db.session.add(dispositivo1)
        db.session.add(dispositivo2)
    if db.session.query(Pata).filter_by(entrenamiento_id='1').count() < 1:
        entrenamiento1.patas.append(dispositivo1)
    f = open('demoJSON_3dig.json', "r")
    data = json.loads(f.read())
    for medida in data:
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

    f = open('demoJSON.json', "r")
    data = json.loads(f.read())
    for medida in data:
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
    entrena2 = Entrena(
        persona_id=1,
        caballo_id=1,
        rol_text='1',
        entrenamiento_id=2)
    db.session.add(personaDefault)
    db.session.add(caballoDefault)
    db.session.add(rolDefault)
    db.session.add(entrena1)
    db.session.add(entrena2)
    db.session.commit()


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


@ app.route('/api/newpersona', methods=['POST'])
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
    print(req)
    db.session.add(newPersona)
    db.session.commit()
    ret = "Guardado correctamente"
    return ret, 200


@ app.route('/api/newcaballo', methods=['POST'])
def newcaballo():

    req = flask.request.get_json(force=True)
    caballoNombre = req.get('caballoNombre', None)
    newCaballo = Caballo(
        nombre=caballoNombre,
    )
    print(req)
    db.session.add(newCaballo)
    db.session.commit()
    ret = "Guardado correctamente"
    return ret, 200


@ app.route('/api/newrol', methods=['POST'])
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
    print(req)
    db.session.add(newRol)
    db.session.commit()
    ret = "Guardado correctamente"
    return ret, 200


@ app.route('/api/newentrenamiento', methods=['GET'])
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
    print(newtraining.id)
    ret = str(newtraining.id)
    return ret, 200


@ app.route('/api/newmedida', methods=['POST'])
def newmedida():

    req = flask.request.get_json(force=True)
    print(type(req))
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


@ app.route('/api/getentrena', methods=['POST'])
def getentrena():
    req = flask.request.get_json(force=True)
    entrenamiento_id = req.get('entrenamiento_id', None)
    # print("refresh request")
    allentrena = Entrena.get_entrena(entrenamiento_id)
    return allentrena


@ app.route('/api/getmedidas', methods=['POST'])
def getmedidas():
    req = flask.request.get_json(force=True)
    entrenamiento_id = req.get('entrenamiento_id', None)
    dispositivo_id = req.get('dispositivo_id', None)
    # print("refresh request")
    allmedidas = Medida.get_medidas(entrenamiento_id, dispositivo_id)
    return allmedidas


@ app.route('/api/dispositivosentrenamiento', methods=['POST'])
def dispositivosEntrenamiento():
    print("All dispositivos entrenamiento")
    req = flask.request.get_json(force=True)
    entrenamiento_id = req.get('entrenamiento_id', None)
    alldispositivos = Medida.get_entrenamiento_dispositivos(
        entrenamiento_id)
    return alldispositivos


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


@ app.route('/api/updateentrenamiento', methods=['POST'])
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


@ app.route('/api/alltraining')
def alltraining():
    print("All trainings")
    allentrena = Entrena.get_entrenas()
    return allentrena


@ app.route('/api/allpersonas')
def allpersonas():
    print("All personas")
    pepe = Persona.get_personas()
    return pepe


@ app.route('/api/allcaballos')
def allcaballos():
    print("All caballos")
    pepe = Caballo.get_caballos()
    return pepe


# Run the example
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
