import express from "express";

import accountsController from "../controllers/accountsController.js";

const app = express();

app.put("/accounts/deposit", accountsController.deposit);

app.put("/accounts/withdrawal", accountsController.withdrawal);

app.get("/accounts/balance", accountsController.balance);

app.delete("/accounts", accountsController.remove);

app.get("/accounts/average-balance", accountsController.averageBalance);

app.get("/accounts/top-short-balances", accountsController.shortBalances);

app.get("/accounts/top-long-balances", accountsController.longBalances);

app.put("/accounts/do-transfer", accountsController.transfer);

app.get("/accounts/get-private-accounts", accountsController.getPrivateAccounts);

export { app as accountsRouter };
