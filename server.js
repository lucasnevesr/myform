import express from "express"
import { dirname } from "path";
import { fileURLToPath } from "url";
import bodyParser from "body-parser";
import pg from "pg";
import bcrypt from "bcrypt";
import session from "express-session";
import passport from "passport";
import { Strategy } from "passport-local";



const __dirname = dirname(fileURLToPath(import.meta.url));



const app = express();
const port = 4000;
const saltRounds = 10;



app.use(session({
    secret: "TOPSECRETWORD",
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 1000 * 60 * 60,
    }
}));



app.use(passport.initialize())
app.use(passport.session())



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

    res.sendFile(__dirname + '/login.html');

});


app.get("/login", (req, res) => {

    res.sendFile(__dirname + "/login.html");

});



app.get("/register", (req, res) => {

    res.sendFile(__dirname + "/register.html");

});



app.get("/dashboard", (req, res) => {

    if (req.isAuthenticated()) {
        //futuramente mandar para página do movieapp
        res.send(`Hello ${req.user.username}`)
    } else {
        //futuramente ver para onde do movieapp vai ser mandado
        res.sendFile(__dirname + "/failLog.html")
    }

})



app.post("/dashboard", passport.authenticate("local", {

    successRedirect: "/dashboard",
    failureRedirect: "/login"

}));



app.post("/register", async (req, res) => {

    var firstName = req.body.firstName;
    var lastName = req.body.lastName;
    var username = req.body.username;
    var password = req.body.password;


    const query = "SELECT * FROM public.users WHERE username = $1 AND password = $2";
    const values = [username, password];

    try {

        const { rows } = await db.query(query, values);

        if (rows.length > 0) {

            res.sendFile(__dirname + '/failReg.html');
        } else {
            bcrypt.hash(password, saltRounds, async (err, hash) => {
                if (err) {
                    console.log("Error hashing password:", err);

                } else {
                    const result = await db.query("INSERT INTO public.users (firstname, lastname, username, password, reg_date) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP) RETURNING *", [firstName, lastName, username, hash]);
                    const user = result.rows[0]
                    
                    req.login(user, (err) => {
                        console.log(err)
                        res.redirect("/dashboard");

                    })
                }
            })

        }

    } catch (error) {

        console.log(error);

    }

});



passport.use(new Strategy(async function verify(username, password, cb) {
    try {
        const query = "SELECT * FROM public.users WHERE username = $1"
        const values = [username]

        const { rows } = await db.query(query, values)


        if (rows.length > 0) {
            const user = rows[0]
            const storedHashedPassword = user.password;

            bcrypt.compare(password, storedHashedPassword, (err, result) => {
                if (err) {

                    return cb(err)
                } else {
                    if (result) {
                        return cb(null, user)
                    } else {
                        return cb(null, false)
                    }
                }
            })

        } else { return cb("User not found") }


    } catch (err) {

        return cb(err)
    }
}))



passport.serializeUser((user, cb) => {
    cb(null, user);
})



passport.deserializeUser((user, cb) => {
    cb(null, user);
})



app.listen(port, () => {
    console.log(`Server running on port ${port}.`);
});