import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import bcrypt from "bcrypt";
import passport from "passport";
import { Strategy } from "passport-local";
import GoogleStrategy from "passport-google-oauth2";
import session from "express-session";
import env from "dotenv";
import cors from "cors";
import rateLimit from 'express-rate-limit';

const app = express();

const port = 3000;
const saltRounds = 10;
const CLIENT_URL = 'http://localhost:5173';

env.config();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 1000,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(
  cors({
  origin: CLIENT_URL,
  credentials: true
  })
);

const db = new pg.Client({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});
db.connect();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  message: {message: "Too many login attempts. Try again later."},
  standardHeaders: true,
  legacyHeaders: false,
});

app.post("/register", async (req, res) => {
  const email = req.body.username;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;

  if (!email || !password || !confirmPassword) {
    return res.status(400).json({ message: 'All empty fields must be filled.' });
  } 
  if (password !== confirmPassword){
    return res.status(400).json({ message: 'passwords must be the same' });
  } 
  if (password.length < 6){
    return res.status(400).json({ message: 'password must have at least 6 characters' });
  }

  try {
    const checkResult = await db.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (checkResult.rows.length > 0) {
      res.status(400).json({ message: 'user with this email already exists' });
    } else {
      bcrypt.hash(password, saltRounds, async (err, hash) => {
        if (err) {
          console.error("Error hashing password:", err);
        } else {
          const result = await db.query(
            "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *",
            [email, hash]
          );

          const user = result.rows[0];

          req.login(user, (err) => {
            if (err) {
              return res.status(500).json({ message: 'Login after registration failed' });
            }
            return res.status(201).json({
              message: 'User registered and logged in',
              user: { id: user.id, email: user.email }
            });
          });
        }
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error during registration." });
  }
});

app.post("/login", loginLimiter, (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    req.logIn(user, (err) => {
      if (err) return next(err);
      res.status(200).json({ 
        message: "Logged in successfully",
        user: { id: user.id, email: user.email }
      });
    });
  })(req, res, next);  
});

passport.use(
  "local",
  new Strategy(async function verify(username, password, done) {
    try {
      const result = await db.query("SELECT * FROM users WHERE email = $1 ", [
        username,
      ]);
      if (result.rows.length > 0) {
        const user = result.rows[0];
        const storedHashedPassword = user.password;
        bcrypt.compare(password, storedHashedPassword, (err, valid) => {
          if (err) {
            console.error("Error comparing passwords:", err);
            return done(err);
          } else {
            if (valid) {
              return done(null, user);
            } else {
              return done(null, false);
            }
          }
        });
      } else {
        return done(null, false, { message: "User not found." });
      }
    } catch (err) {
      console.log(err);
      return done(err);
    }
  })
);

passport.use(
  "google",
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/auth/google/notes",
      userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log("Google profile:", profile);
        const result = await db.query("SELECT * FROM users WHERE email = $1", [
          profile.email,
        ]);
        if (result.rows.length === 0) {
          const newUser = await db.query(
            "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *",
            [profile.email, "google"]
          );
          console.log("New user created:", newUser.rows[0]);
          return done(null, newUser.rows[0]);
        } else {
          console.log("Existing user:", result.rows[0]);
          return done(null, result.rows[0]);
        }
      } catch (err) {
        console.error("Error in Google strategy:", err);
        return done(err);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

app.get(
  "/auth/google",
  passport.authenticate("google", { 
    scope: ["profile", "email"] 
  })
);

app.get("/auth/google/notes",
  passport.authenticate("google", { failureRedirect: CLIENT_URL }),
  (req, res) => {
    res.redirect(`${CLIENT_URL}/notebook`);
  }
);

app.get("/api/check-session", (req, res) => {
  if (req.isAuthenticated()) {
      res.status(200).json({ loggedIn: true, user: req.user });
  } else {
      res.status(401).json({ loggedIn: false });
  }
});

app.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ message: "Logout failed" });
    req.session.destroy(() => {
      res.status(200).json({ message: "Logged out" });
    });
  });
});


app.get("/api/shownotes", async (req,res) => {
  try {
    console.log(`req.user.id: ${req.user.id}`);
    const result = await db.query(
      "SELECT noteid, title, content FROM notes WHERE userid = $1",
      [req.user.id]
    );
    const userNotes = result.rows;
    if (userNotes){
      res.status(200).json({ data: userNotes});
    } else {
      return res.status(404).json({ message: "No notes found" });
    }
  } catch (err) {
    console.error("Error while fetching notes:", err);
    return res.status(500).json({ message: "Server error while fetching notes" });
  }
});

app.post("/api/postnote", async (req,res) => {
  const { title, content, userid } = req.body;
  try {
    const result = await db.query(
      "INSERT INTO notes (title, content, userid) VALUES ($1, $2, $3) RETURNING *",
      [title, content, userid]
    );
    if (result.rows.length > 0){
      return res.status(201).json({message: "note added succesfully."});
    } else {
      return res.status(400).json({ message: "Note was not added." });
    }
  } catch (err) {
    console.error("Error while adding note to db:", err);
    return res.status(500).json({ message: "Server error during adding to database" });
  }
});

app.delete("/api/delete", async (req,res) => {
  const  id = req.body.id;
  try {
    const result = await db.query("DELETE FROM notes WHERE noteid = $1", [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Note not found" });
    }
    return res.status(200).json({message: "Note succesfully deleted."});
  } catch (err) {
    console.error("Error while deleting note:", err);
    return res.status(500).json({ message: "Server error during removing from database" });
  }
});

app.patch("/api/edit", async (req,res) => {
  const id = req.body.data.id;
  const title = req.body.data.title;
  const content = req.body.data.content;
  try {
    const result = await db.query(
      "UPDATE notes SET title = $1, content = $2 WHERE noteid = $3 RETURNING *",
      [title, content, id]
    );
    if (result.rows.length > 0){
      return res.status(201).json({message: "note edited succesfully."});
    } else {
      return res.status(400).json({ message: "Note was not edited." });
    }
  } catch (err) {
    console.error("Error while editing note to db:", err);
    return res.status(500).json({ message: "Server error during editing database" });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
