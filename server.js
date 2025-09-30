const express = require('express');
const puppeteer = require('puppeteer');
const app = express();

app.get('/', async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).json({ error: 'URL não fornecida' });

  try {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });

    // Aguarda a div principal do produto
    await page.waitForSelector('.poly-card.poly-card--list.poly-card--large');

    const data = await page.evaluate(() => {
      const card = document.querySelector('.poly-card.poly-card--list.poly-card--large');
      if (!card) return {};

      const image = card.querySelector('img')?.src || '';
      const name = card.querySelector('.poly-card__title')?.innerText || '';
      const price = card.querySelector('.andes-money-amount__fraction')?.innerText || '';
      const oldPrice = card.querySelector('.andes-money-amount__previous')?.innerText || '';
      const rating = card.querySelector('.stars-rating__reviews')?.innerText || '';
      const description = card.querySelector('.poly-card__subtitle')?.innerText || '';
      const discount = card.querySelector('.poly-card__discount')?.innerText || '';

      return {
        image,
        name,
        price,
        oldPrice,
        rating,
        description,
        discount
      };
    });

    await browser.close();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao processar a página' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
