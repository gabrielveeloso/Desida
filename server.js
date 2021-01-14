console.log('Server-side code running');
const express = require('express');
const bodyParser = require('body-parser')
const fs = require('fs');
//convert json to csv
const csvjson = require('csvjson');
const nodemailer = require('nodemailer');

const app = express();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'verarobot3@gmail.com',
    pass: 'Cognihub106723$'
  }
});

// serve files from the public directory
app.use(express.static('public'));

app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(bodyParser.json({ limit: '50mb' }));

// start the express web server listening on 8080
app.listen(7005, () => {
  console.log('listening on 7005');
});

// serve the homepage
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public');
});

//post per creare file
app.post('/clicked', (req, res) => {
  // console.log('store data: ', req.body);
  let data = JSON.stringify(req.body.data, null, '\t');

  const csvData = csvjson.toCSV(req.body.data, {
    headers: 'key'
  });

  // console.log("Change json data in csv: ", csvData);

  fs.writeFile(`results/${req.body.filename}.json`, data, error => {
    if (error) {
      console.log("An error occurred: ", error);
      res.sendStatus(500);
    } else {
      console.log('Your file is made! JSON');

      fs.writeFile(`results/${req.body.filename}.csv`, csvData, error => {
        if (error) {
          console.log("An error occurred: ", error);
          res.sendStatus(500);
        } else {
          console.log('Your file is made! CSV');

          const mailOptions = {
            from: 'verarobot3@gmail.com',
            to: 'verarobot3@gmail.com',
            subject: 'Nova análise de Foco Atencional',
            text: 'Em anexo os arquivos da análise feita.',
            attachments: [
              {
                filename: `${req.body.filename}.json`,
                path: `results/${req.body.filename}.json`
              },
              {
                filename: `${req.body.filename}.csv`,
                path: `results/${req.body.filename}.csv`
              }
            ]
          };

          transporter.sendMail(mailOptions, function(error, info) {
            if (error) {
              console.log("An error occurred: ", error);
              res.sendStatus(500);
            } else {
              console.log('Email sent: ' + info.response);
              res.sendStatus(201);
            }
          });

          res.sendStatus(201);
        }

      })
    }
  })
});
