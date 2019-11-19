const { google } = require("googleapis");

//AIzaSyCZgW7uYw777CgDgPp20zOU3PczztsaaOs
function get_youtube(query) {
  var youtube = google.youtube({
    version: "v3",
    auth: "AIzaSyDCJ3dwtpdf3DukD1SNr7SehL9I0TnOULw"
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
