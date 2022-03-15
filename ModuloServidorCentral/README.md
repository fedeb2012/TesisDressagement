# DRESSAGEMENT WEBAPP BACKEND AND FRONTEND

## Softwares necesarios para desarrollo

- Node JS
  [Node JS Download](https://nodejs.org/en/download/)

- YARN
  [Yarn Download](https://classic.yarnpkg.com/latest.msi)

## Dev ENV Initial Config (en caso de no tener el env creado)

Debemos crear un nuevo Virtual Environment:

1. Acceder a la carpeta [api](api/)

```sh
cd api
```

2. Ejecutar python -m venv env

```sh
python -m venv env
```

3. Ejecutar activate.bat en la carpeta env/Scripts (debería aparecer el string "(env)" a la izquierda del prompt)

```sh
env\Scripts\activate.bat
```

4. Ejecutar el comando pip install -r requirements.txt

```sh
pip install -r requirements.txt
set FLASK_APP=api.py
```

5. Instalar paquetes de Node en la carpeta raiz

```sh
npm install
```

> Nota: En caso de faltar alguna dependencia se debe instalar con npm.

## STARTING DRESSAGEMENT APP

Desde la carpeta raiz:
En una consola iniciamos react

```sh
yarn start
```

En otra consola iniciamos la API de python

```sh
yarn start-api
```
