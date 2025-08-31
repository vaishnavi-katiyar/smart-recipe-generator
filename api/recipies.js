import { MongoClient } from "mongodb";

let client;
let db;

// Connect to MongoDB once (Vercel keeps connection warm)
async function connectDB() {
  if (!client) {
    client = new MongoClient(process.env.MONGO_URI);
    await client.connect();
    db = client.db("smartrecipes");
  }
  return db;
}

export default async function handler(req, res) {
  try {
    const db = await connectDB();
    const collection = db.collection("savedRecipes");

    if (req.method === "POST") {
      // Save a recipe
      const recipe = req.body;
      await collection.insertOne(recipe);
      return res.status(201).json({ message: "Recipe saved successfully" });
    }

    if (req.method === "GET") {
      // Fetch all saved recipes
      const recipes = await collection.find().toArray();
      return res.status(200).json(recipes);
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Database error" });
  }
}
