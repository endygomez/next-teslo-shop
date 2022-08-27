# Creación de Proyecto

```
1. Crear app
yarn create next-app --typescript

2. Modificar archivos iniciales
borrar contenido de retorno de pages/index.tsx
borrar styles/Home.module.style
borrar contenido de styles/globals.css

3. Instalar MaterialUI

yarn add @mui/material @emotion/react @emotion/styled

4. Instalar Iconos MaterialUI
yarn add @mui/icons-material

5. Agregar configuración de fuente a archivo en el pages/_document.ts

Creamos el archivo pages/_document.tsx
snippet nextdocument 

<link
  rel="stylesheet"
  href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"
/>

6. Crear carpeta theme

7. Agregar ThemeProvider, CssBaseline Component en _app.tsx
```

# Estructura de dir inicial
```
components

pages/*
```