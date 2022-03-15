import flask_sqlalchemy
from sqlalchemy import func
from sqlalchemy import text
from flask import jsonify
from sqlalchemy.inspection import inspect
from sqlalchemy_serializer import SerializerMixin
import json

db = flask_sqlalchemy.SQLAlchemy()


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.Text, unique=True)
    password = db.Column(db.Text)
    roles = db.Column(db.Text)
    is_active = db.Column(db.Boolean, default=True, server_default='true')

    @property
    def rolenames(self):
        try:
            return self.roles.split(',')
        except Exception:
            return []

    @classmethod
    def lookup(cls, username):
        return cls.query.filter_by(username=username).one_or_none()

    @classmethod
    def identify(cls, id):
        return cls.query.get(id)

    @property
    def identity(self):
        return self.id

    def is_valid(self):
        return self.is_active


class Persona(db.Model, SerializerMixin):
    persona_id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.Text, nullable=False)
    celular = db.Column(db.Integer, nullable=False)
    email = db.Column(db.Text, nullable=False)

    @classmethod
    def lookup(cls, username):
        return cls.query.filter_by(nombre=username).one_or_none()

    @classmethod
    def identify(cls, id):
        return cls.query.get(id)

    @property
    def identity(self):
        return self.persona_id

    def count():
        count = Persona.query.count()
        return jsonify(count)

    def as_dict(self):
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}

    def get_persona(id):
        persona = Persona.query.get(id)
        return jsonify(persona.as_dict())

    def get_personas():
        personas = Persona.query.all()
        retorno = []
        for persona in personas:
            print(persona.as_dict())
            retorno.append(persona.as_dict())
        # print(retorno)
        return jsonify(retorno)


class Caballo(db.Model, SerializerMixin):
    caballo_id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.Text, nullable=False)

    @ classmethod
    def identify(cls, id):
        return cls.query.get(id)

    @ property
    def identity(self):
        return self.caballo_id

    def count():
        count = Caballo.query.count()
        return jsonify(count)

    def as_dict(self):
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}

    def get_nombre(self):
        return self.nombre

    def get_caballo(id):
        caballo = Caballo.query.get(id)
        return jsonify(caballo.as_dict())

    def get_caballos():
        caballos = Caballo.query.all()
        retorno = []
        for caballo in caballos:
            retorno.append(caballo.as_dict())
        # print(retorno)
        return jsonify(retorno)


class Dispositivo(db.Model, SerializerMixin):
    __tablename__ = 'dispositivo'
    dispositivo_id = db.Column(db.Integer, primary_key=True)
    number = db.Column(db.Integer, unique=True, nullable=False)
    tipo = db.Column(db.Integer, nullable=False)
    is_active = db.Column(db.Boolean, default=True, server_default='true')

    @ classmethod
    def lookup(cls, number):
        return cls.query.filter_by(number=number).one_or_none()

    @ classmethod
    def identify(cls, id):
        return cls.query.get(id)

    @ property
    def identity(self):
        return self.dispositivo_id

    def get_active(self):
        return self.is_active

    def get_tipo(self):
        return self.tipo

    def get_dispositivo(id):
        dispositivo = Dispositivo.query.get(id)
        return jsonify(dispositivo.to_dict())

    def get_dispositivos():
        dispositivos = Dispositivo.query.all()
        retorno = []
        for dispositivo in dispositivos:
            retorno.append(dispositivo.to_dict())
        # print(retorno)
        return jsonify(retorno)


class Entrenamiento(db.Model, SerializerMixin):
    __tablename__ = 'entrenamiento'
    id = db.Column(db.Integer, primary_key=True)
    fecha_hora = db.Column(db.DateTime, nullable=False)
    duracion = db.Column(db.Integer)
    bitstream = db.Column(db.Text, unique=True)
    lugar = db.Column(db.Text)
    recinto = db.Column(db.Text)

    # Reglas de serialización, se va a detener la recursividad en donde se indica.
    serialize_rules = ('-patas', '-pata')

    patas = db.relationship('Dispositivo', secondary='pata',
                            backref=db.backref('patas', lazy='dynamic'))

    @ classmethod
    def identify(cls, id):
        return cls.query.get(id)

    @ property
    def get_id(self):
        return self.id

    def count():
        count = Entrenamiento.query.count()
        return jsonify(count)

    def get_fecha_hora(self):
        return self.fecha_hora

    def get_duracion(self):
        return self.duracion

    def get_bitstream(self):
        return self.bitstream

    def get_lugar(self):
        return self.lugar

    def get_recinto(self):
        return self.recinto

    def get_entrenamiento(id):
        entrenamiento = Entrenamiento.query.get(id)
        return jsonify(entrenamiento.to_dict())

    def get_entrenamientos():
        entrenamientos = Entrenamiento.query.all()
        retorno = []
        for entrenamiento in entrenamientos:
            retorno.append(entrenamiento.to_dict())
        # print(retorno)
        return jsonify(retorno)


class Pata(db.Model, SerializerMixin):
    __tablename__ = 'pata'
    entrenamiento_id = db.Column(db.Integer, db.ForeignKey(
        'entrenamiento.id'), primary_key=True, nullable=False)
    dispositivo_id = db.Column(db.Integer, db.ForeignKey(
        'dispositivo.dispositivo_id'), primary_key=True, nullable=False)

    pata = db.Column(db.Text)

    # Reglas de serialización, se va a detener la recursividad en donde se indica.
    serialize_rules = ('-entrenamiento.pata', '-dispositivo.pata')

    entrenamiento = db.relationship(
        'Entrenamiento', backref=db.backref("pata", cascade="all, delete-orphan"))
    dispositivo = db.relationship(
        'Dispositivo', backref=db.backref("pata", cascade="all, delete-orphan"))


class Rol(db.Model, SerializerMixin):
    __tablename__ = 'rol'
    persona_id = db.Column(db.Integer, db.ForeignKey(
        'persona.persona_id'), primary_key=True, nullable=False)
    caballo_id = db.Column(db.Integer, db.ForeignKey(
        'caballo.caballo_id'), primary_key=True, nullable=False)

    rol = db.Column(db.Text, primary_key=True, nullable=False)

    serialize_rules = ('-persona', '-caballo', '-entrena')

    persona = db.relationship(
        'Persona', backref=db.backref("rol", cascade="all, delete-orphan"))
    caballo = db.relationship(
        'Caballo', backref=db.backref("rol", cascade="all, delete-orphan"))

    @ property
    def get_rol(id):
        rol = Rol.query.get(id)
        return jsonify(rol.to_dict())

    def get_roles():
        roles = Rol.query.all()
        retorno = []
        for rol in roles:
            retorno.append(rol.to_dict())
        # print(retorno)
        return jsonify(retorno)


class Medida(db.Model, SerializerMixin):
    __tablename__ = 'medida'
    entrenamiento_id = db.Column(db.Integer, db.ForeignKey(
        'entrenamiento.id'), primary_key=True, nullable=False)
    dispositivo_id = db.Column(db.Integer, db.ForeignKey(
        'dispositivo.dispositivo_id'), primary_key=True, nullable=False)

    fecha_hora = db.Column(db.Integer, primary_key=True, nullable=False)
    ax = db.Column(db.Float)
    ay = db.Column(db.Float)
    az = db.Column(db.Float)
    mx = db.Column(db.Float)
    my = db.Column(db.Float)
    mz = db.Column(db.Float)
    gx = db.Column(db.Float)
    gy = db.Column(db.Float)
    gz = db.Column(db.Float)

    serialize_rules = ('-entrenamiento', '-dispositivo')

    entrenamiento = db.relationship(
        'Entrenamiento', backref=db.backref("medida", cascade="all, delete-orphan"))
    dispositivo = db.relationship(
        'Dispositivo', backref=db.backref("medida", cascade="all, delete-orphan"))

    @ property
    def identity(self):
        return self.id

    def as_dict(self):
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}

    def get_entrenamiento_dispositivos(entrenamientoid):
        medidas = Medida.query.filter_by(
            entrenamiento_id=entrenamientoid).distinct(Medida.dispositivo_id).group_by(Medida.dispositivo_id)
        retorno = []
        for medida in medidas:
            retorno.append(medida.as_dict())
        # print(retorno)
        return jsonify(retorno)

    def get_medida(entrenamientoid, dispositivoid):
        medida = Medida.query.filter_by(
            entrenamiento_id=entrenamientoid, dispositivo_id=dispositivoid).first()
        return jsonify(medida.as_dict())

    def get_medidas(entrenamientoid, dispositivoid):
        medidas = Medida.query.filter_by(
            entrenamiento_id=entrenamientoid, dispositivo_id=dispositivoid).all()
        retorno = []

        for medida in medidas:
            retorno.append(medida.as_dict())
        # for medida in medidas:
        #    retorno.append(medida)
        # print(retorno)

        return jsonify(retorno)

    def get_medidas_array(entrenamientoid, dispositivoid):
        medidas = Medida.query.filter_by(
            entrenamiento_id=entrenamientoid, dispositivo_id=dispositivoid).all()
        retorno = []

        for medida in medidas:
            retorno.append(medida.as_dict())
        # for medida in medidas:
        #    retorno.append(medida)
        # print(retorno)

        return retorno

    def get_medidas_dict(entrenamientoid, dispositivoid):
        medidas = Medida.query.filter_by(
            entrenamiento_id=entrenamientoid, dispositivo_id=dispositivoid).all()
        retorno = []
        for medida in medidas:
            retorno.append(medida.as_dict())
        # print(retorno)
        return retorno


class Entrena(db.Model, SerializerMixin):
    __tablename__ = 'entrena'
    id = db.Column(db.Integer, primary_key=True)
    persona_id = db.Column(db.Integer, db.ForeignKey(
        'persona.persona_id'), nullable=False)
    caballo_id = db.Column(db.Integer, db.ForeignKey(
        'caballo.caballo_id'), nullable=False)
    rol_text = db.Column(db.Text, db.ForeignKey(
        'rol.rol'), nullable=False)
    entrenamiento_id = db.Column(db.Integer, db.ForeignKey(
        'entrenamiento.id'), nullable=False)

    serialize_rules = ('-persona.entrena', '-persona.rol', '-caballo.entrena', '-caballo.rol',
                       '-rol', '-entrenamiento.entrena', '-entrenamiento.medida')

    persona = db.relationship(
        'Persona', backref=db.backref("entrena", cascade="all, delete-orphan"))
    caballo = db.relationship(
        'Caballo', backref=db.backref("entrena", cascade="all, delete-orphan"))
    rol = db.relationship(
        'Rol', backref=db.backref("entrena", cascade="all, delete-orphan"))
    entrenamiento = db.relationship(
        'Entrenamiento', backref=db.backref("entrena", cascade="all, delete-orphan"))

    @ property
    def identity(self):
        return self.id

    def get_entrena(entrenamientoid):
        entrena = Entrena.query.filter_by(
            entrenamiento_id=entrenamientoid).first()
        return jsonify(entrena.to_dict())

    def get_entrenas():
        entrenas = Entrena.query.all()
        retorno = []
        for entrena in entrenas:
            retorno.append(entrena.to_dict())
        # print(retorno)
        return jsonify(retorno)

    def count_entrena_caballos():
        count_caballos = Entrena.query.with_entities(func.count(
            Entrena.caballo_id).label('count'), Caballo.nombre).join(Caballo).group_by(Caballo.nombre).all()
        print(count_caballos)
        return json.dumps([dict(r) for r in count_caballos])
