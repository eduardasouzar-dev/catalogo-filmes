const formFilme = document.getElementById('form-filme');
const listaFilmes = document.getElementById('lista-filmes');

const botaoAnterior = document.getElementById('anterior');
const botaoProximo = document.getElementById('proximo');

const campoPesquisa = document.getElementById('pesquisa-filmes');

let filmes = [];
let filmesFiltrados = [];

let paginaAtual = 0;

const filmesPorPagina = 6;


// =================================================
// CADASTRAR UM NOVO FILME
// =================================================

formFilme.addEventListener('submit', async (evento) => {

    evento.preventDefault();

    const filme = {
        titulo: document.getElementById('titulo').value,
        diretor: document.getElementById('diretor').value,
        genero: document.getElementById('genero').value,
        ano: document.getElementById('ano').value,
        duracao: document.getElementById('duracao').value
    };

    try {

        const resposta = await fetch('/filmes', {
            method: 'POST',

            headers: {
                'Content-Type': 'application/json'
            },

            body: JSON.stringify(filme)
        });

        const resultado = await resposta.json();

        if (!resposta.ok) {
            throw new Error(resultado.erro);
        }

        alert(resultado.mensagem);

        formFilme.reset();

        carregarFilmes();

    } catch (erro) {

        console.log(
            'Erro ao adicionar filme:',
            erro
        );

        alert('Erro ao adicionar filme.');
    }
});


// =================================================
// MOSTRAR OS FILMES
// =================================================

function mostrarFilmes() {

    listaFilmes.innerHTML = '';

    const inicio = paginaAtual * filmesPorPagina;

    const fim = inicio + filmesPorPagina;

    const filmesDaPagina =
        filmesFiltrados.slice(inicio, fim);


    if (filmesDaPagina.length === 0) {

        listaFilmes.innerHTML = `
            <div class="nenhum-filme">
                <p>Nenhum filme encontrado.</p>
            </div>
        `;

        atualizarBotoes();

        return;
    }


    filmesDaPagina.forEach(filme => {

        listaFilmes.innerHTML += `
            <article class="filme">

                <img
                    src="${filme.poster}"
                    alt="Pôster de ${filme.titulo}"
                >

                <div class="filme-topo">

                    <h3>
                        ${filme.titulo}
                    </h3>

                </div>

                <p class="diretor">
                    ${filme.diretor}
                </p>

                <p class="genero">
                    ${filme.genero}
                </p>

                <div class="detalhes">

                    <span>
                        ${filme.ano}
                    </span>

                    <span>
                        ${filme.duracao} minutos
                    </span>

                </div>

            </article>
        `;
    });


    atualizarBotoes();
}


// =================================================
// ATUALIZAR AS SETAS
// =================================================

function atualizarBotoes() {

    const totalPaginas =
        Math.ceil(
            filmesFiltrados.length / filmesPorPagina
        );


    botaoAnterior.disabled =
        paginaAtual === 0;


    botaoProximo.disabled =
        paginaAtual >= totalPaginas - 1;


    botaoAnterior.style.visibility =
        paginaAtual === 0
            ? 'hidden'
            : 'visible';


    botaoProximo.style.visibility =
        paginaAtual >= totalPaginas - 1
            ? 'hidden'
            : 'visible';
}


// =================================================
// BOTÃO ANTERIOR
// =================================================

botaoAnterior.addEventListener('click', () => {

    if (paginaAtual > 0) {

        paginaAtual--;

        mostrarFilmes();
    }
});


// =================================================
// BOTÃO PRÓXIMO
// =================================================

botaoProximo.addEventListener('click', () => {

    const totalPaginas =
        Math.ceil(
            filmesFiltrados.length / filmesPorPagina
        );


    if (paginaAtual < totalPaginas - 1) {

        paginaAtual++;

        mostrarFilmes();
    }
});


// =================================================
// PESQUISAR FILMES
// =================================================

campoPesquisa.addEventListener('input', () => {

    const termo =
        campoPesquisa.value
            .toLowerCase()
            .trim();


    if (termo === '') {

        filmesFiltrados = filmes;

    } else {

        filmesFiltrados = filmes.filter(filme => {

            const titulo =
                String(filme.titulo || '')
                    .toLowerCase();

            const diretor =
                String(filme.diretor || '')
                    .toLowerCase();

            const genero =
                String(filme.genero || '')
                    .toLowerCase();

            return (
                titulo.includes(termo) ||
                diretor.includes(termo) ||
                genero.includes(termo)
            );
        });
    }


    paginaAtual = 0;

    mostrarFilmes();
});


// =================================================
// BUSCAR FILMES NO BANCO
// =================================================

async function carregarFilmes() {

    try {

        const resposta = await fetch('/filmes');

        filmes = await resposta.json();

        filmesFiltrados = filmes;

        paginaAtual = 0;

        mostrarFilmes();

    } catch (erro) {

        console.log(
            'Erro ao carregar filmes:',
            erro
        );
    }
}


// =================================================
// CARREGAR FILMES AO ABRIR A PÁGINA
// =================================================

carregarFilmes();