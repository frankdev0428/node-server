const express = require('express');
const app = express();
const path = require('path');
const PORT = process.env.PORT || 3500;
const cors = require('cors');
const { logger } = require('./middleware/logEvents');
const  errorHandler = require('./middleware/errorHandler');
//custom middleware logger
app.use(logger);
//cross origin resource sharing
const whitelist = ['http://127.0.0.1:5500','http://localhost:3500']
const corsOptions = {
  origin : (origin,callback) => {
       if (whitelist.indexOf(origin) !== -1 || !origin){
          callback(null, true)
       } else {
         callback(new Error('Not allowed by CORS'));
       }
  },
  optionsSuccessStatus : 200
}
app.use(cors(corsOptions));
//custom middleware logger
//build-in middleeware to handle urlencoded data
//in other worlds ,form data:
// 'content-type : application/x-www-form-urlencode'
app.use(express.urlencoded({ extended : false}));
//buil-in middleware for json 
app.use(express.json());
//server static files
app.use(express.static(path.join(__dirname, '/public')));
app.get('/',(req,res) => {
  // res.sendFile('./views/index.html',{root: __dirname});
  res.sendFile(path.join(__dirname,'views', 'index.html'));
});

app.get('/new-page.html', (req,res) => {
  res.sendFile(path.join(__dirname,'views', 'new-page.html'));
});

app.get('/old-page(.html)?', (req,res) => {
  res.redirect(301, '/new-page.html');   //302 by default
});

app.get('/hello(.html)?',(req,res,next) => {
   console.log('attempted to load hello.html')
   next()
}, (req,res) => {
  res.send('Hello World!');
})


app.get('/*', (req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'views', '404.html'));
})

//Route handlers 

//chaining route handlers
const one = (req,res, next) => {
  console.log('one');
  next()
}

const two = (req ,res, next) => {
  console.log('two');
  next()
}

const three = (req,res) => {
  console.log('three');
  res.send('Finished!');
}
app.get('/chain(.html)?',[one,two,three]);
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






