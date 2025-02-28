document.addEventListener('DOMContentLoaded', function() {
    const formPartida = document.getElementById('formPartida');
    const listaPartidas = document.getElementById('listaPartidas');

    // Função para carregar partidas
    const carregarPartidas = async () => {
        try {
            const response = await fetch('http://localhost:3000/partidas');
            const partidas = await response.json();

            listaPartidas.innerHTML = ''; // Limpa a lista antes de renderizar

            partidas.forEach(partida => {
                const li = document.createElement('li');
                li.classList.add('list-group-item', 'mb-3', 'p-3', 'border', 'rounded');

                li.innerHTML = `
                    <div>
                        <div class="tittle d-flex justify-content-between align-items-center">
                            <h5>${partida.nome}</h5>
                            <button class="btn btn-danger btn-sm remover-partida" data-id="${partida.id}">
                                Remover Partida
                            </button>
                        </div>
                        <hr>
                        <p><strong>Local:</strong> ${partida.local}</p>
                        <p><strong>Data e Hora:</strong> ${new Date(partida.data).toLocaleString()}</p>
                    </div>

                    <!-- Botão para abrir o formulário -->
                    <button class="btn btn-success btn-sm mb-2" type="button" data-bs-toggle="collapse" data-bs-target="#formJogador_${partida.id}">
                        Adicionar Jogador
                    </button>

                    <!-- Formulário dentro do collapse -->
                    <div class="collapse mt-2" id="formJogador_${partida.id}">
                        <div class="card card-body">
                            <form id="formAdicionarJogador_${partida.id}">
                                <input type="text" id="nomeJogador_${partida.id}" class="form-control mb-2" placeholder="Nome do Jogador" required>
                                <input type="text" id="telefoneJogador_${partida.id}" class="form-control mb-2" placeholder="Telefone (--) - ---- ----" required>
                                <button type="submit" class="btn btn-success">Salvar</button>
                            </form>
                        </div>
                    </div>

                    <!-- Lista de jogadores -->
                    <ul class="list-group list-group-flush mt-2" id="listaJogadores_${partida.id}">
                        ${partida.jogadores.length > 0 
                            ? partida.jogadores.map(jogador => `
                                <li class="list-group-item d-flex justify-content-between align-items-center">
                                    <span>${jogador.nome} - ${jogador.telefone}</span>
                                    <button class="btn btn-danger btn-sm remover-jogador" data-id="${partida.id}" data-telefone="${jogador.telefone}">
                                        X
                                    </button>
                                </li>
                            `).join('')
                            : '<li class="list-group-item text-muted">Nenhum jogador cadastrado</li>'}
                    </ul>
                `;

                listaPartidas.appendChild(li);

                // Evento para adicionar jogador
                document.getElementById(`formAdicionarJogador_${partida.id}`).addEventListener('submit', async (e) => {
                    e.preventDefault();
                    const nomeJogador = document.getElementById(`nomeJogador_${partida.id}`).value;
                    const telefoneJogador = document.getElementById(`telefoneJogador_${partida.id}`).value;

                    const novoJogador = { nome: nomeJogador, telefone: telefoneJogador };

                    try {
                        const response = await fetch(`http://localhost:3000/partidas/${partida.id}/jogador`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(novoJogador),
                        });

                        if (response.ok) {
                            carregarPartidas(); // Atualiza a lista após adicionar jogador
                        } else {
                            alert('Erro ao adicionar jogador');
                        }
                    } catch (err) {
                        console.error('Erro ao adicionar jogador:', err);
                    }
                });

                // Adicionando evento para remover partida
                li.querySelector('.remover-partida').addEventListener('click', async () => {
                    const partidaId = partida.id;

                    try {
                        const response = await fetch(`http://localhost:3000/partidas/${partidaId}`, {
                            method: 'DELETE',
                        });

                        if (response.ok) {
                            carregarPartidas(); // Atualiza a lista após remover partida
                        } else {
                            alert('Erro ao remover partida');
                        }
                    } catch (err) {
                        console.error('Erro ao remover partida:', err);
                    }
                });

                // Adicionando eventos para remover jogadores
                li.querySelectorAll('.remover-jogador').forEach(botao => {
                    botao.addEventListener('click', async () => {
                        const partidaId = botao.getAttribute('data-id');
                        const telefoneJogador = botao.getAttribute('data-telefone');

                        try {
                            const response = await fetch(`http://localhost:3000/partidas/${partidaId}/jogador/${telefoneJogador}`, {
                                method: 'DELETE',
                            });

                            if (response.ok) {
                                carregarPartidas(); // Atualiza a lista após remover jogador
                            } else {
                                alert('Erro ao remover jogador');
                            }
                        } catch (err) {
                            console.error('Erro ao remover jogador:', err);
                        }
                    });
                });
            });
        } catch (err) {
            console.error('Erro ao carregar partidas:', err);
        }
    };

    // Função para adicionar jogador
    const adicionarJogador = async (partidaId, nome, telefone) => {
        try {
            const response = await fetch(`http://localhost:3000/partidas/${partidaId}/jogador`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ nome, telefone })
            });

            if (response.ok) {
                carregarPartidas();  // Atualizar a lista após adicionar o jogador
            } else {
                alert('Erro ao adicionar jogador');
            }
        } catch (err) {
            console.error('Erro ao adicionar jogador:', err);
        }
    };

    // Enviar requisição POST para criar uma nova partida
    formPartida.addEventListener('submit', async (e) => {
        e.preventDefault();

        const novaPartida = {
            nome: document.getElementById('titulo').value,
            local: document.getElementById('local').value,
            data: document.getElementById('dataHora').value,
            jogadores: []  // Começa com uma lista vazia de jogadores
        };

        try {
            const response = await fetch('http://localhost:3000/partidas', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(novaPartida)
            });

            if (response.ok) {
                carregarPartidas();  // Atualizar a lista de partidas após a criação
            } else {
                alert('Erro ao criar partida');
            }
        } catch (err) {
            console.error('Erro ao criar partida:', err);
        }
    });

    // Carregar as partidas ao iniciar
    carregarPartidas();
});
