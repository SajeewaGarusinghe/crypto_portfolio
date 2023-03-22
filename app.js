const chalk = require('chalk');
const readline = require('readline');
const yargs = require('yargs');
const boxen = require('boxen');

const { readCsvFile } = require('./readCsvFile');
const {
  getCryptoExchangeRateMulti,
  getCryptoExchangeRateSingle,
  getCryptoExchangeRateSingleHistoric,
} = require('./apiCall');

// const { loadingAnimation } = require('./loadingAnimation');

let cumulativeBalances = {};
let latestBalance = {};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function askForCommand() {
  rl.question(
    chalk.green("Enter command 'latest' or 'date' with relevant arguments: "),
    (command) => {
      const argv = yargs
        .command('latest', 'Log the latest portfolio value per token in USD', {
          token: {
            describe: 'lattest balance required token',
            //   demandOption: true,
            type: 'String',
          },
        })
        .command(
          'date',
          'log the portfolio value per token in USD on that date',
          {
            token: {
              describe: 'lattest balance required token',
              //   demandOption: true,
              type: 'String',
            },
            date: {
              describe: 'latest balance required date',
              //   demandOption: true,
              type: 'String',
            },
          }
        )
        .command('close', 'close the application', {})
        .help()
        .parse(command);

      if (argv._[0] === 'latest') {
        console.log(argv.token);
        if (argv.token) {
          if (argv.token == true) {
            logError(
              'Invalid Token. type valid token:  latest --token=<token>'
            );
            askForCommand();
          } else {
            option2(argv.token);
          }
        } else {
          option1();
        }
      } else if (argv._[0] === 'date') {
        if (argv.date && isValidDate(argv.date)) {
          if (argv.token) {
            option4(argv.date, argv.token);
          } else {
            option3(argv.date);
          }
        } else {
          logError('Invalid Date. type valid date:  date --date=<date>');
          askForCommand();
        }
      } else if (argv._[0] === 'close') {
        console.log('application closing ...');
        rl.close();
        process.exit(1);
      } else {
        logError(
          "Invalid command.Insert 'latest' or 'date' with relevant arguments"
        );
        askForCommand();
      }
    }
  );
}

//----------option-1-----------------

async function option1() {
  let tokens = '';
  for (let token in latestBalance) {
    tokens += token + ',';
  }
  const usdRates = await getCryptoExchangeRateMulti(tokens);
  if (usdRates) {
    let portfolioValueInUSD = '';
    for (let token in latestBalance) {
      portfolioValueInUSD += `${token}: ${(
        latestBalance[token] * usdRates[token]
      ).toFixed(1)} $\n`;
    }

    logWithBox('Latest Balance', portfolioValueInUSD);
  }

  askForCommand();
}
//----------option-2-----------------

async function option2(token) {
  token = token.toString().toUpperCase();
  const usdRate = await getCryptoExchangeRateSingle(token);
  if (usdRate) {
    let portfolioValueInUSD = '0.0 $';
    if (latestBalance[token]) {
      portfolioValueInUSD = (latestBalance[token] * usdRate).toFixed(1) + ' $';
    }

    logWithBox(`Latest ${token} Balance `, portfolioValueInUSD);
  }

  askForCommand();
}

//----------option-3-----------------

async function option3(dateString) {
  const balance = getBalance(dateString);
  let usd_rates = {};

  const [year, month, day] = dateString.split('/');
  const dateObject = new Date(`${year}-${month}-${day}`);
  const timeStamp = dateObject.getTime();

  let tokens = '';
  let portfolioValueInUSD = '';
  for (let token in balance) {
    usd_rates[token] = await getCryptoExchangeRateSingleHistoric(
      token,
      timeStamp
    );
    if (usd_rates[token]) {
      portfolioValueInUSD += `${token}: ${(
        balance[token] * usd_rates[token]
      ).toFixed(1)} $\n`;
    }
  }
  if (portfolioValueInUSD != '') {
    logWithBox(`${dateString} : Total Balance`, portfolioValueInUSD);
  }
  askForCommand();
}

//----------option-4-----------------
async function option4(dateString, token) {
  token = token.toString().toUpperCase();
  const balance = getBalance(dateString, token);
  const [year, month, day] = dateString.split('/');
  const dateObject = new Date(`${year}-${month}-${day}`);
  const timeStamp = dateObject.getTime();
  // console.log('dateObject', dateObject);
  // console.log('timestamp', timeStamp);
  const usdRate = await getCryptoExchangeRateSingleHistoric(token, timeStamp);

  if (usdRate) {
    let portfolioValueInUSD = (balance * usdRate).toFixed(1) + ' $';
    logWithBox(`${dateString} : ${token} Balance `, portfolioValueInUSD);
  }
  askForCommand();
}

//------------loading Animation-----------

function loadingAnimation() {
  let i = 0;
  const animation = setInterval(() => {
    readline.cursorTo(process.stdout, 0);
    i = (i + 1) % 4;
    const dots = new Array(i + 1).join('.');
    process.stdout.write(chalk.yellowBright(`Loading csv ${dots}`));
  }, 500);
  return animation;
}

//-----------function to log output in a box----------
function logWithBox(header, str) {
  console.log(
    boxen(
      `${chalk.redBright.bold.underline(header)}\n\n ${chalk.whiteBright(str)}`,
      {
        padding: 1,
        borderStyle: 'double',
      }
    )
  );
}

//---------Error meassage print function----------------

function logError(err) {
  console.log(chalk.red(err));
}

//-------------helper function to get balance------------

function getBalance(dateString, token) {
  const keys = Object.keys(cumulativeBalances);
  const enteredDate = new Date(dateString);
  let nearestDate;

  for (let i = keys.length - 1; i >= 0; i--) {
    const keyDate = new Date(keys[i]);
    if (keyDate <= enteredDate) {
      nearestDate = keys[i];
      break;
    }
  }

  if (token) {
    token = token.toString().toUpperCase();
    if (cumulativeBalances[nearestDate][token]) {
      return cumulativeBalances[nearestDate][token];
    } else {
      return 0;
    }
  } else {
    return cumulativeBalances[nearestDate];
  }
}

//-------function to check date format is correct--------

function isValidDate(str) {
  const regex = /^\d{4}\/(0?[1-9]|1[0-2])\/(0?[1-9]|[12]\d|3[01])$/;
  const [year, month, day] = str.split('/').map(Number);
  const date = new Date(year, month - 1, day);
  return (
    regex.test(str) &&
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

// Start loading animation
const animation = loadingAnimation();

//-----read the Csv content-----------
const promise = readCsvFile('transactions.csv');
promise
  .then(({ results, cumulativeBalance }) => {
    clearInterval(animation);
    console.log(chalk.blue.bold('CSV file read and processed !'));
    cumulativeBalances = results;
    latestBalance = cumulativeBalance;
    // console.log(cumulativeBalances);
    //continue to ask commands after reading csv
    askForCommand();
  })
  .catch((error) => {
    console.error(error);
  });
