const express = require('express');
const fs = require('fs');
const cors = require('cors');  // Importando o middleware CORS
const app = express();
const PORT = 3000;
const DATA_FILE = 'partidas.json';

app.use(cors());  // Permite requisições de qualquer origem
app.use(express.json());

// Função para ler o arquivo JSON
const lerPartidas = () => {
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        return [];
    }
};

// Função para escrever no arquivo JSON
const salvarPartidas = (partidas) => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(partidas, null, 2), 'utf8');
};

// Rota para listar todas as partidas
app.get('/partidas', (req, res) => {
    const partidas = lerPartidas();
    res.json(partidas);
});

// Rota para criar uma nova partida
app.post('/partidas', (req, res) => {
    const partidas = lerPartidas();
    const novaPartida = { id: Date.now(), ...req.body, jogadores: [] };
    partidas.push(novaPartida);
    salvarPartidas(partidas);
    res.status(201).json(novaPartida);
});

// Rota para adicionar um jogador a uma partida
app.post('/partidas/:id/jogador', (req, res) => {
    const { id } = req.params;
    const { nome, telefone } = req.body;

    let partidas = lerPartidas();
    const partida = partidas.find(p => p.id == id);

    if (!partida) {
        return res.status(404).json({ message: 'Partida não encontrada' });
    }

    const novoJogador = { nome, telefone };
    partida.jogadores.push(novoJogador);

    salvarPartidas(partidas);
    res.status(201).json(novoJogador);
});

// Rota para remover um jogador de uma partida
app.delete('/partidas/:id/jogador/:telefone', (req, res) => {
    const { id, telefone } = req.params;

    let partidas = lerPartidas();
    const partida = partidas.find(p => p.id == id);

    if (!partida) {
        return res.status(404).json({ message: 'Partida não encontrada' });
    }

    const jogadorIndex = partida.jogadores.findIndex(j => j.telefone === telefone);
    
    if (jogadorIndex === -1) {
        return res.status(404).json({ message: 'Jogador não encontrado' });
    }

    partida.jogadores.splice(jogadorIndex, 1);
    salvarPartidas(partidas);
    res.status(200).json({ message: 'Jogador removido com sucesso' });
});

// Rota para remover uma partida pelo ID
app.delete('/partidas/:id', (req, res) => {
    let partidas = lerPartidas();
    const { id } = req.params;
    const index = partidas.findIndex(p => p.id == id);

    if (index !== -1) {
        partidas.splice(index, 1); // Remove a partida do array
        salvarPartidas(partidas); // Salva as alterações no arquivo JSON
        res.status(200).json({ message: "Partida removida com sucesso" });
    } else {
        res.status(404).json({ message: "Partida não encontrada" });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
