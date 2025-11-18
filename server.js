require("dotenv").config();
const express = require("express");
const { v4: uuidv4 } = require("uuid");
const admin = require("./firebase");
const bcrypt = require("bcrypt");

const db = admin.firestore();
const app = express();
const PORT = process.env.PORT || 3008;
app.use(express.json());


app.post("/api/admin", async (req, res) => {
  const uid = uuidv4();
  const { fullname, username, password, role } = req.body;

  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    await db.collection("user").doc(uid).set({
      uid,
      fullname,
      username,
      password: hashedPassword,
      role,
    });

    res.status(201).json({ message: "User created", uid });
  } catch (err) {
    console.error("User creation error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const snapshot = await db
      .collection("user")
      .where("username", "==", username)
      .get();
    if (snapshot.empty)
      return res.status(401).json({ error: "Invalid credentials" });

    const userData = snapshot.docs[0].data();

    const isMatch = await bcrypt.compare(password, userData.password);

    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    res.status(200).json({ message: "Login successful", userData });
  } catch (err) {
    res.status(500).json({ error: err.mssage });
  }
});
// Create Soil Details
app.post("/api/soil/details", async (req, res) => {
  const id = uuidv4();
  const { name, soilType, contact } = req.body;

  try {
    await db.collection("soilDetails").doc(id).set({
      id,
      name,
      soilType,
      contact,
    });
    res.status(201).json({ message: "Detail created", id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create Distributer Details
app.post("/api/distributer/details", async (req, res) => {
  const id = uuidv4();
  const { name, location, email, seed, soilType } = req.body;

  try {
    await db.collection("distributerDetails").doc(id).set({
      id,
      name,
      location,
      email,
      seed,
      soilType,
    });
    res.status(201).json({ message: "Distributer created", id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Soil Details
app.get("/api/soil/details", async (req, res) => {
  try {
    const snapshot = await db.collection("soilDetails").get();
    const soil = snapshot.docs.map((doc) => doc.data());
    res.status(200).json(soil);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Distributer Details
app.get("/api/distributer/details", async (req, res) => {
  try {
    const snapshot = await db.collection("distributerDetails").get();
    const distributer = snapshot.docs.map((doc) => doc.data());
    res.status(200).json(distributer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
