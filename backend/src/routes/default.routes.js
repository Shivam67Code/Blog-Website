const defaultRoute = (req, res) => {
  const htmlContent = `<!DOCTYPE html>
    <html><head><title>YouTube Backend API</title>
    <style>body{font-family:Arial;margin:0;display:flex;justify-content:center;align-items:center;min-height:100vh;background:#f0f0f0}.card{background:linear-gradient(135deg,#27ae60,#2ecc71);color:white;padding:2rem;border-radius:15px;text-align:center;box-shadow:0 10px 30px rgba(0,0,0,0.2)}</style>
    </head><body>
    <div class="card">
        <h1>Blog-Website Backend API</h1>
        <p>🐧Server Running Successfully</p>
        <p><strong>Author:</strong> Shivam Karn</p>
    </div></body></html>`
  res.status(200).send(htmlContent)
};

// this route just for fun testing 
const healthRoute = (req, res) => {
  const htmlContent = `
    <!DOCTYPE html>
    <html><head><title>Health Check</title>
    <style>body{font-family:Arial;margin:0;display:flex;justify-content:center;align-items:center;min-height:100vh;background:#f8f9fa}.card{background:linear-gradient(135deg,#3498db,#2980b9);color:white;padding:2rem;border-radius:15px;text-align:center;box-shadow:0 10px 30px rgba(0,0,0,0.2)}</style>
    </head><body>
    <div class="card">
        <h1>💚 Health Check</h1>
        <p>All Systems Online</p>
        <p><a href="/" style="color:#ffffff">← Back Home</a></p>
    </div></body></html>`;
  res.status(200).send(htmlContent)
};

export { defaultRoute, healthRoute }
export default defaultRoute;