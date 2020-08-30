import { db } from "../models/config.js";

const Account = db.account;

//Make deposit
const deposit = async (req, res) => {
  const { agency, number, amount } = req.query;

  try {
    let { id, balance } = await Account.findOne({
      agencia: agency,
      conta: number,
    });

    if (!id) return res.status(400).send("Bank account not found.");

    balance += Number(amount);

    const result = await Account.findByIdAndUpdate(
      { _id: id },
      { balance: balance },
      {
        new: true,
      }
    );

    return res.status(200).send("Balance: " + result.balance);
  } catch (error) {
    return res.status(400).send("Error on deposit " + error.message);
  }
};

//Make cash withdrawal
const withdrawal = async (req, res) => {
  const { agency, number, amount } = req.query;

  try {
    let { id, balance } = await Account.findOne({
      agencia: agency,
      conta: number,
    });

    if (!id) return res.status(400).send("Bank account not found.");

    balance -= Number(amount);
    balance -= 1;

    const result = await Account.findOneAndUpdate(
      { _id: id },
      { balance: balance },
      {
        new: true,
        runValidators: true,
      }
    );

    return res.status(200).send("Balance: " + result.balance);
  } catch (error) {
    return res.status(400).send("Error on cash withdrawal " + error.message);
  }
};

//Get current balance
const balance = async (req, res) => {
  const { agency, number } = req.query;

  try {
    let { id, balance } = await Account.findOne({
      agencia: agency,
      conta: number,
    });

    if (!id) return res.status(400).send("Bank account not found.");

    return res.status(200).send("Account balance: " + balance);
  } catch (error) {
    return res.status(400).send("Error getting balance " + error.message);
  }
};

const remove = async (req, res) => {
  const { agency, number } = req.query;

  try {
    let { id } = await Account.findOne({
      agencia: agency,
      conta: number,
    });

    if (!id) return res.status(400).send("Bank account not found.");

    await Account.findByIdAndRemove({ _id: id });

    const allAcounts = await Account.find({
      agencia : agency,
    });

    return res.status(200).send("Total banking accounts: " + allAcounts.length);
  } catch (error) {
    return res.status(400).send("Error on excluding " + error.message);
  }
};

const averageBalance = async (req, res) => {
  const { agency } = req.query;

  try {
    const agencyAccounts = await Account.find({
      agencia: agency,
    });

    console.log(`Found: ${agencyAccounts.length}`)

    if (!agencyAccounts || agencyAccounts.length === 0) return res.status(400).send("Agency not found");

    const total = agencyAccounts
      .map((acc) => acc.balance)
      .reduce((acc, curr) => {
        return acc + curr;
      });

    const average = total / agencyAccounts.length;

    return res.status(200).send("Average balance on agency: " + average);
  } catch (error) {
    return res.status(400).send("Error on average balance " + error.message);
  }
};

const shortBalances = async (req, res) => {
  const { top } = req.query;

  try {
    const agencyAccounts = await Account.find();

    const orderedAsc = agencyAccounts
      .sort((a, b) => a.balance - b.balance)
      .slice(0, Number(top));

    return res.status(200).send(orderedAsc);
  } catch (error) {
    return res.status(400).send("Error on top short balances " + error.message);
  }
};

const longBalances = async (req, res) => {
  const { top } = req.query;

  try {
    const agencyAccounts = await Account.find();

    const orderedDesc = agencyAccounts
      .sort((a, b) => b.balance - a.balance)
      .slice(0, Number(top));

    return res.status(200).send(orderedDesc);
  } catch (error) {
    return res.status(400).send("Error on top long balances " + error.message);
  }
};

//Make transfer
const transfer = async (req, res) => {
  const { origin, destiny, amount } = req.query;

  try {
    const originAccount = await Account.findOne({
      conta: origin,
    });

    const destinyAccount = await Account.findOne({
      conta: destiny,
    });

    if (!originAccount)
      return res.status(400).send("Bank account not found: " + origin);
    if (!destinyAccount)
      return res.status(400).send("Bank account not found: " + destiny);

    if (originAccount.agencia != destinyAccount.agencia)
      originAccount.balance -= 8;

    originAccount.balance -= Number(amount);
    destinyAccount.balance += Number(amount);

    await Account.findOneAndUpdate(
      { _id: originAccount._id },
      { balance: originAccount.balance },
      {
        new: true,
        runValidators: true,
      }
    );

    await Account.findOneAndUpdate(
      { _id: destinyAccount._id },
      { balance: destinyAccount.balance },
      {
        new: true,
        runValidators: true,
      }
    );

    return res.status(200).send("Balance: " + originAccount.balance);
  } catch (error) {
    return res.status(400).send("Error on transfer " + error.message);
  }
};

//Get all private accounts
const getPrivateAccounts = async (req, res) => {
  try {
    const groupedAccounts = await Account
    .aggregate(
      [
        {$sort:{
          "balance": -1
        }},
        {$group:{
          "_id": "$agencia", 
          data: {$first:"$$ROOT"}
        }},
        {"$project" : {
          "idAccount" : "$data._id",
          "name" : "$data.name",
          "agency" : "$data.agencia",
          "number" : "$data.conta",
          "balance" : "$data.balance"
          }}
      ]
    );

    await Account.updateMany(
      {_id: {$in: groupedAccounts.map(ac=>ac.idAccount)}},
      {agencia: 99}
    );


    return res.status(200).send(groupedAccounts);
  } catch (error) {
    return res.status(400).send("Error: " + error.message);
  }
};



export default {
  deposit,
  withdrawal,
  balance,
  remove,
  averageBalance,
  longBalances,
  shortBalances,
  transfer,
  getPrivateAccounts
};
