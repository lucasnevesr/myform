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

app.get('/', (req, res) => {
    res.sendFile(_dirname + '/register.html');
});
// dar opção na página register que é a home para fazer o login caso já tenha conta, ou o inverso é melhor?
// colocar os cookies

app.get("/login", (req, res)=>{
    res.sendFile(_dirname + "/login.html");
});

app.post("/dashboard", async (req, res)=>{
    var userName = req.body.userName;
    var password = req.body.password; 

    const query = "SELECT * FROM public.users WHERE username = $1 AND password = $2"
    const values = [userName, password]
    try {

        const { rows } = await db.query(query, values)

        if (rows.length === 0) {
            res.sendFile(__dirname + "/failLog.html")
        } else {
            res.send( `Hello ${userName}`)
        }
        
    } catch (error) {
        
    }
});

app.post("/register", async (req, res) => {

    var firstName = req.body.firstName;
    var lastName = req.body.lastName;
    var userName = req.body.userName;
    var password = req.body.password;


    const query = "SELECT * FROM public.users WHERE username = $1 AND password = $2";
    const values = [userName, password];
    try {

        const { rows } = await db.query(query, values);
        
        
        if (rows.length > 0) {

            res.sendFile(_dirname + '/failReg.html');
        } else {
            // colocar hashing no password******************************

            const result = await db.query("INSERT INTO public.users (firstname, lastname, username, password, reg_date) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)", [firstName, lastName, userName, password]);
            
        }
            res.sendFile(_dirname + '/login.html');
            
    } catch (error) {

        console.log(error);

    }



});


app.listen(port, () => {
    console.log(`Server running on port ${port}.`);
});