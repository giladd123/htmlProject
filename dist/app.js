const http = require("http");
let fs = require("fs");
const { runInNewContext } = require("vm");
const sqlite3 = require("sqlite3").verbose();
let dbFile = "./myDataBase.db";
let dbExists = fs.existsSync(dbFile);
let num = 1;
let db = new sqlite3.Database(dbFile);
const requestListener = function (req, res) {
    console.log("request received " + num + " " + req.url);
    num++;
    if (req.url == "/") {
        res.writeHead(200, { "Content-Type": "text/html" });
        let myReadStream = fs.createReadStream(__dirname + "\\data\\helloworld.html", "utf-8");
        myReadStream.pipe(res);
    }
    else if (req.url == "/getCss") {
        res.writeHead(200, { "Content-Type": "text/css" });
        let myReadStream = fs.createReadStream(__dirname + "\\data\\style.css");
        myReadStream.pipe(res);
    }
    else if (req.url == "/secondPage") {
        res.writeHead(200, { "Content-Type": "text/html" });
        let myReadStream = fs.createReadStream(__dirname + "\\data\\secondpage.html");
        myReadStream.pipe(res);
    }
    else if (req.url == "/getHamMenu") {
        res.writeHead(200, { "Content-Type": "image/png" });
        let myReadStream = fs.createReadStream(__dirname + "\\data\\hamburger-menu.png");
        myReadStream.pipe(res);
    }
    else if (req.url == "/getLoginCss") {
        res.writeHead(200, { "Content-Type": "text/css" });
        let myReadStream = fs.createReadStream(__dirname + "\\data\\logincss.css");
        myReadStream.pipe(res);
    }
    else if (req.url == "/logToAccount") {
        // res.writeHead(200);
        // console.log(req.body.email);
        // res.end();
        let body = "";
        req.on("data", (chunk) => {
            body += chunk.toString(); // convert Buffer to string
        });
        req.on("end", () => {
            body = "&" + body;
            let email = getParameterByName("email", body);
            let password = getParameterByName("password", body);
            // db.close;
        });
    }
    else if (req.url == "/signUp") {
        let body = "";
        req.on("data", (chunk) => {
            body += chunk.toString(); // convert Buffer to string
        });
        req.on("end", () => {
            let email;
            let password;
            body = "&" + body;
            email = getParameterByName("email", body);
            password = getParameterByName("password", body);
            console.log(email + "  " + password);
            let uuid = insertUserToDataBase(email, password).then((result) => {
                if (result == "") {
                    //send email already exists
                }
                else {
                    res.writeHead(200, { "Content-Type": "text/html" });
                    let htmlString;
                    createHtmlPage(result).then((result) => {
                        htmlString = result;
                        res.end(htmlString);
                    });
                }
            });
        });
    }
    else if (req.url == "/addNewAccount") {
        let body = "";
        req.on("data", (chunk) => {
            body += chunk.toString(); // convert Buffer to string
        });
        req.on("end", () => {
            let bankNum;
            let bankDesc;
            let bank;
            let uuid;
            let sql;
            body = "&" + body;
            bankNum = getParameterByName("bankNum", body);
            bank = getParameterByName("bank", body);
            bankDesc = getParameterByName("bankDesc", body);
            uuid = getParameterByName("uuid", body);
            console.log(bankNum + " " + bankDesc + " " + bank + " ");
            sql = 'SELECT * From "' + uuid + '"';
            if (bankNum != null && bankDesc != null && bank != null && uuid != null) {
                new Promise((resolve, reject) => {
                    db.all(sql, [], (err, rows) => {
                        if (err)
                            reject(err);
                        else {
                            resolve(rows.length);
                        }
                    });
                }).then((result) => {
                    sql =
                        'INSERT INTO "' +
                            uuid +
                            '" VALUES("' +
                            result +
                            '","' +
                            bankNum +
                            '","' +
                            bank +
                            '","' +
                            bankDesc +
                            '")';
                    new Promise((resolve, reject) => {
                        db.run(sql, [], (err) => {
                            if (err) {
                                reject(err);
                            }
                            else {
                                resolve(undefined);
                            }
                        });
                    }).then(() => {
                        res.writeHead(200, { "Content-Type": "text/html" });
                        let htmlString;
                        createHtmlPage(uuid).then((result) => {
                            htmlString = result;
                            res.end(htmlString);
                        });
                    });
                });
            }
        });
    }
    else if (req.url.includes("image/")) {
        res.writeHead(200, { "Content-Type": "image/png" });
        let myReadStream = fs.createReadStream(__dirname + "\\data\\images\\" + req.url.substr(7) + ".png");
        myReadStream.pipe(res);
    }
    else if (req.url == "/firstPageCss") {
        res.writeHead(200, { "Content-Type": "text/css" });
        let myReadStream = fs.createReadStream(__dirname + "\\data\\firstPage.css");
        myReadStream.pipe(res);
    }
    else if (req.url == "/login") {
        let body = "";
        req.on("data", (chunk) => {
            body += chunk.toString(); // convert Buffer to string
        });
        req.on("end", () => {
            let email;
            let password;
            body = "&" + body;
            email = getParameterByName("email", body);
            password = getParameterByName("password", body);
            new Promise((resolve, reject) => {
                let sql = "SELECT UID FROM UserTable WHERE Email = '" +
                    email +
                    "' AND Password = '" +
                    password +
                    "'";
                db.get(sql, [], (err, row) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(row);
                    }
                });
            }).then((uuid) => {
                res.writeHead(200, { "Content-Type": "text/html" });
                let htmlString;
                if (uuid.UID) {
                    createHtmlPage(uuid).then((result) => {
                        htmlString = result;
                        res.end(htmlString);
                    });
                }
                else {
                    res.end('<!DOCTYPE html> <html><head> </head><body bgcolor="#FFF5F5"><p> this account does not exist</p> <br> <a href="http://localhost:8000"><button>Go back</button></a> </body></html>');
                }
            });
        });
    }
    else if (req.url == "/removeAcc") {
        let body = "";
        req.on("data", (chunk) => {
            body += chunk.toString(); // convert Buffer to string
        });
        req.on("end", () => {
            let accToRemove;
            let uuid;
            body = "&" + body;
            accToRemove = getParameterByName("accToRemove", body);
            uuid = getParameterByName("uuid", body);
            removeAccount(uuid, accToRemove).then(() => {
                res.writeHead(200, { "Content-Type": "text/html" });
                let htmlString;
                createHtmlPage(uuid).then((result) => {
                    htmlString = result;
                    res.end(htmlString);
                });
            });
        });
    }
};
async function removeAccount(uuid, accToRemove) {
    await new Promise((resolve, reject) => {
        db.run("DELETE FROM '" + uuid + "' WHERE Num=" + accToRemove, [], (err) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(undefined);
            }
        });
    });
    let rows;
    await new Promise((resolve, reject) => {
        let sql = `SELECT * FROM '${uuid}'`;
        db.all(sql, [], (err, result) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(result);
            }
        });
    }).then((result) => {
        rows = result;
    });
    let thisAcc = accToRemove;
    let sql = `UPDATE '${uuid}' SET Num = ${thisAcc} WHERE Num = ${thisAcc + 1}`;
    await new Promise((resolve, reject) => {
        db.run(sql, [], (err) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(undefined);
            }
        });
    });
    for (; thisAcc < rows.length; thisAcc++) {
        await new Promise((resolve, reject) => {
            sql = `UPDATE '${uuid}' SET Num = ${thisAcc} WHERE Num = ${+thisAcc + 1}`;
            db.run(sql, [], (err) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(undefined);
                }
            });
        });
    }
}
function uuidv4() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
        var r = (Math.random() * 16) | 0, v = c == "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}
const server = http.createServer(requestListener);
server.listen(8000);
function getParameterByName(name, body = "") {
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[&]" + name + "(=([^&#]*)|&|#|$)"), results = regex.exec(body);
    if (!results)
        return null;
    if (!results[2])
        return "";
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}
async function insertUserToDataBase(email, password) {
    let sql = 'SELECT "Email" FROM "UserTable" WHERE "Email" = "' + email + '"';
    let uuid = await insertNewUser(sql, email, password);
    return uuid;
}
async function insertNewUser(sql, email, password) {
    return new Promise((resolve, reject) => {
        db.all(sql, [], async (err, rows) => {
            if (err) {
                reject(err);
            }
            else {
                let uuid = "";
                if (rows.length > 0) {
                }
                else {
                    uuid = uuidv4();
                    sql = `INSERT INTO "UserTable" VALUES ("${uuid}","${email}","${password}")`;
                    await new Promise((resolve, reject) => {
                        db.run(sql, [], async function (err) {
                            if (err) {
                                reject(err);
                            }
                            await new Promise((resolve, reject) => {
                                sql = `CREATE TABLE "${uuid}" (Num INT AUTO_INCREMENT PRIMARY KEY, BankNum INT,Bank TEXT, Desc TEXT)`;
                                db.run(sql, [], (err) => {
                                    if (err) {
                                        reject(err);
                                    }
                                    resolve(undefined);
                                });
                            });
                            // get the last insert id
                            console.log(`A row has been inserted with rowid ${this.lastID}`);
                            resolve(undefined);
                        });
                    });
                }
                resolve(uuid);
            }
        });
    });
}
async function createHtmlPage(uuid) {
    let sql = 'SELECT * FROM "' + uuid + '"';
    let rows;
    let header;
    let body;
    await new Promise((resolve, reject) => {
        db.all(sql, [], (err, result) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(result);
            }
        });
    })
        .then((result) => {
        rows = result;
        return;
    })
        .then(() => {
        header = `
      <meta charset="UTF-8">
      <title>
      learning html
      </title>
      <link rel="stylesheet" href="http://localhost:8000/getLoginCss">
      <link rel="stylesheet" href="http://localhost:8000/getCss">
      <style>
      table,
      tr,
      th,
      td {
        border: 1px solid black;
        text-align: center;
      }
      table {
        width: 50%;
      }
    </style>`;
        let x = new Array(rows.length);
        for (let i = 0; i < x.length; i++) {
            x[i] = new Array(4);
        }
        for (let i = 0; i < rows.length; i++) {
            x[i][0] = rows[i].Num;
            x[i][1] = rows[i].BankNum;
            x[i][2] = rows[i].Bank;
            x[i][3] = rows[i].Desc;
        }
        let xString = "[";
        for (let i = 0; i < x.length; i++) {
            xString += '["';
            xString += x[i][0] + '","';
            xString += x[i][1] + '","';
            xString += x[i][2] + '","';
            xString += x[i][3] + '"';
            if (i < x.length - 1) {
                xString += "],";
            }
            else {
                xString += "]";
            }
        }
        xString += "]";
        body = `<script>
      document.addEventListener("readystatechange",event=>{
        if(event.target.readyState === "complete")
        changeData();
      }); 
      let rows = ${xString};
      let account = 0;
      function rightArrowClick(){
        if(document.getElementById("dot"+(account+1))!=null){
          let divToGray  = document.getElementById("dot"+account);
          account++;
          let divToBlack = document.getElementById("dot"+account);
          divToBlack.style.backgroundColor = "#000000";
          divToGray.style.backgroundColor = "#C4C4C4";
          changeData();
        }
      }
      function leftArrowClick(){
        if(account!=0){
          let divToGray  = document.getElementById("dot"+account);
          account--;
          let divToBlack = document.getElementById("dot"+account);
          divToBlack.style.backgroundColor = "#000000";
          divToGray.style.backgroundColor = "#C4C4C4";
          changeData();
        }
      }
      function changeData(){
        if(rows!="[]"){
          let textNum = document.getElementById("TextNum");
          textNum.innerHTML = rows[account][1];
          let textDesc = document.getElementById("TextDesc");
          textDesc.innerHTML = rows[account][3];
          let img = document.getElementById("bankImage");
          img.src = "http://localhost:8000/image/"+rows[account][2];
        }
      }
      function getCurrentAccount(){
        document.getElementById("acc").value=account;
      }
      </script>`;
        body =
            body +
                `
      <center>
        <h1>
          Welcome to EasyBanking
        <h1>
        <br>
        <h2>
          Please choose an account
        </h2>
        <div id="rectangle">
          <img id="bankImage" src = "http://localhost:8000/image/NoData" width="75%" style="margin-top: 20px;margin-bottom: 10px;">
          <br>
          <div class="arrow" id="leftArrow" onclick="leftArrowClick()" style="transform: rotate(135deg);margin-right: 180px;"></div>
          <div class="arrow" id="rightArrow" onclick="rightArrowClick()" style="transform: rotate(315deg);" ></div>
          <p id="TextNum" style="font-size: 24px;margin-bottom:15px;">Account number</p>
          <p id="TextDesc" style="font-size: 24px;margin-bottom: 15px;">Account description</p>
      `;
        let account = 0;
        rows.forEach((row) => {
            body = body + "<div id='dot" + account + "' class='dot'";
            if (account == 0) {
                body += "style='background-color: black;'";
            }
            body += "></div> ";
            account++;
        });
        body =
            body +
                `
      <script>
        function formOpen(){
          if(document.getElementById("form").style.display == "flex"){
            document.getElementById("form").style.display = "none";
          }else{
            document.getElementById("form").style.display = "flex";
          }
        }
      </script>
      </div>
      <a href="http://localhost:8000/secondPage">
        <button  style="margin-top: 20px;font-size: 30px;border-radius:20%;background-color: #FFB6B6;">
          login
        </button>
      </a>
      <br>
      <button onclick="formOpen()" style="margin-top: 20px;font-size: 30px;border-radius: 20%;background-color: #FFB6B6;">
      add new account
      </button>
      <br>
      <form id="form" class="form" style="display:none" action="http://localhost:8000/addNewAccount" method="POST">
        <input type="text" name="bankNum" placeholder="Bank account Number"/>
        <input type="text" name="bankDesc" placeholder="Bank account description"/>
        <input type="radio" name="bank" value="habenleumi" checked/>habenleumi
        <input type="radio" name="bank" value="hapoalim"/>hapoalim
        <input type="radio" name="bank" value="yahav"/>bank yahav
        <input type="radio" name="bank" value="leumi"/>bank leumi
        <input type="radio" name="bank" value="mizrachi-tfahut"/>mizrachi tfahut
        <input id="formuuid" name="uuid" type="hidden" value="${uuid}">
        <button type="submit" style="margin-top:10px;">add account</button>
        </form>
        <form action="http://localhost:8000/removeAcc" method="POST">
        <input type="hidden" id = "acc" name="accToRemove" value=0> 
        <input type="hidden" name="uuid" value="${uuid}"> 
        <button type="submit" onclick="getCurrentAccount()" style="margin-top: 20px;font-size: 30px;border-radius: 20%;background-color: #FFB6B6;">
        remove account
        </button>
        </form>
        </center>
      `;
    });
    return ("<!DOCTYPE html>" +
        "<html><head>" +
        header +
        '</head><body bgcolor="#FFF5F5">' +
        body +
        "</body></html>");
}
// if(!dbExists){
//     fs.openSync(dbFile, 'w');
// }
// let db = new sqlite3.Database(dbFile);
// if (!dbExists) {
//     db.run('CREATE TABLE `your_table` (' +
//     '`id` INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,' +
//     '`name` TEXT,' +
//     '`email` TEXT,');
// }
//  let sql = 'SELECT * FROM bankTable';
//   db.all(sql, [], (err, rows) => {
//     if (err) {
//       throw err;
//     }
//     rows.forEach((row) => {
//       console.log(row.num+ " "+row.banknum+" "+row.bankdata);
//     });
//   });
//   db.close;
//   function insertNewData(num, banknum,bankdata){
//     let sql = 'INSERT INTO bankTable (num,banknum,bankdata) VALUES ('+num+','+banknum+','+bankdata+')';
//     db.run(sql,[], function(err) {
//         if (err) {
//           return console.log(err.message);
//         }
//         // get the last insert id
//         console.log(`A row has been inserted with rowid ${this.lastID}`);
//       });
//   }
//   module.exports.insertNewData = insertNewData;
