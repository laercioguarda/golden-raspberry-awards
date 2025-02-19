const request = require("supertest");
const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const crypto = require("crypto");
const { app, startServer, stopServer } = require("../src/server");
const AwardsDataSource = require("../src/db/datasource");

let csvData = [];
let originalHash = "";
const expectedHeaders = ["year", "title", "studios", "producers", "winner"];

beforeAll(async () => {
  await startServer();

  const csvFilePath = path.join(__dirname, "../data/Movielist.csv");
  csvData = await loadCSV(csvFilePath);
  originalHash = await calculateFileHash(csvFilePath);
});

afterAll(async () => {

  await stopServer();

  if (AwardsDataSource.isInitialized) {
    await AwardsDataSource.destroy();
  }

});


describe("Validação do CSV", () => {
  it("Deve conter os cabeçalhos esperados", async () => {
    const headers = Object.keys(csvData[0]);
    expect(headers.map(h => h.toLowerCase())).toEqual(expectedHeaders);
  });

  it("Deve conter dados no arquivo", async () => {
    expect(csvData.length).toBeGreaterThan(0);
  });

  it("Deve garantir que o arquivo CSV não foi modificado", async () => {
    const csvFilePath = path.join(__dirname, "../data/Movielist.csv");
    const currentHash = await calculateFileHash(csvFilePath);
    expect(currentHash).toBe(originalHash);
  });

});

describe("Testes de Integração da API", () => {
  it("Deve retornar status 200 e um JSON válido", async () => {

    const response = await request(app).get("/api/v1/awards/winners/intervals");
    expect(response.status).toBe(200);
    expect(response.headers["content-type"]).toMatch(/json/);

  });

  it("Deve retornar os vencedores corretamente, de acordo com o CSV", async () => {

    const response = await request(app).get("/api/v1/awards/winners/intervals");

    expect(response.body).toHaveProperty("min");
    expect(response.body).toHaveProperty("max");
    expect(Array.isArray(response.body.min)).toBe(true);
    expect(Array.isArray(response.body.max)).toBe(true);

    const vecedoresEsperados = calculateWinnersFromCSV(csvData);

    expect(response.body.min.length).toEqual(vecedoresEsperados.min.length);
    response.body.min.forEach((item, index) => {
      expect(item.producer).toEqual(vecedoresEsperados.min[index].producer);
      expect(item.interval).toEqual(vecedoresEsperados.min[index].interval);
      expect(item.previousWin).toEqual(vecedoresEsperados.min[index].previousWin);
      expect(item.followingWin).toEqual(vecedoresEsperados.min[index].followingWin);
    });

    expect(response.body.max.length).toEqual(vecedoresEsperados.max.length);
    response.body.max.forEach((item, index) => {
      expect(item.producer).toEqual(vecedoresEsperados.max[index].producer);
      expect(item.interval).toEqual(vecedoresEsperados.max[index].interval);
      expect(item.previousWin).toEqual(vecedoresEsperados.max[index].previousWin);
      expect(item.followingWin).toEqual(vecedoresEsperados.max[index].followingWin);
    });

  });
});

function calculateFileHash(filePath) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash("sha256");
    const stream = fs.createReadStream(filePath);
    
    stream.on("data", (data) => hash.update(data));
    stream.on("end", () => resolve(hash.digest("hex")));
    stream.on("error", reject);
  });
}

function loadCSV(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv({ separator: ";" }))
      .on("data", (data) => results.push(data))
      .on("end", () => resolve(results))
      .on("error", reject);
  });
}

function calculateWinnersFromCSV(data) {
  const producerWins = new Map();


  data.forEach((row) => {
    if (row.winner.toLowerCase() === "yes") {
      const produtores = row.producers.split(/, | and /).map((name) => name.trim());
      produtores.forEach((produtor) => {
        if (!producerWins.has(produtor)) {
          producerWins.set(produtor, []);
        }
        producerWins.get(produtor).push(parseInt(row.year));
      });
    }
  });


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

  return result;
}