fetch('/filmes')
    .then(resposta => resposta.json())
    .then(filmes => {
        const listaFilmes = document.getElementById('lista-filmes');

        filmes.forEach(filme => {
            listaFilmes.innerHTML += `
                <article class="filme">
                    <div class="filme-topo">
                        <h3>${filme.titulo}</h3>
                        <span class="nota">⭐ ${filme.nota}</span>
                    </div>

                    <p class="diretor">${filme.diretor}</p>

                    <p class="genero">${filme.genero}</p>

                    <div class="detalhes">
                        <span>${filme.ano}</span>
                        <span>${filme.duracao} minutos</span>
                    </div>
                </article>
            `;
        });
    });