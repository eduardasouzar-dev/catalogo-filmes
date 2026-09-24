const formFilme = document.getElementById('form-filme');
const listaFilmes = document.getElementById('lista-filmes');


// Cadastrar um novo filme
formFilme.addEventListener('submit', async (evento) => {

    evento.preventDefault();

    const filme = {
        titulo: document.getElementById('titulo').value,
        diretor: document.getElementById('diretor').value,
        genero: document.getElementById('genero').value,
        ano: document.getElementById('ano').value,
        duracao: document.getElementById('duracao').value,
        nota: document.getElementById('nota').value
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

        console.log('Erro ao adicionar filme:', erro);
        alert('Erro ao adicionar filme.');
    }
});


// Buscar e mostrar os filmes
async function carregarFilmes() {

    try {

        const resposta = await fetch('/filmes');

        const filmes = await resposta.json();

        listaFilmes.innerHTML = '';

        filmes.forEach(filme => {

            listaFilmes.innerHTML += `
                <article class="filme">

                    <img 
                        src="${filme.poster}"
                        alt="Pôster de ${filme.titulo}"
                    >

                    <div class="filme-topo">

                        <h3>${filme.titulo}</h3>

                        <span class="nota">
                            ⭐ ${filme.nota}
                        </span>

                    </div>

                    <p class="diretor">
                        ${filme.diretor}
                    </p>

                    <p class="genero">
                        ${filme.genero}
                    </p>

                    <div class="detalhes">

                        <span>${filme.ano}</span>

                        <span>
                            ${filme.duracao} minutos
                        </span>

                    </div>

                </article>
            `;
        });

    } catch (erro) {

        console.log('Erro ao carregar filmes:', erro);
    }
}


// Carrega os filmes quando a página abre
carregarFilmes();