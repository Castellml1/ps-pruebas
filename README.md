# ps-frontend-app

## Development server

Este proyecto fue generado con Angular CLI v20.0.1.

Prerrequisitos:
- [Node.js](https://nodejs.org/es) v20 o superior
- [Visual Studio Code](https://code.visualstudio.com)

1. Instalar Angular CLI
```bash
npm install -g @angular/cli
```
2. Verificar la instalación
```bash
ng version
```
3. Clonar el proyecto `ps-frontend`
4. Colocarse en la carpeta `ps-frontend-app`
5. Descargar dependencias
```bash
npm install
```
6. Iniciar el servidor local
```bash
ng serve
```
7. Una vez que el servidor está ejecutándose, abrir en un navegador la dirección [http://localhost:4200/](http://localhost:4200/)


NOTA:
Para trabajar con Visual Studio Code importar la carpeta `ps-frontend-app`.


## Building

Para construir el proyecto, ejecutar
```bash
ng build
```

Esto compilará el proyecto y almacenará los artefactos de compilación en el directorio `dist/`.
De forma predeterminada, la compilación de producción optimiza el rendimiento y la velocidad de la aplicación.

## Running unit tests

Para ejecutar pruebas unitarias con el ejecutor [Karma](https://karma-runner.github.io), usar el comando
```bash
ng test
```
