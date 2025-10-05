const express = require('express');
const puppeteer = require('puppeteer');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Servidor proxy está funcionando!');
});

app.get('/scrape', async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).send({ error: 'URL ausente' });

  try {
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded' });

    const data = await page.evaluate(() => {
      return {
        name: document.querySelector('h1')?.innerText || 'Sem nome',
        price: document.querySelector('.price-tag-fraction')?.innerText || 'Sem preço',
        image: document.querySelector('img')?.src || '',
        description: document.querySelector('[itemprop="description"]')?.innerText || '',
        rating: '4.5',
        oldPrice: 'R$ 999,00',
        discount: '20'
      };
    });

    await browser.close();
    res.json(data);
  } catch (error) {
    console.error('Erro no scraping:', error);
    res.status(500).send({ error: 'Erro ao processar a página' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
