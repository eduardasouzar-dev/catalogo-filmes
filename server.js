const express = require('express');

const app = express();
const mysql = require('mysql2');

const conexao = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    port: 3306,
    password: 'oliciria@10',
    database: 'projeto_filmes'
});

app.use(express.static('.'));

// Conexão com o MySQL
conexao.connect((erro) => {
    if (erro) {
        console.log('Erro ao conectar com o MySQL:', erro.message);
        return;
    }

    console.log('MySQL conectado com sucesso!');
});

// Rota para buscar os filmes
app.get('/filmes', (req, res) => {
    conexao.query('SELECT * FROM filmes', (erro, resultados) => {
        if (erro) {
            console.log('Erro ao buscar filmes:', erro.message);
            return res.status(500).send('Erro ao buscar filmes');
        }

        res.json(resultados);
    });
});

// Inicia o servidor
app.listen(3000, () => {
    console.log('Servidor rodando em http://localhost:3000');
});