const { DataSource } = require("typeorm");
const Movie = require("../entities/Movie");
const Producer = require("../entities/Producer");
const MovieProducer = require("../entities/MovieProducer");


const AwardsDataSource = new DataSource({
  type: "sqlite",
  database: ":memory:",
  entities: [
    Movie,
    Producer,
    MovieProducer
  ],
  synchronize: true,
  logging: false,
});

module.exports = AwardsDataSource;
