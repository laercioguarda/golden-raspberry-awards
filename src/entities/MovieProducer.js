const { EntitySchema } = require("typeorm");

const MovieProducer = new EntitySchema({
  name: "MovieProducer",
  tableName: "movies_producers",
  columns: {
    id: {
      type: Number,
      primary: true,
      generated: true,
    },
  },
  relations: {
    movie: {
      target: "Movie",
      type: "many-to-one",
      joinColumn: true,
      onDelete: "CASCADE",
    },
    producer: {
      target: "Producer",
      type: "many-to-one",
      joinColumn: true,
      onDelete: "CASCADE",
    },
  }
});

module.exports = MovieProducer;