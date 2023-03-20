const yargs = require('yargs');
const { getAllTokenBalance } = require('./getAllToken');
const { getSingleTokenBalance } = require('./getSingleToken');
const { getAllTokenUptoDate } = require('./getAllTokenUptoDate');
const { getSingleTokenUptoDate } = require('./getSingleTokenUptoDate');

yargs.command({
  command: 'token <token>',
  describe: 'log the latest portfolio value for given token in USD ',
  handler: function (argv) {
    console.log(
      `Please wait until we calculate latest portfolio value for token ${argv.token} in USD`
    );
    getSingleTokenBalance(argv.token);
  },
});

yargs.command({
  command: 'date <date>',
  describe:
    'log the portfolio value per token in USD on that date (node main.js balance_date ',
  handler: function (argv) {
    console.log(
      `Please wait until we calculate latest portfolio value until the date ${argv.date} in USD`
    );

    const epochTime = dateToEpoch(argv.date);
    getAllTokenUptoDate(epochTime);
    // 1520107873
    //1679319282
    //1571966329
    //1647772800
  },
});

yargs.command({
  command: 'both <date> <token>',
  describe: 'log the portfolio value of that token in USD on that date',
  handler: function (argv) {
    const epochTime = dateToEpoch(argv.date);
    console.log(`Date entered: ${argv.date}`);
    console.log(`Token entered: ${argv.token}`);
    getSingleTokenUptoDate(epochTime, argv.token);
  },
});

yargs.command({
  command: '*',
  describe: 'Log the latest portfolio value per token in USD',
  handler: function () {
    console.log(
      'Please wait until we calculate latest portfolio value per token in USD '
    );
    getAllTokenBalance();
  },
});

yargs.parse();

function dateToEpoch(dateString) {
  // Convert date string to Date object
  const date = new Date(dateString);

  // Get the Epoch time in milliseconds
  const epochTime = date.getTime();

  // Convert milliseconds to seconds
  // console.log(epochTime);
  const epochSeconds = Math.floor(epochTime / 1000);

  return epochSeconds;
}

//node main.js token BTC
// node main.js date 2022/03/20
// node main.js both 2022/03/20 ETH
//node main.js
