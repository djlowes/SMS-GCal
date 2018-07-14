require('dotenv').load();

const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const got = require('got');

// Twilio
const MessagingResponse = require('twilio').twiml.MessagingResponse;
const client = require('twilio')(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);
const myNumber = process.env.MY_NUMBER;

// Instantiate Express and use middleware
const app = express();
app.use(bodyParser.urlencoded({extended: false}));


app.post('/bot', (req, res) => {

  const twiml = new MessagingResponse();
  // let messageRemainder = req.body.Body.split(' ').slice(1).join(' ');
  let messageResponse = req.body.Body.split(' '); // to get index [0]

  if (messageResponse[0] === "view" || messageResponse[0] === "View") {
    console.log(req.body.From);
    client.messages
      .create({
         body: 'Check out - http://hawaiinot.events',
         messagingServiceSid: process.env.TWILIO_MESSAGING_SERVICE_SID,
         to: req.body.From
       })
      .then(message => console.log(message.sid))
      .done();
  }

  else if (messageResponse[0] === "add" || messageResponse[0] === "Add") {

    const requestBody = {
    personalizations: [{ to: [{ email: process.env.TO_EMAIL }] }],
    from: { email: process.env.FROM_EMAIL },
    subject: `New Event From: ${req.body.From}`,
    content: [
      {
        type: 'text/plain',
        value: req.body.Body
      }
    ]
  };

  got.post('https://api.sendgrid.com/v3/mail/send', {
    headers: {
      Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  })
    .then(response => {
      console.log(response);
    })
    .catch(err => {
      console.log(err);
    });

    client.messages
      .create({
         body: 'Thank you! http://hawaiinot.events is currently being updated.',
         messagingServiceSid: process.env.TWILIO_MESSAGING_SERVICE_SID,
         to: req.body.From
       })
      .then(message => console.log(message.sid))
      .done();

  }

  else if (messageResponse[0] === "address" || messageResponse[0] === "Address") {
    client.messages
      .create({
         body: 'The Sheraton Kauai Resort is located here: https://www.google.com/maps/place/Sheraton+Kauai+Resort/@21.8761576,-159.4616121,15z/data=!4m2!3m1!1s0x0:0x72d28967b130e287?sa=X&ved=0ahUKEwi9m637n__bAhVhiFQKHZsgADYQ_BII0QEwCw',
         messagingServiceSid: process.env.TWILIO_MESSAGING_SERVICE_SID,
         to: req.body.From
       })
      .then(message => console.log(message.sid))
      .done();
  }

  else if (messageResponse[0] === "listen" || messageResponse[0] === "Listen") {
    client.calls
      .create({
         url: 'http://demo.twilio.com/docs/voice.xml',
         to: req.body.From,
         from: '+13012468195'
       })
      .then(call => console.log(call.sid))
      .done();
  }

  else {
    console.log("other")
  }

  res.writeHead(200, {'Content-Type': 'text/xml'});
  res.end(twiml.toString());

});


app.listen(process.env.PORT || 3000, function(){
  console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});
