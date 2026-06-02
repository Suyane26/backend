const express = require('express');
const supabaseClient = require('@supabase/supabase-js');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

// Configuração do CORS
app.use(cors({
   origin: '*', 
   credentials: true,
   optionSuccessStatus: 200,
}));

app.use(morgan('combined'));

// Middlewares para leitura dos dados enviados pelo Front-End
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.json());

// Conexão com o Supabase
const supabase = supabaseClient.createClient(
    'https://buiyeqsyxalrhchylheo.supabase.co', 
    'sb_publishable_SCHgxXSZBqajmLYtM_zC8w_f4S3vNfc'
);

// 1. LISTAR TODOS (GET)
app.get('/products', async (req, res) => {
    // Alinhado com a tabela 'Backend' do seu banco
    const { data, error } = await supabase.from('Backend').select();
    if (error) return res.status(400).json(error);
    
    // Mapeia a coluna 'Product' do banco de volta para 'name' para o Front-End entender
    const mappedData = data.map(item => ({
        id: item.id,
        name: item.Product, // Converte 'Product' para 'name'
        price: item.price,
        description: item.description
    }));
    
    res.json(mappedData);
});

// 2. BUSCAR POR ID (GET /:id)
app.get('/products/:id', async (req, res) => {
    const { data, error } = await supabase
        .from('Backend')
        .select()
        .eq('id', req.params.id)
        .single();

    if (error) return res.status(404).json({ error: "Produto não encontrado" });
    
    const mappedProduct = {
        id: data.id,
        name: data.Product,
        price: data.price,
        description: data.description
    };
    
    res.json(mappedProduct);
});

// 3. CADASTRAR (POST)
app.post('/products', async (req, res) => {
    const { data, error } = await supabase
        .from('Backend')
        .insert([{
            Product: req.body.name, // Envia 'name' do front para a coluna 'Product'
            description: req.body.description,
            price: req.body.price ? parseFloat(req.body.price) : 0,
        }])
        .select();
        
    if (error) return res.status(400).json(error);
    res.status(201).send("created!!");
});

// 4. ATUALIZAR (PUT)
app.put('/products/:id', async (req, res) => {
    const { data, error } = await supabase
        .from('Backend')
        .update({
            Product: req.body.name,
            description: req.body.description,
            price: req.body.price ? parseFloat(req.body.price) : 0
        })
        .eq('id', req.params.id);

    if (error) return res.status(400).json(error);
    res.send("updated!!");
});

// 5. DELETAR (DELETE)
app.delete('/products/:id', async (req, res) => {
    const { data, error } = await supabase
        .from('Backend')
        .delete()
        .eq('id', req.params.id);

    if (error) return res.status(400).json(error);
    res.send("deleted!!");
});

// Tratamento de rotas inexistentes
app.use((req, res) => {
    res.status(404).json({ error: "Rota não encontrada no servidor." });
});

app.listen(3000, () => {
    console.log(`> Servidor ativo em http://localhost:3000`);
});