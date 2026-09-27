require('dotenv').config();

const express = require('express');
const mysql = require('mysql2/promise');
const path = require('path');

const app = express();
const PORT = 3000;

// Permite receber dados em JSON
app.use(express.json());

// Serve os arquivos do projeto
app.use(express.static(path.join(__dirname)));

// Conexão com o MySQL
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    port: process.env.DB_PORT,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// Testar conexão com o MySQL
async function testarConexao() {
    try {
        const conexao = await pool.getConnection();

        console.log('MySQL conectado com sucesso');

        conexao.release();

    } catch (erro) {
        console.error(
            'Erro ao conectar com o MySQL:',
            erro.message
        );
    }
}

testarConexao();


// Cadastrar filme
app.post('/filmes', async (req, res) => {

    try {

        const {
            titulo,
            diretor,
            genero,
            ano,
            duracao
        } = req.body;

        if (!titulo || !diretor || !genero || !ano || !duracao) {

            return res.status(400).json({
                erro: 'Preencha todos os campos.'
            });
        }

        // Verificar se o token do TMDB está sendo carregado
        console.log(
            'Token encontrado:',
            process.env.TMDB_READ_ACCESS_TOKEN ? 'SIM' : 'NÃO'
        );

        // Buscar filme no TMDB
        const respostaTMDB = await fetch(
            `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(titulo)}&language=pt-BR`,
            {
                headers: {
                    Authorization: `Bearer ${process.env.TMDB_READ_ACCESS_TOKEN}`,
                    accept: 'application/json'
                }
            }
        );

        const dadosTMDB = await respostaTMDB.json();

        console.log('Resposta do TMDB:', dadosTMDB);

        let poster = null;

        // Verificar se o TMDB encontrou o filme
        if (
            respostaTMDB.ok &&
            dadosTMDB.results &&
            dadosTMDB.results.length > 0
        ) {

            const filmeTMDB = dadosTMDB.results[0];

            console.log(
                'Filme encontrado no TMDB:',
                filmeTMDB.title
            );

            console.log(
                'Poster encontrado:',
                filmeTMDB.poster_path
            );

            if (filmeTMDB.poster_path) {

                poster =
                    `https://image.tmdb.org/t/p/w500${filmeTMDB.poster_path}`;
            }

        } else {

            console.log('Nenhum filme encontrado no TMDB.');
        }

        // Salvar filme no banco
        await pool.execute(
            `INSERT INTO filmes
            (titulo, diretor, genero, ano, duracao, poster)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [
                titulo,
                diretor,
                genero,
                ano,
                duracao,
                poster
            ]
        );

        res.status(201).json({
            mensagem: 'Filme cadastrado com sucesso!'
        });

    } catch (erro) {

        console.error(
            'Erro ao cadastrar filme:',
            erro
        );

        res.status(500).json({
            erro: 'Erro ao cadastrar filme.'
        });
    }
});


// Buscar filmes
app.get('/filmes', async (req, res) => {

    try {

        const [filmes] = await pool.execute(
            'SELECT * FROM filmes ORDER BY id DESC'
        );

        res.json(filmes);

    } catch (erro) {

        console.error(
            'Erro ao buscar filmes:',
            erro
        );

        res.status(500).json({
            erro: 'Erro ao buscar filmes.'
        });
    }
});


// Recuperar pôsteres dos filmes antigos
app.post('/atualizar-posters', async (req, res) => {

    try {

        const [filmes] = await pool.execute(
            `SELECT id, titulo, ano
             FROM filmes
             WHERE poster IS NULL OR poster = ''`
        );

        console.log(
            `Encontrados ${filmes.length} filmes sem pôster.`
        );

        let atualizados = 0;

        for (const filme of filmes) {

            try {

                console.log(
                    `Buscando pôster de: ${filme.titulo}`
                );

                const respostaTMDB = await fetch(
                    `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(filme.titulo)}&year=${filme.ano}&language=pt-BR`,
                    {
                        headers: {
                            Authorization: `Bearer ${process.env.TMDB_READ_ACCESS_TOKEN}`,
                            accept: 'application/json'
                        }
                    }
                );

                const dadosTMDB = await respostaTMDB.json();

                if (
                    respostaTMDB.ok &&
                    dadosTMDB.results &&
                    dadosTMDB.results.length > 0
                ) {

                    const filmeTMDB = dadosTMDB.results[0];

                    if (filmeTMDB.poster_path) {

                        const poster =
                            `https://image.tmdb.org/t/p/w500${filmeTMDB.poster_path}`;

                        await pool.execute(
                            `UPDATE filmes
                             SET poster = ?
                             WHERE id = ?`,
                            [poster, filme.id]
                        );

                        console.log(
                            `Pôster atualizado: ${filme.titulo}`
                        );

                        atualizados++;

                    } else {

                        console.log(
                            `TMDB encontrou ${filme.titulo}, mas não possui pôster.`
                        );
                    }

                } else {

                    console.log(
                        `Filme não encontrado no TMDB: ${filme.titulo}`
                    );
                }

            } catch (erroFilme) {

                console.error(
                    `Erro ao buscar ${filme.titulo}:`,
                    erroFilme.message
                );
            }
        }

        res.json({
            mensagem: 'Atualização dos pôsteres concluída!',
            encontrados: filmes.length,
            atualizados: atualizados
        });

    } catch (erro) {

        console.error(
            'Erro ao atualizar pôsteres:',
            erro
        );

        res.status(500).json({
            erro: 'Erro ao atualizar pôsteres.'
        });
    }
});


// Iniciar servidor
app.listen(PORT, () => {

    console.log(
        `Servidor rodando em http://localhost:${PORT}`
    );
});