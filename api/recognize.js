// Vercel Serverless Function → handles HuggingFace API securely

export default async function handler(req, res) {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }
  
    try {
      const HF_API_URL = "https://api-inference.huggingface.co/models/nlpconnect/vit-gpt2-image-captioning";
      const HF_API_KEY = process.env.HF_API_KEY; // stored in Vercel Environment Variables
  
      const response = await fetch(HF_API_URL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${HF_API_KEY}`,
          "Content-Type": "application/octet-stream"
        },
        body: req.body
      });
  
      const result = await response.json();
      return res.status(200).json(result);
  
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Failed to process image" });
    }
  }
  