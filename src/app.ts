import express, { Application, Request, Response } from 'express';
const path = require("path");
const app: Application = express();

const PORT: number = 3001;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, '../views'))


app.use('/', (req: Request, res: Response): void => {
    res.render("../views/home.ejs");
});

app.listen(PORT, (): void => {
    console.log('SERVER IS UP ON PORT:', PORT);
});