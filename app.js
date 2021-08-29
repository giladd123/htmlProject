const http = require('http');
let fs = require('fs');
const { runInNewContext } = require('vm');
const sqlite3 = require('sqlite3').verbose();

let dbFile = './myDataBase.db';
let dbExists = fs.existsSync(dbFile);
let num = 1;
let db = new sqlite3.Database(dbFile);

const requestListener = function (req, res) {
  console.log("request received "+num);
  num++;
  if(req.url=='/'){
    res.writeHead(200, {'Content-Type': 'text/html'});
    let myReadStream = fs.createReadStream(__dirname+'\\data\\helloworld.html','utf-8');
    myReadStream.pipe(res);
  }else if(req.url == '/getImageSrc'){
    res.writeHead(200, {'Content-Type': 'image/png'});
    let myReadStream = fs.createReadStream(__dirname+'\\data\\bbank2.png');
    myReadStream.pipe(res);
  }else if(req.url == '/getCss'){
    res.writeHead(200, {'Content-Type': 'text/css'});
    let myReadStream = fs.createReadStream(__dirname+'\\data\\style.css');
    myReadStream.pipe(res);
  }else if(req.url == '/secondPage'){
    res.writeHead(200, {'Content-Type': 'text/html'});
    let myReadStream = fs.createReadStream(__dirname+'\\data\\secondpage.html');
    myReadStream.pipe(res);
  }else if(req.url == '/getHamMenu'){
    res.writeHead(200, {'Content-Type': 'image/png'});
    let myReadStream = fs.createReadStream(__dirname+'\\data\\hamburger-menu.png');
    myReadStream.pipe(res);
  }else if(req.url == '/getLoginCss'){
    res.writeHead(200, {'Content-Type': 'text/css'});
    let myReadStream = fs.createReadStream(__dirname+'\\data\\logincss.css');
    myReadStream.pipe(res);
  }else if(req.url == '/logToAccount'){
    // res.writeHead(200);
    // console.log(req.body.email);
    // res.end();
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString(); // convert Buffer to string
    });
    req.on('end', () => {
      body = "&"+body;
      let email = getParameterByName("email",body);
      let password = getParameterByName("password",body);

  // db.close;
    });

  }else if(req.url='/signUp'){
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString(); // convert Buffer to string
    });
    req.on('end', () => {
      let email;
      let password;
      body = "&"+body;
      email = getParameterByName("email",body);
      password = getParameterByName("password",body);
      console.log(email + "  "+password);

      let uuid = insertUserToDataBase(email,password).then(result =>{
        if(result==""){
          //send email already exists
          
        }else{
          res.writeHead(200, {'Content-Type': 'text/html'});
          let htmlString;
          createHtmlPage(result).then((result)=>{
            htmlString = result;
          });
          console.log(htmlString);
          res.end(htmlString);
        }
      });
    });

  }
}
function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
const server = http.createServer(requestListener);
server.listen(8000);
function getParameterByName(name, body='') {
  name = name.replace(/[\[\]]/g, '\\$&');
  var regex = new RegExp('[&]' + name + '(=([^&#]*)|&|#|$)'),
      results = regex.exec(body);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}
async function insertUserToDataBase(email, password){
  let sql = 'SELECT "Email" FROM "UserTable" WHERE "Email" = "'+email+'"';
  let uuid = await insertNewUser(sql,email,password);
  return uuid;
}


async function insertNewUser(sql,email,password){
  return new Promise((resolve,reject)=> {
    db.all(sql, [], async(err, rows) => {
      if (err) {
       reject(err);
      }else{
        let uuid = "";
        if(rows.length>0){
  
        }else{
          uuid=uuidv4();
          sql = 'INSERT INTO "UserTable" VALUES ("'+uuid+'","'+email+'","'+password+'")';
          await new Promise((resolve,reject)=>{
            db.run(sql,[], async function(err) {
              if (err) {
                reject(err);
              }
              await new Promise((resolve,reject)=>{
                sql = 'CREATE TABLE "'+uuid+'" (Num INT AUTO_INCREMENT PRIMARY KEY, BankNum INT,Bank TEXT, Desc TEXT)';
                db.run(sql,[],(err) =>{
                  if(err){
                    reject(err);
                  }
                  resolve();
                });
              });
              // get the last insert id
              console.log(`A row has been inserted with rowid ${this.lastID}`);
              resolve();
            });
          });
        }
        resolve(uuid);
    }
  });
  });

}
async function createHtmlPage(uuid){
  let sql = 'SELECT * FROM "'+uuid+'"';
  let rows;
  await new Promise((resolve,reject)=>{
      db.all(sql,[],(err,rows)=>{
        if(err){
          reject(err);
        }else{
          resolve(rows);
        }
      })
  }).then((result)=>{
    rows = result;
  });
  let header = '<meta charset="utf-8">'+
  '<title>learning html</title>'+
  '<link rel="stylesheet" href="http://localhost:8000/getLoginCss">'+
  '<link rel="stylesheet" href="http://localhost:8000/getCss">'+
  '    <style>  table,tr,th,td {border: 1px solid black;text-align: center;}table{width: 50%;}</style>'+
  '<script>  window.onload=function(){  let dialogUp = true;  const signUpButton = document.getElementById("signUp");'+
  '  const signInButton = document.getElementById("signIn");  const container = document.getElementById("container");'+
  'signUpButton.addEventListener("click", () => {container.classList.add("right-panel-active");  });'+
  '  signInButton.addEventListener("click", () => { container.classList.remove("right-panel-active"); });</script>';

  let x = new Array(rows.length);
  for(i=0;i<x.length;i++){
    x[i] = new Array(4);
  }

  for(i=0;i<rows.length;i++){
    rows[i][0] = rows[i].Num;
    rows[i][1] = rows[i].BankNum;
    rows[i][2] = rows[i].Bank;
    rows[i][3] = rows[i].Desc;
  }

  let body = '<script> let account = 0;let rows ='+x +'function rightArrowClick(){ if(document.getElementById("dot"+(account+1))!=null){'+
  ' let divToGray  = document.getElementById("dot"+account);account++;let divToBlack = document.getElementById("dot"+account);'+
  'divToBlack.style.backgroundColor = "#000000";divToGray.style.backgroundColor = "#C4C4C4";changeData();}}function leftArrowClick(){'+
  'if(account!=0){let divToGray  = document.getElementById("dot"+account);account--;let divToBlack = document.getElementById("dot"+account);'+
  'divToBlack.style.backgroundColor = "#000000";divToGray.style.backgroundColor = "#C4C4C4";changeData();}}'
  +'function changeData(){let textNum = document.getElementById("TextNum");textNum.innerHTML = rows[account][1];let textDesc = document.getElementById("TextDesc");'+
    'textDesc.innerHTML = rows[account][3];let img = document.getElementById("bankImage")img.src = "localhost:8000/image/" + rows[account][2];}'
  +'</script>';
  body = body + '<center><h1>Welcome to EasyBanking</h1><br><h2>Please choose an account</h2><div id="rectangle">'+
          '<img id="bankImage" src="http://localhost:8000/getImageSrc" width="75%" style="margin-top: 20px;margin-bottom: 10px;"  ><br>'+
          '<div class="arrow" id="leftArrow" onclick="leftArrowClick()" style="transform: rotate(135deg);margin-right: 180px;"></div>'+
          '<div class="arrow" id="rightArrow" onclick="rightArrowClick()" style="transform: rotate(315deg);" ></div><p id="TextNum" style="font-size: 24px;margin-bottom:'
          +' 15px;">Account number</p><br><p id="TextDesc" style="font-size: 24px;margin-bottom: 15px;">Account description</p>';
  let account = 0;
  body = body + "<div id='dot"+account+"' class='dot' style='background-color: black;'></div> ";
  account++;
  rows.forEach(row => {
    body = body + "<div id='dot"+account+"' class='dot'></div> "
    account++;
  });
  body = body + '</div><a href="http://localhost:8000/secondPage"><button style="margin-top: 20px;font-size: 30px;border-radius:'
  +'20%;background-color: #FFB6B6;">login</button></a><br>'
  +'<button style="margin-top: 20px;font-size: 30px;border-radius: 20%;background-color: #FFB6B6;">add new account</button><br>'
  +'<button style="margin-top: 20px;font-size: 30px;border-radius: 20%;background-color: #FFB6B6;">remove account</button>'
  +'</center>';
  // concatenate header string
  // concatenate body string
  
  return '<!DOCTYPE html>'
        + '<html><head>' + header + '</head><body bgcolor="#FFF5F5">' + body + '</body></html>';
  
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