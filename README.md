# Bot and accompanying website for the Scott Logic Foosball Euros 2016.

Project built using:

- Webpack
- Sass
- Babel (es6)
- Single HTML file
- React
- Botkit
- Botbuilder

### Development
Whilst in development have variables in the server config file for:
'slackBotToken' - The unique identifying code provided by Slack for your Bot
'database_url' - The URI for your mongoDB.
'luisToken' - The URL to your application on the LUIS natural language service (https://api.projectoxford...)

We've included the exported JSON file containing our LUIS app in server/model which can be used to create a new LUIS app.

To build the bundle and track any changes to the files run `npm run dev`

To start the server run `npm start`

Starting the server connects the bot to slack 

### Production
Remove the links to LUIS, MongoDB and Slackbot and add them as env variables on your host service.

To Webkpack the client side for production run `npm run prod`

To start the server run `npm start`

### Testing
To apply unit tests run `mocha`.

Further end-to-end testing is currently stored in the botTesting branch and utilises a second Slack bot which talks to the main bot and tests the responses.