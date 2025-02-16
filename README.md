# Golden Raspberry Awards

Esta é uma API RESTful que permite consultar os vencedores da categoria "Pior Filme" do Golden Raspberry Awards. A API calcula o intervalo entre os prêmios e retorna o produtor com maior intervalo entre dois prêmios consecutivos e o que obteve dois prêmios mais rápido.

## Visão Geral
A API permite que os usuários obtenham dados sobre os vencedores do Golden Raspberry Awards, analisando os intervalos entre as vitórias dos produtores. O projeto inclui:

* **Leitura de arquivos CSV** contendo dados dos vencedores.
* **Armazenamento de dados no banco de dados** com relacionamentos entre filmes e produtores.
* **Cálculo dos intervalos entre prêmios consecutivos** para cada produtor.
* **Exposição de um endpoint RESTful** para retornar os produtores com o menor e maior intervalo entre vitórias.

## Tecnologias Utilizadas
* **Node.js**: Ambiente de execução JavaScript.
* **Express.js**: Framework para criação de APIs RESTful.
* **TypeORM**: ORM para trabalhar com banco de dados SQL.
* **SQLite**: Banco de dados embarcado, utilizado para armazenar os dados.
* **CSV-Parser**: Para ler e processar arquivos CSV.

## Instalação
Siga os passos abaixo para rodar o projeto localmente.

### 1. Clone o repositório
```bash
git clone https://github.com/seu-usuario/golden-raspberry-awards.git
cd golden-raspberry-awards 
```
### 2. Instale as dependências
```bash
npm install
```
### 3. Banco de dados
Este projeto usa o SQLite como banco de dados. O TypeORM irá criar o banco automaticamente.

### 4. Carregue os dados CSV
O projeto utiliza um arquivo CSV contendo dados sobre os vencedores do Golden Raspberry Awards. Certifique-se de ter o arquivo Movielist.csv na pasta data/ e de que os dados estão no formato correto.

### 5. Crie o arquivo .env

O arquivo .evn deve estar na pasta raiz do projeto e as variáveis necessárias são "EXPRESS_PORT", "DATA_FILE" e "WINSTON_LOG_PATH", por exemplo:
```
EXPRESS_PORT=3000
DATA_FILE=Movielist.csv
WINSTON_LOG_PATH=/log
```

### 6. Inicie o servidor
```bash
npm start
```

### 7. Testes de integração:

Para rodar o teste de integração, basta executar o comando abaixo:

```bash
npm test
```

O servidor estará disponível em [http://localhost:3000](http://localhost:3000).

### Uso
### Carregar CSV
A API pode carregar dados a partir de um arquivo CSV com os seguintes campos:

* **year**: Ano do prêmio.
* **title**: Título do filme.
* **studios**: Estúdios envolvidos na produção.
* **producers**: Produtores do filme, separados por vírgulas.
* **winner**: Indica se o filme foi vencedor ("yes" ou "no").

O arquivo CSV será processado e os dados serão armazenados no banco de dados.

### Endpoints
`GET /api/v1/awards/winners/intervals`

Retorna os produtores com o maior e menor intervalo entre prêmios consecutivos.

### Exemplo de resposta:

```json
{
  "min": [
    {
      "producer": "Producer 1",
      "interval": 1,
      "previousWin": 2008,
      "followingWin": 2009
    },
    {
      "producer": "Producer 2",
      "interval": 1,
      "previousWin": 2018,
      "followingWin": 2019
    }
  ],
  "max": [
    {
      "producer": "Producer 1",
      "interval": 99,
      "previousWin": 1900,
      "followingWin": 1999
    },
    {
      "producer": "Producer 2",
      "interval": 99,
      "previousWin": 2000,
      "followingWin": 2099
    }
  ]
}
```

### Estrutura de Banco de Dados

O banco de dados é composto pelas seguintes tabelas:

* **Movies**: Contém informações sobre os filmes, como título, ano e se o filme foi vencedor.
* **Producers**: Contém informações sobre os produtores dos filmes.
* **MovieProducers**: Tabela intermediária que gerencia a relação Many-to-Many entre filmes e produtores.

### Exemplo de modelo de dados:
`Movie`:
* `id`: Identificador único.
* `title`: Título do filme.
* `year`: Ano de lançamento.
* `winner`: Se o filme foi vencedor.

`Producer`:
* `id`: Identificador único.
* `name`: Nome do produtor.

`MovieProducer`:
* `movie_id`: Referência ao filme.
* `producer_id`: Referência ao produtor.