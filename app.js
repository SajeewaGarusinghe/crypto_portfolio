const chalk = require('chalk');
const readline = require('readline');
const yargs = require('yargs');
const boxen = require('boxen');
const { startupTable } = require('./startupTable');

const { readCsvFile } = require('./readCsvFile');
const {
  getCryptoExchangeRateMulti,
  getCryptoExchangeRateSingle,
  getCryptoExchangeRateSingleHistoric,
} = require('./apiCall');

let animation;

let cumulativeBalances = {}; //keeping this global variable to hold all processed data after reading csv file
let latestBalance = {}; //keeping this global variable to hold latest data after reading csv file

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

//this function will work to take the inputs from the user while mapping them to different options
function askForCommand() {
  rl.question(chalk.green('Please Enter command : '), (command) => {
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
      // console.log(argv.token);
      if (argv.token) {
        if (argv.token == true) {
          logError('Invalid Token. type valid token:  latest --token=<token>');
          askForCommand();
        } else {
          option2(argv.token);
        }
      } else {
        option1();
      }
    } else if (argv._[0] === 'date') {
      // console.log(argv.date);
      if (argv.date && argv.date != true && isValidDate(argv.date)) {
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
      process.exit(1);//process exit on close command
    } else {
      logError(
        "Invalid command.Insert 'latest' or 'date' with relevant arguments"
      );
      askForCommand();
    }
  });
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

  if (balance) {
    let usdRate;

    const timeStamp = getTimestamp(dateString);

    if (+timeStamp < 1279391400) {
      logError(
        'Data not available in the crypto compare API beyond Sunday, July 18, 2010 12:00:00 AM GMT+05:30'
      );
    } else {
      let tokens = '';
      let portfolioValueInUSD = '';
      for (let token in balance) {
        usdRate = await getCryptoExchangeRateSingleHistoric(token, timeStamp);
        if (usdRate || usdRate == 0) {
          // console.log('usdrate', usdRate);
          portfolioValueInUSD += `${token}: ${(
            balance[token] * usdRate
          ).toFixed(1)} $\n`;
        }
      }
      if (portfolioValueInUSD != '') {
        logWithBox(`${dateString} : Total Balance`, portfolioValueInUSD);
      }
    }
  }

  askForCommand();
}

//----------option-4-----------------
async function option4(dateString, token) {
  token = token.toString().toUpperCase();
  const balance = getBalance(dateString, token);
  if (balance) {
    const timeStamp = getTimestamp(dateString);

    if (+timeStamp < 1279391400) {
      logError(
        'Data not available in the crypto compare API beyond Sunday, July 18, 2010 12:00:00 AM GMT+05:30'
      );
    } else {
      const usdRate = await getCryptoExchangeRateSingleHistoric(
        token,
        timeStamp
      );

      if (usdRate || usdRate == 0) {
        let portfolioValueInUSD = (balance * usdRate).toFixed(1) + ' $';
        logWithBox(`${dateString} : ${token} Balance `, portfolioValueInUSD);
      }
    }
  }

  askForCommand();
}

//------------get TimeStamp---------------
//this will return the timestamp in seconds for date string in format YYYY/MM/DD
function getTimestamp(dateString) {
  const [year, month, day] = dateString.split('/');
  const dateObject = new Date(`${year}-${month}-${day}`);
  const timeStamp = dateObject.getTime() / 1000;
  return timeStamp;
}

//------------loading Animation-----------
//this is a animation to show while initial csv file reading finish
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
//this is function to output result in a box
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
//this is function to log errors with certain styles
function logError(err) {
  console.log(chalk.red(err));
}

//-------------helper function to get balance------------
//this is helper function to op1 & op2 to get relavant dates token balance
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

  if (nearestDate) {
    if (token) {
      token = token.toString().toUpperCase();
      if (
        cumulativeBalances[nearestDate] &&
        cumulativeBalances[nearestDate][token]
      ) {
        return cumulativeBalances[nearestDate][token];
      } else {
        return 0;
      }
    } else {
      return cumulativeBalances[nearestDate];
    }
  } else {
    logError('No Transactions prior to the date you entered');
    return undefined;
  }
}

//-------function to check date format is correct--------
//this is to validate user input dates in the format YYYY/MM/DD
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

//------function to log initial instructions--------------

const initialInstructions = () => {
  console.log(chalk.red.underline('Welcome abroad !'));

  const text =
    'This is Node.js CLI program to check portfolio value: You can go for following options\n1. Latest Portfolio per token in USD \n2. Latest Portfolio for a specific token in USD \n3. Portfolio per token in USD on a specific date \n4. Portfolio of a specific token in USD on a specific date \nRefer to the table below for commands';

  let i = 0;
  const intervalId = setInterval(() => {
    process.stdout.write(chalk.yellow(text.charAt(i)));
    i++;
    if (i === text.length) {
      clearInterval(intervalId);
      process.stdout.write('\n');
      //show the table
      startupTable();
      // Start loading animation
      animation = loadingAnimation();
    }
  }, 50);
};

//showing helper details
initialInstructions();

//-----read the Csv content-----------
const promise = readCsvFile('transactions.csv');
promise
  .then(({ results, cumulativeBalance }) => {
    clearInterval(animation);
    console.log(chalk.blue.bold('CSV file read and processed !'));
    cumulativeBalances = results;
    latestBalance = cumulativeBalance;
    //continue to ask commands after reading csv
    askForCommand();
  })
  //error Handling for reading csv file
  //since the error pass via the returned promise
  .catch((error) => {
    if (error.code == 'ENOENT') {
      logWithBox(
        "application can't find the csv file",
        `Please make sure the csv file with the records, ${chalk.blue(
          'transactions.csv'
        )} file available in ${chalk.blue(__dirname)} path and try again !`
      );
    } else {
      logWithBox(
        'Error occurred in csv file',
        'please make sure the csv file is correct'
      );
      // console.error(error);
    }
    process.exit(1);//process exit on error while reading csv file
  });
