
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://127.0.0.1:27017/focusED')
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

const UserSchema = new mongoose.Schema({
  username: String,
  password: String,
  fp: { type: Number, default: 0 },
  chain: { type: Number, default: 0 },
  subjects: { type: Object, default: {} }
});

const User = mongoose.model("User", UserSchema);

const SECRET = "FocusEDSecretKey";

app.post("/api/register", async (req, res) => {
  const { username, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  await User.create({ username, password: hashed });
  res.send({ message: "Registered" });
});

app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.status(400).send({ error: "User not found" });
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(400).send({ error: "Wrong password" });
  const token = jwt.sign({ id: user._id }, SECRET);
  res.send({ token });
});

function auth(req, res, next) {
  try {
    const decoded = jwt.verify(req.headers.authorization, SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).send({ error: "Unauthorized" });
  }
}

app.post("/api/start-session", auth, (req, res) => {
  res.send({ message: "Session started" });
});

app.post("/api/complete-session", auth, async (req, res) => {
  const { subject, durationMinutes } = req.body;
  const user = await User.findById(req.user.id);
  user.fp += durationMinutes;
  user.chain += durationMinutes;
  user.subjects[subject] = (user.subjects[subject] || 0) + durationMinutes;
  await user.save();
  res.send({ fp: user.fp, chain: user.chain });
});

app.get("/api/leaderboard", async (req, res) => {
  const top = await User.find().sort({ fp: -1 }).limit(10);
  res.send(top);
});

app.listen(5000, () => console.log("Backend running on 5000"));
