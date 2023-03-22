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
    chalk.green(
      "Enter a command 'latest','token','date' or 'both' and relevant arguments: "
    ),
    (command) => {
      const argv = yargs
        .command(
          'latest',
          'Log the latest portfolio value per token in USD',
          {}
        )

        .command(
          'token',
          'log the latest portfolio value for given token in USD',
          {
            token: {
              describe: 'lattest balance required token',
              //   demandOption: true,
              type: 'String',
            },
          }
        )
        .command(
          'date',
          'log the portfolio value per token in USD on that date',
          {
            date: {
              describe: 'latest balance required date',
              //   demandOption: true,
              type: 'String',
            },
          }
        )
        .command(
          'both',
          'log the portfolio value of that token in USD on that date',
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
        // console.log('op 1');
        option1();
        // console.log(latestBalance);
      } else if (argv._[0] === 'token') {
        // console.log('op 2');
        if (argv.token) {
          // console.log(argv.token);
          option2(argv.token);
        } else {
          console.log(chalk.red('Invalid parameters. Type --token=<token>'));
          askForCommand();
        }
      } else if (argv._[0] === 'date') {
        // console.log('op 3');

        if (argv.date) {
          // console.log(argv.date);
          option3(argv.date);
        } else {
          console.log(
            chalk.red('Invalid parameters. Type:  date --date=<date>')
          );
          askForCommand();
        }
      } else if (argv._[0] === 'both') {
        // console.log('op 4');
        if (argv.token && argv.date) {
          // console.log(argv.token);
          // console.log(argv.date);
          option4(argv.date, argv.token);
        } else {
          console.log(
            chalk.red(
              'Invalid parameters. Type:  both --token=<token> --date=<date>'
            )
          );
          askForCommand();
        }
      } else if (argv._[0] === 'close') {
        console.log('application closing ...');
        rl.close();
        process.exit(1);
      } else {
        console.log(
          chalk.red(
            "Invalid command. Type 'latest','token','date' or 'both' and relevant arguments"
          )
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
  let portfolioValueInUSD = '';
  for (let token in latestBalance) {
    portfolioValueInUSD += `${token}: ${(
      latestBalance[token] * usdRates[token]
    ).toFixed(1)} $\n`;
  }

  logWithBox('Latest Balance', portfolioValueInUSD);
  askForCommand();
}
//----------option-2-----------------

async function option2(token) {
  token = token.toUpperCase();
  const usdRate = await getCryptoExchangeRateSingle(token);
  let portfolioValueInUSD = (latestBalance[token] * usdRate).toFixed(1) + ' $';
  logWithBox(`Latest ${token} Balance `, portfolioValueInUSD);
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
    portfolioValueInUSD += `${token}: ${(
      balance[token] * usd_rates[token]
    ).toFixed(1)} $\n`;
  }
  logWithBox(`${dateString} : Total Balance`, portfolioValueInUSD);
  askForCommand();
}

//----------option-4-----------------
async function option4(dateString, token) {
  token = token.toUpperCase();
  const balance = getBalance(dateString, token);
  const [year, month, day] = dateString.split('/');
  const dateObject = new Date(`${year}-${month}-${day}`);
  const timeStamp = dateObject.getTime();
  const usdRate = await getCryptoExchangeRateSingleHistoric(token, timeStamp);
  let portfolioValueInUSD = (balance * usdRate).toFixed(1) + ' $';
  logWithBox(`${dateString} : ${token} Balance `, portfolioValueInUSD);
  askForCommand();
}

//------------loading Animation-----------

function loadingAnimation() {
  let i = 0;
  const animation = setInterval(() => {
    readline.cursorTo(process.stdout, 0);
    i = (i + 1) % 4;
    const dots = new Array(i + 1).join('.');
    process.stdout.write(chalk.yellowBright(`Loading csv file ${dots}`));
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
    token = token.toUpperCase();
    return cumulativeBalances[nearestDate][token];
  } else {
    return cumulativeBalances[nearestDate];
  }
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
