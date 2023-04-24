const app = require('./app');

const path = require('path');
const connectDatabase = require('./config/database');

// connecting dotenv with config.env // path.join used to join 2 paths


connectDatabase();




// making server listening to the Port
const server = app.listen(process.env.PORT, ()=>{
    console.log(` server listening to the port: ${process.env.PORT} in ${process.env.NODE_ENV} `);
})

process.on('unhandledRejection',(err) =>{
    console.log(`Error: ${err.message} `);
    console.log('Shutting down the Server due to unhandled rejection Error');
    server.close(() => {
        process.exit(1);
    })    
})



// process.on('uncaughtException', (err) =>{
//     console.log(`Error: ${err.message} `);
//     console.log('Shutting down the Server due to uncaught Exception Error');
//     server.close(() => {
//         process.exit();
//     })    
// })

