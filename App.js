
import React, { useState } from "react";
import axios from "axios";
const API = "http://localhost:5000/api";

function App() {
  const [token, setToken] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [subject, setSubject] = useState("Math");
  const [duration, setDuration] = useState(25);
  const [fp, setFP] = useState(0);
  const [chain, setChain] = useState(0);

  const register = async () => {
    await axios.post(API + "/register", { username, password });
    alert("Registered!");
  };

  const login = async () => {
    const res = await axios.post(API + "/login", { username, password });
    setToken(res.data.token);
  };

  const startSession = async () => {
    await axios.post(API + "/start-session", {}, { headers: { Authorization: token } });
    setTimeout(completeSession, duration * 1000);
  };

  const completeSession = async () => {
    const res = await axios.post(API + "/complete-session",
      { subject, durationMinutes: duration },
      { headers: { Authorization: token } }
    );
    setFP(res.data.fp);
    setChain(res.data.chain);
  };

  return (
    <div>
      <h1>Focus ED</h1>
      <input placeholder="username" onChange={e => setUsername(e.target.value)} />
      <input placeholder="password" type="password" onChange={e => setPassword(e.target.value)} />
      <button onClick={register}>Register</button>
      <button onClick={login}>Login</button>

      <h3>Start Focus Session</h3>
      <select onChange={e => setSubject(e.target.value)}>
        <option>Math</option>
        <option>English</option>
        <option>Law</option>
      </select>

      <input type="number" value={duration} onChange={e => setDuration(e.target.value)} />
      <button onClick={startSession}>Start</button>

      <h3>FP: {fp} | Chain: {chain}</h3>
    </div>
  );
}

export default App;
