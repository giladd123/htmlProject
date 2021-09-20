const http = require("http");
let fs = require("fs");
const sqlite3 = require("sqlite3").verbose();
let dbFile = "./myDataBase.db";
let dbExists = fs.existsSync(dbFile);
let db = new sqlite3.Database(dbFile);
const requestListener = function (req, res) {
    console.log(req.url);
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
    else if (req.url == "/secondpage") {
        res.writeHead(200, { "Content-Type": "text/html" });
        let myReadStream = fs.createReadStream(__dirname + "\\data\\secondpage.html");
        myReadStream.pipe(res);
    }
    else if (req.url == "/getHamMenu") {
        res.writeHead(200, { "Content-Type": "image/png" });
        let myReadStream = fs.createReadStream(__dirname + "\\data\\hamburger-menu.png");
        myReadStream.pipe(res);
    }
    else if (req.url == "/signUp") {
        let body = "";
        req.on("data", (chunk) => {
            body += chunk.toString(); // convert Buffer to string
        });
        req.on("end", () => {
            res.writeHead(200, { "Content-Type": "text/plain" });
            let email;
            let password;
            body = "&" + body;
            email = getParameterByName("email", body);
            password = getParameterByName("password", body);
            insertUserToDataBase(email, password).then((uuid) => {
                res.end(uuid);
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
            body = "&" + body;
            bankNum = getParameterByName("bankNum", body);
            bank = getParameterByName("bank", body);
            bankDesc = getParameterByName("bankDesc", body);
            uuid = getParameterByName("uuid", body);
            insertAccountToUser(uuid, bank, bankDesc, bankNum).then(() => {
                res.end();
            });
        });
    }
    else if (req.url == "/getDataFromAccount") {
        res.writeHead(200, { "Content-Type": "application/json" });
        let body;
        req.on("data", (chunk) => {
            body = JSON.parse(chunk); // convert Buffer to string
        });
        req.on("end", () => {
            let uuid = body.uuid;
            getDataFromAccount(uuid).then((data) => {
                res.end(JSON.stringify(data));
            });
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
        res.writeHead(200, { "Content-Type": "application/json" });
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
            checkIfUserExists(email, password).then((uuid) => {
                res.end(uuid.UID);
            });
        });
    }
    else if (req.url == "/getLoginCss") {
        res.writeHead(200, { "Content-Type": "text/css" });
        let myReadStream = fs.createReadStream(__dirname + "\\data\\logincss.css");
        myReadStream.pipe(res);
    }
    else if (req.url == "/mainPage") {
        res.writeHead(200, { "Content-Type": "text/html" });
        let body;
        req.on("data", (chunk) => {
            body += chunk.toString(); // convert Buffer to string
        });
        req.on("end", () => {
            let uuid;
            uuid = getParameterByName("uuid", body);
            if (uuid) {
                checkIfUuidExists(uuid).then((exists) => {
                    if (exists) {
                        createUuidVariableHomePage(uuid).then((html) => {
                            res.end(html);
                        });
                    }
                    else {
                        res.end('<!DOCTYPE html> <html><head> </head><body bgcolor="#FFF5F5"><p> this account does not exist</p> <br> <a href="http://localhost:8000"><button>Go back</button></a> </body></html>');
                    }
                });
            }
        });
    }
};
async function createUuidVariableHomePage(uuid) {
    let html;
    html = await new Promise((resolve, reject) => {
        fs.readFile(`${__dirname}\\data\\accountPage.html`, "utf8", (err, data) => {
            if (err) {
                reject(err);
            }
            resolve(data.toString());
        });
    });
    html.replace(`let uuid = ""`, `let uuid = "${uuid}"`);
    return Promise.resolve(html);
}
async function insertUserToDataBase(email, password) {
    let sql = `'SELECT "Email" FROM "UserTable" WHERE "Email" = ${email}`;
    let uuid = await insertNewUser(sql, email, password);
    return uuid;
}
function uuidv4() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
        var r = (Math.random() * 16) | 0, v = c == "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}
async function checkIfUserExists(email, password) {
    let row = await new Promise((resolve, reject) => {
        let sql = `SELECT UID FROM UserTable WHERE Email = "${email}" AND Password = "${password}"`;
        db.get(sql, [], (err, row) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(row);
            }
        });
    });
    return Promise.resolve(row);
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
async function insertAccountToUser(uuid, bank, bankDesc, bankNum) {
    let sql = `SELECT * FROM ${uuid}`;
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
            sql = `INSERT INTO ${uuid} VALUES(${result},${bankNum},${bank},${bankDesc})`;
            new Promise((resolve, reject) => {
                db.run(sql, [], (err) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(undefined);
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
    let rows = await new Promise((resolve, reject) => {
        let sql = `SELECT * FROM "${uuid}"`;
        db.all(sql, [], (err, result) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(result);
            }
        });
    });
    return Promise.resolve(JSON.stringify(rows));
}
async function checkIfUuidExists(uuid) {
    let sql = `SELECT * FROM UserTable WHERE UID = "${uuid}"`;
    let exists = await new Promise((resolve, reject) => {
        db.all(sql, [], (err, rows) => {
            if (err) {
                reject(err);
            }
            else {
                if (rows.length > 0)
                    resolve(true);
                else
                    resolve(false);
            }
        });
    });
    return Promise.resolve(exists);
}
const server = http.createServer(requestListener);
server.listen(8000);
