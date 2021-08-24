const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const MessageModel= require('./model');

const DBURL = process.env.mongodbURL || 'mongodb://127.0.0.1:27017/MerkleUsers';

const app = express();
const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(express.static(path.join(__dirname, '/public')));
app.use(bodyParser.urlencoded({ extended: true }));

//Database connection
mongoose.connect(DBURL, { useUnifiedTopology: true, useNewUrlParser: true });
const db = mongoose.connection;
db.on('error', () => {
    console.error("DB connection failed.");
});
db.once('open', () => {
    console.log("DB connection established.");
});

const user = 'Phil';

//Routes
app.get('/', (req, res) => {
   res.render('login');
});

app.get('/messages', (req, res) => {
    MessageModel.find({ recipient: user }).sort({date: 'desc'}).exec((err, records) => {
        if(err) console.error(err);
        let messages = records.reduce((acc, curr) => {
            return acc + "<tr>\n" +
                "<td>" + curr.recipient + "</td>\n" +
                "<td>" + curr.message + "</td>\n" +
                "<td>" + curr.date + "</td>\n" +
                "</tr>";
        }, '');
        res.render('messages', { data: messages });
    });
});

app.post('/messages', (req, res) => {
    const newMessage = new MessageModel(req.body);
    newMessage.userID = 'test';
    newMessage.date = new Date(Date.now()).toISOString();
    newMessage.save((err, msg) => {
        if(err) return console.log(err);
        res.redirect('messages');
    })
});


app.get('/send', (req, res) => {
    res.render('send');
});

app.get('/admin', (req, res) => {
    MessageModel.find({}).sort({date: 'desc'}).exec((err, records) => {
        if(err) console.error(err);
        let messages = records.reduce((acc, curr) => {
            return acc + "<tr>\n" +
                "<td>" + curr.recipient + "</td>\n" +
                "<td>" + curr.message + "</td>\n" +
                "<td>" + curr.date + "</td>\n" +
                "</tr>";
        }, '');
        res.render('messages', { data: messages });
    });
});

app.get('*', (req, res) => {
    res.render('error');
});

app.listen(port, () => {
    console.log(`listening on port ${port}`)
});