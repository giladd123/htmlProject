var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
var __reExport = (target, module2, desc) => {
  if (module2 && typeof module2 === "object" || typeof module2 === "function") {
    for (let key of __getOwnPropNames(module2))
      if (!__hasOwnProp.call(target, key) && key !== "default")
        __defProp(target, key, { get: () => module2[key], enumerable: !(desc = __getOwnPropDesc(module2, key)) || desc.enumerable });
  }
  return target;
};
var __toModule = (module2) => {
  return __reExport(__markAsModule(__defProp(module2 != null ? __create(__getProtoOf(module2)) : {}, "default", module2 && module2.__esModule && "default" in module2 ? { get: () => module2.default, enumerable: true } : { value: module2, enumerable: true })), module2);
};

// node_modules/tsup/assets/cjs_shims.js
var importMetaUrlShim = typeof document === "undefined" ? new (require("url")).URL("file:" + __filename).href : document.currentScript && document.currentScript.src || new URL("main.js", document.baseURI).href;

// src/app2.ts
var http = __toModule(require("http"));
var fs = __toModule(require("fs"));
var path = __toModule(require("path"));
var sqlite3 = __toModule(require("sqlite3"));

// src/scraper.ts
var puppeteer = __toModule(require("puppeteer"));
async function getBankData(bank, bankAccount, password) {
  if (bank == "habenleumi") {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto("https://www.fibi.co.il/wps/portal/");
    await page.waitForSelector("#layoutContainers > div > div.wptheme1Col > div > div.component-control.id-Z7_5G3DTJOFILEIE0QGETKUFF2G03 > section > div.wpthemeControlBody.wpthemeOverflowAuto.wpthemeClear.wellfixed > section > div:nth-child(3) > div > ul > li:nth-child(1) > a");
    const button = await page.$("#layoutContainers > div > div.wptheme1Col > div > div.component-control.id-Z7_5G3DTJOFILEIE0QGETKUFF2G03 > section > div.wpthemeControlBody.wpthemeOverflowAuto.wpthemeClear.wellfixed > section > div:nth-child(3) > div > ul > li:nth-child(1) > a");
    await button.click();
    await page.waitForSelector("#login");
    const frameHandle = await (await page.$("#loginFrame")).contentFrame();
    await frameHandle.waitForSelector("#username");
    const username = await frameHandle.$("#username");
    await sleep(1100);
    await username.type(bankAccount, { delay: 70 });
    await sleep(1e3);
    const pass = await frameHandle.$("#password");
    await pass.type(password, { delay: 50 });
    const button2 = await frameHandle.$("#continueBtn");
    await button2.click();
    await page.waitForNavigation({ waitUntil: "load" });
    const button3 = await page.$("#div3 > table > tbody > tr.tr_one > td.first > span > a");
    await button3.click();
    await page.waitForNavigation({ waitUntil: "load" });
    let dates = await page.$$eval("#dataTable077 > tbody > tr > td.date.first > span", (arr) => arr.map((x) => x.innerHTML));
    let details = await page.$$eval("#dataTable077 > tbody > tr > td.reference.wrap_normal > div > a,#dataTable077 > tbody > tr > td.reference.wrap_normal > a > span,#\\32", (arr) => arr.map((x) => x.innerHTML));
    let kind = await page.$$eval("#dataTable077 > tbody > tr > td.details", (arr) => arr.map((x) => x.innerHTML));
    let credit = await page.$$eval("#dataTable077 > tbody > tr > td.credit > span", (arr) => arr.map((x) => x.innerHTML));
    let debit = await page.$$eval("#dataTable077 > tbody > tr > td.debit > span", (arr) => arr.map((x) => x.innerHTML));
    let balance = await page.$$eval("#dataTable077 > tbody > tr > td.balance.last > span", (arr) => arr.map((x) => x.innerHTML));
    await browser.close();
    let table = { dates, details, kind, credit, debit, balance };
    return table;
  }
}
function sleep(ms) {
  return new Promise((resolve2) => {
    setTimeout(resolve2, ms);
  });
}

// src/app2.ts
var dbFile = "./myDataBase.db";
var dbExists = fs.existsSync(dbFile);
var db = new sqlite3.Database(dbFile);
var requestListener = function(req, res) {
  console.log(req.url);
  if (req.url == "/") {
    res.writeHead(200, { "Content-Type": "text/html" });
    let myReadStream = fs.createReadStream(path.resolve(__dirname + "/../public/helloworld.html"), "utf-8");
    myReadStream.pipe(res);
  } else if (req.url == "/getCss") {
    res.writeHead(200, { "Content-Type": "text/css" });
    let myReadStream = fs.createReadStream(path.resolve(__dirname + "/../public/style.css"));
    myReadStream.pipe(res);
  } else if (req.url == "/secondpage") {
    res.writeHead(200, { "Content-Type": "text/html" });
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => {
      body = "&" + body;
      let username = getParameterByName("username", body);
      getSecondPageHtml().then((html) => {
        html = html.replace("let userName", `let userName = "${username}"`);
        res.end(html);
      });
    });
  } else if (req.url == "/getHamMenu") {
    res.writeHead(200, { "Content-Type": "image/png" });
    let myReadStream = fs.createReadStream(path.resolve(__dirname + "/../public/hamburger-menu.png"));
    myReadStream.pipe(res);
  } else if (req.url == "/signUp") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      res.writeHead(200, { "Content-Type": "application/json" });
      let email;
      let password;
      body = "&" + body;
      email = getParameterByName("email", body);
      password = getParameterByName("password", body);
      insertUserToDataBase(email, password).then((uuid) => {
        res.end(JSON.stringify({ uuid }));
      });
    });
  } else if (req.url == "/addNewAccount") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      let bankNum;
      let bankDesc;
      let bank;
      let uuid;
      body = "&" + body;
      bankNum = getParameterByName("bankNum", body);
      bank = getParameterByName("bank", body);
      bankDesc = getParameterByName("bankDesc", body);
      uuid = getParameterByName("uuid", body);
      insertAccountToUser(uuid, bank, bankDesc, bankNum).then(() => {
        res.end();
      });
    });
  } else if (req.url == "/getDataFromAccount") {
    res.writeHead(200, { "Content-Type": "application/json" });
    let body;
    req.on("data", (chunk) => {
      body = JSON.parse(chunk);
    });
    req.on("end", () => {
      let uuid = body.uuid;
      getDataFromAccount(uuid).then((data) => {
        res.end(data);
      });
    });
  } else if (req.url.includes("image/")) {
    res.writeHead(200, { "Content-Type": "image/png" });
    let myReadStream = fs.createReadStream(path.resolve(__dirname + "/../public/images/", req.url.substr(7) + ".png"));
    myReadStream.pipe(res);
  } else if (req.url == "/firstPageCss") {
    res.writeHead(200, { "Content-Type": "text/css" });
    let myReadStream = fs.createReadStream(path.resolve(__dirname + "/../public/firstPage.css"));
    myReadStream.pipe(res);
  } else if (req.url == "/login") {
    res.writeHead(200, { "Content-Type": "application/json" });
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      let email;
      let password;
      body = "&" + body;
      email = getParameterByName("email", body);
      password = getParameterByName("password", body);
      console.log(`${email}  ${password}`);
      checkIfUserExists(email, password).then((uuid) => {
        if (uuid) {
          res.end(JSON.stringify({ uuid: uuid.UID }));
        } else {
          res.end(JSON.stringify({ uuid: "already exists" }));
        }
      });
    });
  } else if (req.url == "/getLoginCss") {
    res.writeHead(200, { "Content-Type": "text/css" });
    let myReadStream = fs.createReadStream(path.resolve(__dirname + "/../public/logincss.css"));
    myReadStream.pipe(res);
  } else if (req.url == "/mainPage") {
    res.writeHead(200, { "Content-Type": "text/html" });
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      let uuid;
      body = "&" + body;
      uuid = getParameterByName("uuid", body);
      if (uuid && uuid != "already exists") {
        checkIfUuidExists(uuid).then((exists) => {
          if (exists) {
            createUuidVariableHomePage(uuid).then((html) => {
              res.end(html);
            });
          } else {
            res.end('<!DOCTYPE html> <html><head> </head><body bgcolor="#FFF5F5"><p> this account does not exist</p> <br> <a href="http://localhost:8000"><button>Go back</button></a> </body></html>');
          }
        });
      } else if (uuid == "already exists")
        res.end('<!DOCTYPE html> <html><head> </head><body bgcolor="#FFF5F5"><p>email already exists in db with other password</p> <br> <a href="http://localhost:8000"><button>Go back</button></a> </body></html>');
      else {
        '<!DOCTYPE html> <html><head> </head><body bgcolor="#FFF5F5"><p>failed creating user</p> <br> <a href="http://localhost:8000"><button>Go back</button></a> </body></html>';
      }
    });
  } else if (req.url == "/removeAcc") {
    let body;
    req.on("data", (chunk) => {
      body = JSON.parse(chunk);
    });
    req.on("end", () => {
      let accToRemove = body.accToRemove;
      let uuid = body.uuid;
      removeAccount(uuid, accToRemove).then(() => {
        res.writeHead(200, { "Content-Type": "text/plain" });
        res.end();
      });
    });
  } else if (req.url == "/getBankTable") {
    let body;
    req.on("data", (chunk) => {
      body = JSON.parse(chunk);
    });
    req.on("end", () => {
      console.log(body.account, body.password);
      getTablePuppeteer(body.account, body.password).then((table) => {
        res.writeHead(200, { "Content-Type": "Application/json" });
        res.end(JSON.stringify(table));
      });
    });
  }
};
async function getSecondPageHtml() {
  return await new Promise((resolve2, reject) => {
    fs.readFile(path.resolve(__dirname + "/../public/secondpage.html"), "utf8", (err, data) => {
      if (err) {
        reject(err);
      }
      resolve2(data.toString());
    });
  });
}
async function getTablePuppeteer(account, password) {
  let table = await getBankData("habenleumi", account, password);
  return table;
}
async function removeAccount(uuid, accToRemove) {
  await new Promise((resolve2, reject) => {
    db.run("DELETE FROM '" + uuid + "' WHERE Num=" + accToRemove, [], (err) => {
      if (err) {
        reject(err);
      } else {
        resolve2(void 0);
      }
    });
  });
  let rows;
  await new Promise((resolve2, reject) => {
    let sql2 = `SELECT * FROM '${uuid}'`;
    db.all(sql2, [], (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve2(result);
      }
    });
  }).then((result) => {
    rows = result;
  });
  let thisAcc = accToRemove;
  let sql = `UPDATE '${uuid}' SET Num = ${thisAcc} WHERE Num = ${thisAcc + 1}`;
  await new Promise((resolve2, reject) => {
    db.run(sql, [], (err) => {
      if (err) {
        reject(err);
      } else {
        resolve2(void 0);
      }
    });
  });
  for (; thisAcc < rows.length; thisAcc++) {
    await new Promise((resolve2, reject) => {
      sql = `UPDATE '${uuid}' SET Num = ${thisAcc} WHERE Num = ${+thisAcc + 1}`;
      db.run(sql, [], (err) => {
        if (err) {
          reject(err);
        } else {
          resolve2(void 0);
        }
      });
    });
  }
}
async function createUuidVariableHomePage(uuid) {
  let html;
  html = await new Promise((resolve2, reject) => {
    fs.readFile(path.resolve(__dirname + "/../public/accountPage.html"), "utf8", (err, data) => {
      if (err) {
        reject(err);
      }
      resolve2(data.toString());
    });
  });
  html = html.replace(`let uuid = "";`, `let uuid = "${uuid}";`);
  return html;
}
async function insertUserToDataBase(email, password) {
  let sql = `SELECT 'Email' FROM "UserTable" WHERE "Email" = '${email}'`;
  let uuid = await insertNewUser(sql, email, password);
  return uuid;
}
function uuidv4() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == "x" ? r : r & 3 | 8;
    return v.toString(16);
  });
}
async function checkIfUserExists(email, password) {
  let row = await new Promise((resolve2, reject) => {
    let sql = `SELECT UID FROM UserTable WHERE Email = "${email}" AND Password = "${password}"`;
    db.get(sql, [], (err, row2) => {
      if (err) {
        reject(err);
      } else {
        resolve2(row2);
      }
    });
  });
  return row;
}
async function insertNewUser(sql, email, password) {
  return await new Promise((resolve2, reject) => {
    db.all(sql, [], async (err, rows) => {
      if (err) {
        reject(err);
      } else {
        let uuid = "already exists";
        if (rows.length > 0) {
        } else {
          uuid = uuidv4();
          sql = `INSERT INTO "UserTable" VALUES ("${uuid}","${email}","${password}")`;
          await new Promise((resolve3, reject2) => {
            db.run(sql, [], async function(err2) {
              if (err2) {
                reject2(err2);
              }
              await new Promise((resolve4, reject3) => {
                sql = `CREATE TABLE "${uuid}" (Num INT AUTO_INCREMENT PRIMARY KEY, BankNum INT,Bank TEXT, Desc TEXT)`;
                db.run(sql, [], (err3) => {
                  if (err3) {
                    reject3(err3);
                  }
                  resolve4(void 0);
                });
              });
              console.log(`A row has been inserted with rowid ${this.lastID}`);
              resolve3(void 0);
            });
          });
        }
        resolve2(uuid);
      }
    });
  });
}
async function insertAccountToUser(uuid, bank, bankDesc, bankNum) {
  let sql = 'SELECT * FROM "' + uuid + '"';
  if (bankNum != null && bankDesc != null && bank != null && uuid != null) {
    new Promise((resolve2, reject) => {
      db.all(sql, [], (err, rows) => {
        if (err)
          reject(err);
        else {
          resolve2(rows.length);
        }
      });
    }).then((result) => {
      sql = `INSERT INTO "${uuid}" VALUES(${result},"${bankNum}","${bank}","${bankDesc}")`;
      new Promise((resolve2, reject) => {
        db.run(sql, [], (err) => {
          if (err) {
            reject(err);
          } else {
            resolve2(void 0);
          }
        });
      });
    });
  }
}
function getParameterByName(name, body = "") {
  name = name.replace(/[\[\]]/g, "\\$&");
  var regex = new RegExp("[&]" + name + "(=([^&#]*)|&|#|$)"), results = regex.exec(body);
  if (!results)
    return null;
  if (!results[2])
    return "";
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}
async function getDataFromAccount(uuid) {
  let rows = await new Promise((resolve2, reject) => {
    let sql = `SELECT * FROM "${uuid}"`;
    db.all(sql, [], (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve2(result);
      }
    });
  });
  return JSON.stringify(rows);
}
async function checkIfUuidExists(uuid) {
  let sql = `SELECT * FROM UserTable WHERE UID = "${uuid}"`;
  let exists = await new Promise((resolve2, reject) => {
    db.all(sql, [], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        if (rows.length > 0)
          resolve2(true);
        else
          resolve2(false);
      }
    });
  });
  return Promise.resolve(exists);
}
var server = http.createServer(requestListener);
server.listen(8e3, () => {
  console.log(`Server listening on port 8000`);
});
