async function f() {
    let insert_sql = 'Show tables';
    let a=await require('./database/sqlUtils').queryRecord(insert_sql);
    console.log(a);
}
f()