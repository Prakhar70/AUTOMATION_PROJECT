
const csvFilePath = "C:\\Users\\hp\\Downloads\\text.csv";
let fs = require("fs"),
  request = require("request");
const csv = require("csvtojson");



var download = function (uri, filename, callback) {
  request.head(uri, function (err, res, body) {
    console.log("content-type:", res.headers["content-type"]);
    console.log("content-length:", res.headers["content-length"]);

    request(uri).pipe(fs.createWriteStream(filename)).on("close", callback);
  });
};

csv()
  .fromFile(csvFilePath)
  .then((jsonObj) => {
    console.log(jsonObj);
    for (let i = 0; i < jsonObj.length; i++) {
      download(jsonObj[i]["ImageUrl"], `${i}.jpg`, function () {
        console.log("done");
      });
      jsonObj[i]["ImageUrl"] = `${i}.jpg`;
    }
    console.log(jsonObj);
    fs.writeFileSync("./sample1.json", JSON.stringify(jsonObj));
    
  });

