const mysql = require('mysql');

const con = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'addlist'
});

const id = 470;
const thing = "test_test";

con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
    const sql = ("UPDATE `things` SET `thing`='"+thing+"' WHERE `id`='"+id+"'");
    con.query(sql, function (err, result) {
        if (err) throw err;
        console.log("1 record inserted");
    });
});