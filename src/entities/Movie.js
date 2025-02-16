const { EntitySchema } = require('typeorm');

const Movie = new EntitySchema({
  name: 'Movie',
  tableName: 'movies',
  columns: {
    id: {
      type: Number,
      primary: true,
      generated: true,
    },
    year: {
      type: Number
    },
    title: {
      type: String
    },
    studios: {
      type: String
    },
    winner: {
      type: Boolean,
    },
  },
  relations: {
    movieProducers: {
      target: "MovieProducer",
      type: "one-to-many",
      inverseSide: "movie",
      cascade: true,
    }
  }
});

module.exports = Movie;