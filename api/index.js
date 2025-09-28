// 🚀 VERCEL SERVERLESS FUNCTION HANDLER
// Este archivo permite que la API funcione en Vercel como Serverless Function

const app = require('../api-osyris/src/index.js');

// Exportar la app para Vercel
module.exports = app;