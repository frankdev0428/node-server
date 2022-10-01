const express = require('express');
const app = express();
const path = require('path');
const PORT = process.env.PORT || 3500;
const cors = require('cors');
const corsOptions = require('./config/corsOptions');
const { logger } = require('./middleware/logEvents');
const  errorHandler = require('./middleware/errorHandler');
//custom middleware logger
app.use(logger);
//cross origin resource sharing
app.use(cors(corsOptions));
//custom middleware logger
//build-in middleeware to handle urlencoded data
app.use(express.urlencoded({ extended : false}));

//buil-in middleware for json 
app.use(express.json());

//server static files
app.use('/',express.static(path.join(__dirname, '/public')));

//routes
app.use('/', require('./routes/root'));
app.use('/register', require('./routes/register'));
app.use('/auth', require('./routes/auth'));
app.use('/employees', require('./routes/api/employees'));

//app.use('/')
app.all('*', (req,res) => {
  res.status(404);
  if(req.accepts('html')){
    res.sendFile(path.join(__dirname, 'views','404.html'))
  } else if (req.accepts('json')){
    res.json({ error : " 404 Not Found "})
  } else {
    res.type('txt').send("404 Not Found ");
  }
})
app.use(errorHandler);

app.listen( PORT, () => console.log(`Server running on port ${PORT}`));






