const express = require('express');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const app = express();

// Configurações do Express
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const results = [];

// Função de Normalização
const normalizeValue = (value) => value.toLowerCase().trim();

// Leitura e validação dos dados do CSV
fs.createReadStream(path.join(__dirname, 'data', 'ias.csv'))
  .pipe(csv())
  .on('data', (data) => {
    if (data['AI Tool Name'] && data.Description && data['Free/Paid/Other'] && data['Tool Link'] && data['Major Category']) {
      results.push(data);
    }
  })
  .on('end', () => {
    console.log('CSV file successfully processed');
  });

const categoryOptions = {
  'Texto': 'text',
  'Áudio': 'audio',
  'Imagem': 'image',
  'Código': 'code',
  '3D': '3d',
  'Negócios': 'business',
  'Vídeo': 'video'
};

// Rota principal
app.get('/', (req, res) => {
  const search = req.query.search ? normalizeValue(req.query.search) : '';
  const filterCategory = req.query.filterCategory ? normalizeValue(req.query.filterCategory) : '';

  const filteredIas = results.filter(ia => {
    const iaName = normalizeValue(ia['AI Tool Name']);
    const iaCategory = normalizeValue(ia['Major Category']);

    // Verificar se a busca corresponde
    const matchesSearch = iaName.includes(search) || iaCategory.includes(search);

    // Verificar se o filtro de categoria corresponde
    const matchesCategory = filterCategory === '' || iaCategory === categoryOptions[filterCategory] || iaCategory === filterCategory;

    return matchesSearch && matchesCategory;
  });

  // Criar uma lista de categorias únicas para o filtro
  const categories = [...new Set(results.map(ia => ia['Major Category']))];

  res.render('index', { 
    ias: filteredIas,
    categories,
    search,
    filterCategory
  });
});

// Inicializar o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor em execução na porta ${PORT}`);
  console.log(`Acesse em http://localhost:${PORT}`);
});
