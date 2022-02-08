const express = require('express');
const dotenv = require('dotenv');
const nodemailer = require('nodemailer');
const { google } = require('googleapis');

const app = express();
dotenv.config();

const cors = require('cors');
app.use(cors());

app.use(express.json());

const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const redirectURL = process.env.REDIRECT_URL;
const refreshToken = process.env.REFRESH_TOKEN;

const oAuth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectURL);
oAuth2Client.setCredentials({ refresh_token: refreshToken });


const createTransporter = async () => {
  
    const accessToken = await new Promise((resolve, reject) => {
      oAuth2Client.getAccessToken((err, token) => {
        if (err) {
          reject("Failed to create access token :(");
        }
        resolve(token);
      });
    });
  
    const transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE,
        auth: {
            type: process.env.AUTH_TYPE,
            user: process.env.EMAIL_USERNAME,
            clientId,
            clientSecret,
            refreshToken,
            accessToken
        },
    });
  
    return transporter;
  };

app.post('/sendEmail', async (req,res) => {
    const { to, subject, text, html } = req.body;

    var mailOptions = {
            from: process.env.EMAIL_USERNAME,
            to: to,
            subject: subject,
            text: text,
            html: html
    };

    let emailTransporter = await createTransporter();

    emailTransporter.sendMail(mailOptions, function(error, info) {
        if(error)
        {
        res.status(400).send('mail not sent');
        }
        else{
        res.status(200).send('verified');
        }
    })
})

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})