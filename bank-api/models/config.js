import mongoose from "mongoose";

import Account from "./account.js";

const db = {};

db.url = process.env.MONGO_URL;
db.mongoose = mongoose;
db.account = Account(mongoose);

export { db };
