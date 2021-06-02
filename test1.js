//credits:https://stackoverflow.com/questions/12180552/openssl-error-self-signed-certificate-in-certificate-chain
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const puppeteer = require("puppeteer");
const fs = require("fs");
const schedule = require("node-schedule");
const nodemailer = require("nodemailer");

let iddata=fs.readFileSync("./idpassword.json");
let idobj=JSON.parse(iddata)[0];
console.log(idobj)

const uid = idobj['fbid'];
console.log(uid)
const pwd = idobj['fbpwd'];


let rawdata = fs.readFileSync("./sample1.json");
let data = JSON.parse(rawdata);


//credits: https://www.geeksforgeeks.org/how-to-run-cron-jobs-in-node-js/

schedule.scheduleJob("mjob", "* * * * *", () => {
  if (data.length != 0) {
    console.log("Uploading Post");
    uploadpost(uid, pwd);
  } else {
    sendMail(
      idobj['gmailid'],
      idobj['gmailpswd'],
      idobj['gmailid']
    );
    fs.unlinkSync(`C:\\Users\\hp\\Downloads\\text.csv`);

    schedule.cancelJob("mjob");
  }
});

async function uploadpost(uid, pwd) {
  let tab;
  let browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ["--start-maximized"],
  });
  let pages = await browser.pages();
  tab = pages[0];
  await tab.goto("https://www.facebook.com/");

  await tab.type(`input[type="text"]`, uid);
  await tab.type("#pass", pwd);
  await tab.click("._42ft._4jy0._6lth._4jy6._4jy1.selected._51sy"); //login button
  await tab.waitForTimeout(10000);

  await tab.click(".m9osqain.a5q79mjw.gy2v8mqq"); //whats on your mind //dummyclick
  await tab.waitForTimeout(5000);

  await tab.click(".m9osqain.a5q79mjw.gy2v8mqq"); //mainclick

  await tab.waitForSelector(`._1p1t._1p1u`, { visible: true }); //for typing
  await tab.type(`._1p1t._1p1u`, data[0]["Quotes"]);

  //file uploading code
  //credits:https://www.youtube.com/watch?v=qNRCuLrf930

  const [fileChooser] = await Promise.all([
    tab.waitForFileChooser(),
    tab.click('div[aria-label="Photo/Video"]'), //selector to upload image icon
  ]);
  await fileChooser.accept([data[0]["ImageUrl"]]);

  await tab.waitForTimeout(3000);
  await tab.click(
    ".k4urcfbm.dati1w0a.hv4rvrfc.i1fnvgqd.j83agx80.rq0escxv.bp9cbjyn.discj3wi"
  ); //post

  await tab.waitForTimeout(10000);
  data.shift();
  fs.writeFileSync("./sample1.json", JSON.stringify(data));

  browser.close();
}
// credits:https://www.w3schools.com/nodejs/nodejs_email.asp
function sendMail(senderid, senderpass, recieverid) {
  let mailTransporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: senderid,
      pass: senderpass,
    },
  });

  let mailDetails = {
    from: senderpass,
    to: recieverid,
    subject: "Upload more quotes mail",
    text: "Please upload more quotes",
  };

  mailTransporter.sendMail(mailDetails, function (err, data) {
    if (err) {
      console.log("Error Occurs");
    } else {
      console.log("Email sent successfully");
    }
  });
}

function sendMail(senderid, senderpass, recieverid) {
  let mailTransporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: senderid,
      pass: senderpass,
    },
  });

  let mailDetails = {
    from: senderpass,
    to: recieverid,
    subject: "Sucessful uploads...Upload more quotes",
    text: "Dear Client..... \Please upload more quotes\n Download the attached csv file ... fill and run the scipt",
    attachments: [
      {
        // utf-8 string as an attachment
        filename: "text.csv",
        content: "Quotes,ImageUrl",
      },
    ],
  };

  mailTransporter.sendMail(mailDetails, function (err, data) {
    if (err) {
      console.log("Error Occurs");
    } else {
      console.log("Email sent successfully");
    }
  });
}
