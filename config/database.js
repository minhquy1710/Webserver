const connectDB = async()=>{
const { Client } = require('pg');
const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'tramcan',
    password: 'minhquy2001',
    port: 5432,
});
client.connect();
}
module.exports = connectDB; 