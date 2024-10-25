import express from "express"
import { dirname } from "path";
import { fileURLToPath } from "url";
import bodyParser from "body-parser";
import pg from "pg";
const _dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
const port = 4000

const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "postgres",
    password: "3635Lapec",
    port: 5432,
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }))

app.post("/register", async (req, res) => {

    var firstName = req.body.firstName;
    var lastName = req.body.lastName;
    var userName = req.body.userName;
    var password = req.body.password;


    const result = await db.query("INSERT INTO public.users (id, firstname, lastname, username, password, reg_date) VALUES ($1, $2, $3, $4, $5, $6)", [2, '2', '3', '4', '5', '2017-08-24 17:45:42']);

    console.log(result);
    

})

app.get('/', (req, res) => {
    res.sendFile(_dirname + '/register.html');
});

app.listen(port, () => {
    console.log(`Server running on port ${port}.`);
});