const swaggerAutogen = require('swagger-autogen')();

const outputFile = './swagger_output.json';
const endpointsFiles = ['./app/routes/*.js'];

swaggerAutogen(outputFile, endpointsFiles).then(() => {
    require('./app.js'); // Your server's entry point
});
