const http = require('http');
let fs = require('fs');
let num = 1;
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
    let myReadStream = fs.createReadStream(__dirname+'\\data\\hamburger-menu.png');
    myReadStream.pipe(res);
  }
}

const server = http.createServer(requestListener);
server.listen(8000);


// const sqlite3 = require('sqlite3').verbose();
// let fs =require('fs');
// let dbFile = './myDataBase.db';
// let dbExists = fs.existsSync(dbFile);
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