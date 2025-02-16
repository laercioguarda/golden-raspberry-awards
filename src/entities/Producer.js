const { EntitySchema } = require("typeorm");

const Producer = new EntitySchema({
  name: "Producer",
  tableName: "producers",
  columns: {
    id: {
      type: Number,
      primary: true,
      generated: true,
    },
    name: {
      type: String,
      unique: true,
    }
  },
  relations: {
    movieProducers: {
      target: "MovieProducer",
      type: "one-to-many",
      inverseSide: "producer",
      cascade: true,
    },
  }
});

module.exports = Producer;