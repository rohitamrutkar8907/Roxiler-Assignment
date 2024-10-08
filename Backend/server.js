const express = require("express");
const cors = require("cors");;
const config = require("./config");

const app = express();
app.use(cors());

app.use((request, response, next) => {
      next();
  });
  
const productRouter = require("./routes/product_transaction");
app.use("/product_transaction", productRouter);

app.listen(config.serverport, () => {
    console.log(`server started on port ${config.serverport}`);
  });