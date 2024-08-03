// webhook-server.js
const express = require('express');
const { exec } = require('child_process');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.post('https://jitsi.navanudi.com/66ad985765c39', (req, res) => {
  console.log('Webhook received:', req.body);
  
  // Trigger the build process
  exec('npm run build', (error, stdout, stderr) => {
    if (error) {
      console.error(`Build error: ${error}`);
      return res.status(500).send('Build failed');
    }
    console.log(`Build output: ${stdout}`);
    console.error(`Build stderr: ${stderr}`);
    res.status(200).send('Build triggered');
  });
});

app.listen(PORT, () => {
  console.log(`Webhook server listening on port ${PORT}`);
});
