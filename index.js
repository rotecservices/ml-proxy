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
      const container = document.querySelector('.ui-recommendations-list.ui-recommendations-list__container--single');
      const product = container?.querySelector('.ui-recommendations-card');

      return {
        name: product?.querySelector('.ui-recommendations-card__title')?.innerText || 'Sem nome',
        price: product?.querySelector('.andes-money-amount__fraction')?.innerText || 'Sem preço',
        oldPrice: product?.querySelector('.andes-money-amount__discount')?.innerText || 'Sem preço anterior',
        discount: product?.querySelector('.ui-recommendations-card__discount')?.innerText?.replace(/\D/g, '') || '0',
        image: product?.querySelector('img')?.src || '',
        description: product?.querySelector('.ui-recommendations-card__subtitle')?.innerText || '',
        rating: '4.5' // Valor fixo ou ajustável se houver avaliações visíveis
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
