const express = require('express')
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');
const cities = require("all-the-cities");
const register = require('./controllers/register');
const signin = require('./controllers/signin');
const saveSearch = require('./controllers/saveSearch');
const generateCities = require('./controllers/generateCities');
const { google } = require('googleapis');
const OAuth2Data = require('./google_key.json');
const calendarEvents = require('./controllers/calendarEvents');
const request = require('request');

//Google Cred
const CLIENT_ID = OAuth2Data.web.client_id;
const CLIENT_SECRET = OAuth2Data.web.client_secret;
const REDIRECT_URL = OAuth2Data.web.redirect_uris[0];
const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);

//process.env.NODE_TLS_REJECT_UNAUTHORIZED = "1";

const db = knex({
  client: 'pg',
  connection: {
  	connectionString : process.env.DATABASE_URL,
  	ssl  : {
    rejectUnauthorized: true
    }
  }
});

console.log('database url is:', process.env.DATABASE_URL);

const app = express();
app.use(bodyParser.json());
app.use(cors());

app.get('/', (req,res) => {
	 res.send('working');
})

app.post('/signin', (req,res) => {
	 signin.handleSignin(req,res,db,bcrypt);
})

app.post('/register/:method', (req,res) => {
    const {method} = req.params;
    if(method == 'google'){
        res.redirect('/googleAuth/register');
    }else {
        register.handleRegister(req,res,db,bcrypt, method, request);
    } 
})

app.post('/saveSearch', (req,res) => {
    saveSearch.handleSaveSearch(req,res,db,request, google, oAuth2Client);
})

app.get('/calendar/:cc/:city', (req,res) => {
    calendarEvents.handleGetCalendar(req,res,request);
})

app.post('/cities', (req,res) => {
    generateCities.handleGetCities(req,res,cities);    
});

let method;
app.get('/googleAuth/:action', (req, res, db) => {
    const {action} = req.params;
    method = action;
    const url = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: ['https://www.googleapis.com/auth/gmail.readonly', 'https://www.googleapis.com/auth/userinfo.email','https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/calendar.events']
    });
    console.log(url);
    const userAuth = {'url' : url};
    res.json(userAuth);
});

app.get('/auth/google/callback', function (req, res) {
    console.log('action in callback' , method);
    const code = req.query.code;
    if (code) {
        oAuth2Client.getToken(code, async function (err, tokens) {
            if (err) {
                console.log('Error authenticating')
                console.log(err);
            } else {
                console.log('Successfully authenticated');
                oAuth2Client.setCredentials(tokens);
                const people = google.people({ version: 'v1', auth: oAuth2Client});
                const me = await people.people.get({
                    resourceName: 'people/me',
                    personFields: 'emailAddresses',
                });
                const userEmail = me.data.emailAddresses[0].value;
                const name = userEmail.split('@')[0];
                if(method === 'register'){
                    request.post('http://localhost:5000/register/googleAfterAuth', {
                      json: {
                        "email" : userEmail,
                        "name" : name,
                        "password" : 'googleAuth'
                      }
                    }, (error, res, body) => {
                      if (error) {
                        console.error(error)
                        return
                      }
                      console.log(`statusCode: ${res.statusCode}`);
                      console.log('body back in callback:',body);
                      redirect(body);
                    })
                    
                } else if (method === 'login'){
                    db.select('*').from('users').where('email', '=', userEmail).then(user => {
                        if(user[0].id){
                            console.log(user);
                             res.redirect('http://localhost:3000/profile/' + user[0].id); 
                         }
                    }).catch(err => res.status(400).json('user doesnt exist'))
                }

                function redirect(userId){
                  res.redirect('http://localhost:3000/profile/' + userId);
                }
            }
        });
    }
});

app.listen(process.env.PORT || 5000, () => {
	console.log(`server is running on port ${process.env.PORT}`);
})