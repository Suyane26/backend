const express = require('express');
const supabaseClient = require('@supabase/supabase-js');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

const corsOptions = {
   origin: '*', 
   credentials: true,
   optionSuccessStatus: 200,
};

app.use(cors(corsOptions));

// Usando morgan para logs
app.use(morgan('combined'));

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

// AJUSTE 1: Removido o '/rest/v1/' do final da URL para o cliente funcionar perfeitamente
const supabase = supabaseClient.createClient(
    'https://buiyeqsyxalrhchylheo.supabase.co', 
    'sb_publishable_SCHgxXSZBqajmLYtM_zC8w_f4S3vNfc'
);

// 1. Listar todos os produtos
app.get('/products', async (req, res) => {
    const {data, error} = await supabase
        .from('products')
        .select();
    
    if (error) {
        return res.status(400).send(error);
    }
    res.send(data);
    console.log(`Lists all products: ${JSON.stringify(data)}`);
});

// 2. Consultar 1 produto individualmente pelo ID (Melhoria Obrigatória)
app.get('/products/:id', async (req, res) => {
    console.log("Buscando ID = " + req.params.id);
    const {data, error} = await supabase
        .from('products')
        .select()
        .eq('id', req.params.id)
        .single(); // AJUSTE 2: Retorna o objeto direto {} em vez de uma lista [{}]

    if (error) {
        return res.status(404).send({ message: "Produto não encontrado", error });
    }
    res.send(data);
    console.log("Retorno ID: " + JSON.stringify(data));
});

// 3. Cadastrar produto (Incluindo descrição - Melhoria Obrigatória)
app.post('/products', async (req, res) => {
    const {error} = await supabase
       .from('products')
        .insert([{
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
        }]);
        
    if (error) {
        return res.status(400).send(error);
    }
    res.send("created!!");
    console.log("Criado com sucesso: " + req.body.name);
});

// 4. Alterar um produto (Melhoria Obrigatória)
app.put('/products/:id', async (req, res) => {
    const {error} = await supabase
        .from('products')
        .update({
            name: req.body.name,
            description: req.body.description,
            price: req.body.price
        })
        .eq('id', req.params.id);

    if (error) {
        return res.status(400).send(error);
    }
    res.send("updated!!");
    console.log("Atualizado ID: " + req.params.id);
});

// 5. Deletar produto
app.delete('/products/:id', async (req, res) => {
    console.log("Deletando ID: " + req.params.id);
    const {error} = await supabase
        .from('products')
        .delete()
        .eq('id', req.params.id);

    if (error) {
        return res.status(400).send(error);
    }
    res.send("deleted!!");
});

app.get('/', (req, res) => {
    res.send("Hello I am working my friend Supabase <3");
});

// AJUSTE 3: Tratamento limpo para rotas inexistentes (Evita quebrar chamadas do Front)
app.use((req, res) => {
    res.status(404).send({ message: "Rota não encontrada no servidor Back-End." });
});

app.listen(3000, () => {
    console.log(`> Ready on http://localhost:3000`);
});