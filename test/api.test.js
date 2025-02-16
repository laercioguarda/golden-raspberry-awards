const request = require("supertest");
const { app, startServer, stopServer } = require("../src/server");
const AwardsDataSource = require("../src/db/datasource");

beforeAll(async () => {
  await startServer();
});

afterAll(async () => {

  await stopServer();

  if (AwardsDataSource.isInitialized) {
    await AwardsDataSource.destroy();
  }

});

describe("Testes de Integração da API", () => {
  it("Deve retornar o produtor com maior e menor intervalo entre prêmios", async () => {
    const response = await request(app).get("/api/v1/awards/winners/intervals");
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("min");
    expect(response.body).toHaveProperty("max");

    response.body.min.forEach((item) => {
      expect(item).toHaveProperty("producer");
      expect(item).toHaveProperty("interval");
      expect(item).toHaveProperty("previousWin");
      expect(item).toHaveProperty("followingWin");
    });

    response.body.max.forEach((item) => {
      expect(item).toHaveProperty("producer");
      expect(item).toHaveProperty("interval");
      expect(item).toHaveProperty("previousWin");
      expect(item).toHaveProperty("followingWin");
    });

  });
});