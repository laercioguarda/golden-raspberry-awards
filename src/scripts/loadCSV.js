const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const AwardsDataSource = require('../db/datasource');
const Movie = require('../entities/Movie');
const Producer = require("../entities/Producer");
const MovieProducer = require("../entities/MovieProducer");
const logger = require('../utility/logger');

const csvFilePath = path.join(__dirname, `../../data/${process.env.DATA_FILE}`);

async function loadCSV() {

  try {

    const movieRepository = AwardsDataSource.getRepository(Movie);
    const producerRepository = AwardsDataSource.getRepository(Producer);
    const movieProducerRepository = AwardsDataSource.getRepository(MovieProducer);

    return new Promise((resolve, reject) => {
      const movies = [];
      let headersValidated = false;
      let hasData = false;
      const requiredFields = ["year", "title", "studios", "producers", "winner"];

      fs.createReadStream(csvFilePath)
        .pipe(csv({ separator: ";" }))
        .on("headers", (headers) => {
          const missingFields = requiredFields.filter(field => !headers.includes(field));
          if (missingFields.length > 0) {
            reject(`Erro: O CSV está faltando os seguintes campos: ${missingFields.join(", ")}`);
          } else {
            headersValidated = true;
          }
        })
        .on("data", (row) => {

          if (!headersValidated) return;

          if (!row.year || !row.title || !row.studios || !row.producers) {
            logger.msg("warn", ["CSV"], `Linha inválida ignorada: ${JSON.stringify(row)}`);
            return;
          }

          hasData = true;

          const movie = {};
          movie.year = parseInt(row.year);
          movie.title = row.title;
          movie.studios = row.studios;
          movie.winner = row.winner === "yes";
          movie.producers = row.producers
            .split(/, | and /)
            .map((name) => name.trim());

          movies.push(movie);
        })
        .on("end", async () => {
          try {

            if (!hasData) {
              reject(`Erro: O arquivo CSV não contém dados válidos.`);
              return;
            }

            for (const movieData of movies) {
              const { producers, ...movieInfo } = movieData;
              
              const movie = await movieRepository.save(movieInfo);

              for (const producerName of producers) {

                let producer = await producerRepository.findOne({ where: { name: producerName } });

                if (!producer) {
                  producer = await producerRepository.save({ name: producerName });
                }

                await movieProducerRepository.save({
                  movie,
                  producer,
                });
              }
            }
            logger.msg('info', ['CSV'], `Arquivo carregado com sucesso.`);
            resolve();
          } catch (error) {
            reject(`Erro ao salvar os filmes no banco: ${error}`);
          }
        })
        .on("error", reject);
    });

  } catch (error) {
    console.error("Erro no carregamento do CSV:", error);
  }
}

module.exports = loadCSV;
