var scheduler = require('../scheduler.js');

// total transaction rate = numAccounts * frequency [tx/s]
// test run time = numIterations / frequency [s]
let numAccounts = 5;
let txValue = 1;
let frequency = 10;
let numIterations = 10;

module.exports.prepare = function(seq) {
  seq.push(function(result, cb) {
    result.accountOptions = {
      numRequiredAccounts: numAccounts
    }
    result.accounts.CreateRequired(result, cb);
  });
  seq.push(function(result, cb) {
    result.accounts.UnlockRequired(result, cb);
  });
  seq.push(function(result, cb) {
    result.accounts.GetBalances(result, cb);
  });
  seq.push(function(result, cb) {
    result.accounts.CollectEther(result, cb);
  });
  seq.push(function(result, cb) {
    result.accounts.DistributeEther(result, cb);
  });
}

module.exports.execute = function(seq) {
  seq.push(function(result, cb) {
    scheduler.Repeat(function(repeater) {
      let transactions = result.transactions;
      result.repeater = repeater;
      result.txOptions = {
        transactions: []
      };
      for (let i = 0; i < numAccounts; i++) {
        result.txOptions.transactions.push({
          from: result.accounts.Unlocked[i],
          to: result.accounts.Unlocked[i],
          value: txValue
        });
      }
      transactions.SendBatch(result); // no cb passed to indicate that called from within repeater
    }, numIterations, frequency, function() {
      cb(null, result);
    });
  });
}
