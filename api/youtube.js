const { google } = require("googleapis");

function get_youtube(query) {
  var youtube = google.youtube({
    version: "v3",
    auth: "AIzaSyCZgW7uYw777CgDgPp20zOU3PczztsaaOs"
  });
  return new Promise(function(resolve, reject) {
    //returning promise
    youtube.search.list(
      {
        part: "snippet",
        q: query
      },
      function(err, response) {
        if (err) {
          reject(err); //promise reject
        } else {
          resolve(response); //promise resolve
        }
      }
    );
  });
}

module.exports.get_youtube = get_youtube;
