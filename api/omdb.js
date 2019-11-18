const imdb = require("imdb-api");

function omdb(query) {
  const cli = new imdb.Client({ apiKey: "104313cc" });
  return cli
    .search({ name: query })
    .then(search => {
      for (const result of search.results) {
        console.log(result);
      }
      return search;
    })
    .catch(err => {
      console.log(err);
      return {};
    });
}

module.exports.omdb = omdb;
