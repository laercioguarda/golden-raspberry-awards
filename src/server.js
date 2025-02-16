require("dotenv").config();
require("reflect-metadata");
const express = require('express');
const cors = require('cors');
const httpStatus = require('http-status');
const logger = require('./utility/logger');
const ApiError = require('./utility/apiError');
const loadCSV = require('./scripts/loadCSV');
const AwardsDataSource = require('./db/datasource');
const routes = require('./routes');

const PORT = process.env.EXPRESS_PORT ?? 3000;
const app = express();
let server;

const startServer = async () => {
  try {

    logger.msg('debug', ['Express'], `Iniciando banco de dados...`);
    await AwardsDataSource.initialize();
    logger.msg('debug', ['Express'], `Banco de dados iniciado, carregando arquivo CSV...`);
    await loadCSV();

    app.use(cors());
    app.use(express.json());
    app.use('/api/v1', routes);

    app.use((req, res, next) => {
      next(new ApiError(httpStatus.NOT_FOUND, 'Page not found'));
    });

    server = app.listen(PORT, () => {
      logger.msg('info', ['Express'], `Server has initiated on port: ${PORT}`);
    });


  } catch (error) {
    logger.msg('error', ['Express'], `Erro durante a inicialização da aplicação: ${error}`);
  }
}

const stopServer = async () => {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
    logger.msg('info', ['Express'], 'Server has been stopped');
  }
};

module.exports = { app, startServer, stopServer };

if (require.main === module) {
  startServer();
}