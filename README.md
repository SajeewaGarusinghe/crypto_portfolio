# crypto_portfolio

ATTEMPT IS TO CREATE NODE APPLICATION TO READ FROM LARGE CSV FILE AND PROCESS THOSE DATA

### npm packages used

#### npm install csv-parse

#### npm i nodemon --save-dev

#### npm install chalk

#### npm install yargs

#### npm install chalk@4.1.2

#### npm install boxen@5.1.2

### Application run instructions

#### 1) run node app.js

This will take some time depending on your pc specifications.

#### 2) run particular command to take desired output.sample commands are ,

##### I) latest

return the latest portfolio value per token in USD

##### II) token --token=BTC

return the latest portfolio value for that token in USD

##### III) date --date=2018/03/20

return the portfolio value per token in USD on that date

##### IV) both --date=2018/03/20 --token=ETH

return the portfolio value of that token in USD on that date
