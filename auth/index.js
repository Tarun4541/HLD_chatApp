import express from "express";
import dotenv from "dotenv";
import authRouter from "./routes/auth.route.js";
import usersRouter from "./routes/user.route.js";
import connectToMongoDB from "./db/connectToMongoDB.js";
import cors from "cors";
import cookieParser from "cookie-parser";


dotenv.config();
const port = process.env.PORT || 5000;

const app = express();
app.use(express.json());
// Add cookie-parser middleware
app.use(cookieParser());

app.use(cors({
 credentials: true,
 origin: [`${process.env.HOST}:3000`, `${process.env.HOST}:3001`]
}));

app.use('/auth', authRouter);
app.use('/users', usersRouter);

// Define a route
app.get('/', (req, res) => {
  res.send('Congratulations HHLD Folks!');
});

// Start the server
app.listen(port, () => {
    connectToMongoDB();
    console.log(`Server is listening at http://localhost:${port}`);
});