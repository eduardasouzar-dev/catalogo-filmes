require('dotenv').config();

const express = require('express');
const mysql = require('mysql2');
const axios = require('axios');

const app = express();

const conexao = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    port: process.env.DB_PORT,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// Permite receber dados em JSON
app.use(express.json());

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

    conexao.query('SELECT * FROM filmes', async (erro, resultados) => {

        if (erro) {
            console.log('Erro ao buscar filmes:', erro.message);
            return res.status(500).send('Erro ao buscar filmes');
        }

        try {

            const filmesComPoster = await Promise.all(

                resultados.map(async (filme) => {

                    let tituloBusca = filme.titulo;

                    // O TMDB usa o título original em inglês
                    if (filme.titulo === 'Interestelar') {
                        tituloBusca = 'Interstellar';
                    }

                    const resposta = await axios.get(
                        'https://api.themoviedb.org/3/search/movie',
                        {
                            params: {
                                query: tituloBusca,
                                language: 'pt-BR'
                            },
                            headers: {
                                Authorization: `Bearer ${process.env.TMDB_READ_ACCESS_TOKEN}`,
                                accept: 'application/json'
                            }
                        }
                    );

                    const resultadoTMDB = resposta.data.results.find(
                        resultado => resultado.poster_path
                    );

                    console.log(
                        filme.titulo,
                        '→',
                        resultadoTMDB?.title,
                        '→',
                        resultadoTMDB?.poster_path
                    );

                    return {
                        ...filme,
                        poster: resultadoTMDB?.poster_path
                            ? `https://image.tmdb.org/t/p/w500${resultadoTMDB.poster_path}`
                            : null
                    };
                })
            );

            res.json(filmesComPoster);

        } catch (erro) {

            console.log(
                'Erro no TMDB:',
                erro.response?.data || erro.message
            );

            res.status(500).send('Erro ao buscar dados no TMDB');
        }
    });
});


// Rota para adicionar um novo filme
app.post('/filmes', (req, res) => {

    const {
        titulo,
        diretor,
        genero,
        ano,
        duracao,
        nota
    } = req.body;

    const sql = `
        INSERT INTO filmes
        (titulo, diretor, genero, ano, duracao, nota)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    conexao.query(
        sql,
        [titulo, diretor, genero, ano, duracao, nota],
        (erro, resultado) => {

            if (erro) {
                console.log('Erro ao adicionar filme:', erro.message);
                return res.status(500).json({
                    erro: 'Erro ao adicionar filme'
                });
            }

            res.status(201).json({
                mensagem: 'Filme adicionado com sucesso!',
                id: resultado.insertId
            });
        }
    );
});


// Inicia o servidor
app.listen(3000, () => {
    console.log('Servidor rodando em http://localhost:3000');
});