
async function imageGen(req, res) {
    const { query } = req.query;
    const apiKey = process.env.UNSPLASH_ACCESS_KEY;
  
    if (!query) {
      return res.status(400).json({ error: "Query parameter is required" });
    }

    if (!apiKey) {
        return res.status(500).json({ error: "API key is missing" });
      }
  
    try {
      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&client_id=${apiKey}&per_page=1`
      );
      const data = await response.json();
  
      if (!data.results.length) {
        return res.status(404).json({ error: "No images found" });
      }
  
      return { imageUrl: data.results[0].urls.raw + "&fm=jpg&fit=crop&w=1080&q=80&fit=max" };
    } catch (error) {
      console.error("Error fetching image:", error);
      res.status(500).json({ error: "Failed to fetch image" });
    }
  }

module.exports = { imageGen };
