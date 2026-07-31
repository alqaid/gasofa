import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // API Proxy Route for Gasolineras
  app.get("/api/gasolineras", async (req, res) => {
    const { municipio, ideess } = req.query;

    try {
      let targetUrl = "https://www.alcaide.info/gasofa/servicio.php";
      const params = new URLSearchParams();

      if (municipio) {
        params.append("municipio", String(municipio));
      } else if (ideess) {
        params.append("ideess", String(ideess));
      } else {
        return res.status(400).json({ error: "Debe proporcionar el parámetro 'municipio' o 'ideess'" });
      }

      const fullUrl = `${targetUrl}?${params.toString()}`;
      console.log(`Proxying request to: ${fullUrl}`);

      const response = await fetch(fullUrl);
      if (!response.ok) {
        throw new Error(`Error en el servicio externo: ${response.status} ${response.statusText}`);
      }

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        console.error("Error parsing JSON from remote service:", parseError, "Response was:", text.substring(0, 500));
        throw new Error("El servicio externo no devolvió un JSON válido.");
      }

      return res.json(data);
    } catch (error: any) {
      console.error("Proxy error:", error);
      return res.status(500).json({
        error: "Error al obtener datos de las gasolineras",
        message: error.message || "Error desconocido"
      });
    }
  });

  // Serve static files / Vite middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "127.0.0.1", () => {
    console.log(`Server running on http://127.0.0.1:${PORT}`);
  });
}

startServer();
