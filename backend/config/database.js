const mongoose = require('mongoose');

// connecting database with server function 
const connectDatabase = () =>{
    mongoose.connect(process.env.DB_LOCAL_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }).then(con =>{
        console.log(`MongoDB is Connected to the host: ${con.connection.host}`)
    })
    // .catch((err) =>{
    //     console.log(err);
    // })
}

module.exports = connectDatabase;