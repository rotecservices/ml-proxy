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
      if (!container) return { error: 'Container não encontrado' };

      return {
        name: container.querySelector('h2')?.innerText || 'Sem nome',
        price: container.querySelector('.price-tag-fraction')?.innerText || 'Sem preço',
        oldPrice: container.querySelector('.price-tag-original')?.innerText || 'Sem preço anterior',
        discount: container.querySelector('.price-tag-discount')?.innerText?.replace(/\D/g, '') || '0',
        image: container.querySelector('img')?.src || '',
        description: container.querySelector('[itemprop="description"]')?.innerText || '',
        rating: '4.5' // Pode ser ajustado se houver avaliação visível
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
