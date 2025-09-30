const express = require('express');
const puppeteer = require('puppeteer');
const app = express();

app.get('/produto', async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).send('URL ausente');

  try {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });

    await page.waitForSelector('.ui-recommendations-carousel-wrapper-ref img');

    const imageUrl = await page.evaluate(() => {
      const img = document.querySelector('.ui-recommendations-carousel-wrapper-ref img');
      return img ? img.src : null;
    });

    await browser.close();

    if (!imageUrl) return res.send('<h2>Imagem não encontrada</h2>');

    res.send(`
      <html>
        <head><style>body{margin:0;padding:0;text-align:center;overflow:hidden;}</style></head>
        <body>
          <img src="${imageUrl}" style="max-width:100%;height:auto;" />
        </body>
      </html>
    `);
  } catch (err) {
    res.status(500).send('Erro ao acessar a página');
  }
});

app.listen(3000, () => console.log('Servidor rodando'));