const jsdom = require("jsdom");
const axios = require("axios");

let currURL = "https://www.imdb.com/title/tt6924650/";

// check if receivedParam "dp" is a user name or user profile link

console.log("URL", currURL);

axios
  .get(currURL)
  .then(response => {
    //   let newResponse = response.data.replace(
    //     ">window._sharedData",
    //     ' id="dataspan">window._sharedData'
    //   );
    console.log("response", response.data);

    const dom = new jsdom.JSDOM(response.data);
    let testLinks = dom.window.document.querySelector("a[href^='/video/imdb']");

    console.log("testLinks >>", testLinks.href);

    //   try {
    //     var config = testLinks.innerHTML;
    //     config = config.replace("window._sharedData = ", "");
    //     config = config.replace("};", "}");

    //     console.log("config", config);
    //     var response = JSON.parse(config);

    //     //console.log(response.entry_data.ProfilePage[0].graphql.shortcode_media.__typename)
    //     //console.log(response.entry_data.PostPage[0].graphql.shortcode_media.__typename)
    //     console.log("Outside if");

    //     //check if it is a profile link
    //     if (typeof response.entry_data.ProfilePage !== "undefined") {
    //       // Assign value to the property here
    //       console.log("inside profile if");
    //       imageLinks.push(
    //         response.entry_data.ProfilePage[0].graphql.user.profile_pic_url_hd
    //       );
    //     }

    //     if (imageLinks.length > 0) {
    //       res.status(200).json({
    //         message: "Hello dp",
    //         result: { imagelinks: imageLinks, videolinks: videoLinks }
    //       });
    //     } else {
    //       res.status(200).json({
    //         message: "No image found for this user profile",
    //         partialResponse: response
    //       });
    //     }
    //   } catch (e) {
    //     // No content response..
    //     console.log("inside catch", e);
    //     res.status(400).json({
    //       message: "Please enter a valid INSTAGRAM username/profile link",
    //       result: { imagelinks: imageLinks, videolinks: videoLinks }
    //     });
    //   }
  })
  .catch(error => {
    console.log("error", error);
    res.status(400).json({
      message: "Please enter a valid INSTAGRAM username/profile link",
      error: error
    });
  });
