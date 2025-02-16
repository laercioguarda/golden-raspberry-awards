const logger = require('../utility/logger');
const AwardsDataSource = require("../db/datasource");
const Movie = require("../entities/Movie");

module.exports = {
  getWinnersWithInterval: async (req, res) => {

    try {

      logger.msg('debug', ['Express'], `Buscando informações no banco de dados.`);

      const movieRepository = AwardsDataSource.getRepository(Movie);

      const movies = await movieRepository.find({
        where: { winner: true },
        relations: ["movieProducers", "movieProducers.producer"],
      });

      if(!movies){
        logger.msg('info', ['Express'], `Nenhum dado encontrado.`);
        return res.status(204).json({ message: "Nenhum dado retornado." });
      }

      const producerWins = new Map();
      
      logger.msg('debug', ['Express'], `Agrupando produtores.`);
      movies.forEach(({ movieProducers, year }) => {
        movieProducers.forEach((movieProducer) => {
          if (!producerWins.has(movieProducer.producer.name)) {
            producerWins.set(movieProducer.producer.name, []);
          }
          producerWins.get(movieProducer.producer.name).push(year);
        });
      });

      logger.msg('debug', ['Express'], `Calculando intervalos.`);
      
      const intervals = [];

      producerWins.forEach((years, producer) => {

        years.sort((a, b) => a - b);

        for (let i = 1; i < years.length; i++) {
          intervals.push({
            producer,
            interval: years[i] - years[i - 1],
            previousWin: years[i - 1],
            followingWin: years[i],
          });
        }
      });
      
      if (intervals.length === 0) {
        return res.json({ min: [], max: [] });
      }

      const minInterval = Math.min(...intervals.map((i) => i.interval));
      const maxInterval = Math.max(...intervals.map((i) => i.interval));

      const result = {
        min: intervals.filter((i) => i.interval === minInterval),
        max: intervals.filter((i) => i.interval === maxInterval),
      };

      logger.msg('debug', ['Express'], `Dados processados, retornando resultado.`);

      return res.status(200).json(result);

    } catch (error) {

      logger.msg('error', `Houve um erro ao processar os dados: ${error}`);
      return res.status(500).json({message: `Houve um erro ao processar os dados`});

    }
  }

};