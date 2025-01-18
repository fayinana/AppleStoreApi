import mongoose from "mongoose";
import app from "./app.js";

let DB;
if (process.env.NODE_ENV === "development") {
  DB = process.env.LOCAL_DB;
} else {
  DB = process.env.DATABASE.replace(
    "<PASSWORD>",
    process.env.DATABASE_PASSWORD
  );
}
mongoose.connect(DB).then((db) => {
  console.log(`db connected successfully ${db.connection.name}`);
});

const port = 3700 || process.env.PORT;
app.listen(port, () => {
  console.log(`app running on port ${port}`);
});
