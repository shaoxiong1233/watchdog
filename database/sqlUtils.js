"use strict";
const mysql = require("mysql2/promise");
require('dotenv').config()


exports.upsertRecord = async (sql, record) => {
    let mysqlConnection = await mysql.createConnection({
        host: process.env.MYSQL_HOST,
        user: "test",
        password: '123456',
        port: process.env.MYSQL_PORT,
        database: "dog_database"
    });

    console.log("mysql insert data: ", record);
    try {
        let result = await mysqlConnection.execute(sql, record);
    } catch (e) {
        console.log('mysql insert failed:', e.message);
    }

    await mysqlConnection.end();
}

exports.queryRecord = async (sql) => {

    let mysqlConnection = await mysql.createConnection({
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        port: process.env.MYSQL_PORT,
        database: process.env.MYSQL_DATABASE
    });

    try {
        console.log("mysql query sql: " + sql);
        const [rows, fields] = await mysqlConnection.query(sql);
        return rows;
    } catch (e) {
        console.log("mysql query failed:" + e.message)
    } finally {
        await mysqlConnection.end();
        console.log("end")
    }
}

