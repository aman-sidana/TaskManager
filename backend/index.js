const mongoose = require("mongoose")
const express = require("express")
const cors = require("cors")

const app = express()
const port = 6100
const url = "mongodb://localhost:27017/CRUDoperations"

app.use(express.json())
app.use(cors())


mongoose
  .connect(url)
  .then(() => {
    console.log(">>>> Database Connected");
  })
  .catch((err) => {
    console.log(err);
  });

const userRouter = require("./route/userRoute")
app.use('/taskuser', userRouter)

const taskRouter = require("./route/taskRoute");
app.use("/task", taskRouter);

app.listen(port, () => {
  console.log(`>>>> Server is Running on port : ${port}`)
})