const btnNovo = document.querySelector('.btn-novo');
const projectStatus = document.getElementById('projectStatus');
const modal = document.getElementById('modal');
const btnCancelar = document.getElementById('cancelar');
const btnCriar = document.getElementById('criar');

const projectName = document.getElementById('projectName');
const projectDesc = document.getElementById('projectDesc');
const projectsContainer = document.getElementById('projects');

const editor = document.getElementById('editor');
const editorTitle = document.getElementById('editorTitle');
const btnVoltar = document.getElementById('btnVoltar');
const btnNovaCena = document.getElementById('btnNovaCena');
const sceneList = document.getElementById('sceneList');

let cardEmEdicao = null;
let projetoAtual = null;
let dragIndex = null;

/* Modal */
btnNovo.onclick = () => modal.classList.add('show');

btnCancelar.onclick = () => {
    cardEmEdicao = null;
    modal.classList.remove('show');
    limparCampos();
};

/* Criar / editar */
btnCriar.onclick = () => {
    if (!projectName.value.trim()) {
        alert('O projeto precisa de um nome!');
        return;
    }

    if (cardEmEdicao) {
        atualizarTextoCard(cardEmEdicao);
        atualizarStatusCard(cardEmEdicao, projectStatus.value);
        cardEmEdicao = null;
    } else {
        criarNovoCard();
    }

    modal.classList.remove('show');
    limparCampos();
};

function criarNovoCard() {
    const card = document.createElement('div');
    card.classList.add('project-card', projectStatus.value);

    card._scenes = [];

    card.innerHTML = `
        <span class="status status-${projectStatus.value}">
            ${capitalizar(projectStatus.value)}
        </span>

        <h3>${projectName.value}</h3>
        <p>${projectDesc.value || 'Sem descrição'}</p>

        <select class="status-select">
            <option value="rascunho">Rascunho</option>
            <option value="ativo">Ativo</option>
            <option value="arquivado">Arquivado</option>
        </select>

        <div class="card-actions">
            <button class="btn-edit">Editar</button>
            <button class="btn-delete">Excluir</button>
        </div>
    `;

    card.querySelector('.status-select').value = projectStatus.value;
    configurarCard(card);
    projectsContainer.appendChild(card);
}

function configurarCard(card) {
    const statusSelect = card.querySelector('.status-select');

    statusSelect.onchange = () =>
        atualizarStatusCard(card, statusSelect.value);

    card.querySelector('.btn-delete').onclick = () => {
        card.classList.add('fade-out');
        setTimeout(() => card.remove(), 300);
    };

    card.querySelector('.btn-edit').onclick = () => {
        cardEmEdicao = card;
        projectName.value = card.querySelector('h3').innerText;
        projectDesc.value = card.querySelector('p').innerText;
        projectStatus.value = [...card.classList]
            .includes('ativo') ? 'ativo'
            : [...card.classList].includes('arquivado')
            ? 'arquivado' : 'rascunho';
        modal.classList.add('show');
    };

    card.onclick = (e) => {
        if (e.target.closest('button') || e.target.tagName === 'SELECT') return;
        abrirEditor(card);
    };
}

function abrirEditor(card) {
    projetoAtual = card;
    projectsContainer.classList.add('hidden');
    editor.classList.remove('hidden');

    editorTitle.innerText = card.querySelector('h3').innerText;
    renderScenes();
}

/* CENAS */
btnNovaCena.onclick = () => {
    projetoAtual._scenes.push({
        titulo: 'Nova Cena',
        conteudo: ''
    });
    renderScenes();
};

function renderScenes() {
    sceneList.innerHTML = '';

    projetoAtual._scenes.forEach((scene, index) => {
        const div = document.createElement('div');
        div.classList.add('scene');
        div.draggable = true;
        div.dataset.index = index;

        div.innerHTML = `
            <div class="scene-header">
                <input value="${scene.titulo}">
                <button data-del>✖</button>
            </div>
            <textarea>${scene.conteudo}</textarea>
        `;

        /* Conteúdo */
        div.querySelector('input').oninput = e =>
            scene.titulo = e.target.value;

        div.querySelector('textarea').oninput = e =>
            scene.conteudo = e.target.value;

        div.querySelector('[data-del]').onclick = () => {
            projetoAtual._scenes.splice(index, 1);
            renderScenes();
        };

        /* DRAG & DROP */
        div.addEventListener('dragstart', () => {
            dragIndex = index;
            div.classList.add('dragging');
        });

        div.addEventListener('dragend', () => {
            div.classList.remove('dragging');
        });

        div.addEventListener('dragover', (e) => {
            e.preventDefault();
            div.classList.add('drag-over');
        });

        div.addEventListener('dragleave', () => {
            div.classList.remove('drag-over');
        });

        div.addEventListener('drop', () => {
            div.classList.remove('drag-over');

            if (dragIndex === index) return;

            const temp = projetoAtual._scenes[dragIndex];
            projetoAtual._scenes.splice(dragIndex, 1);
            projetoAtual._scenes.splice(index, 0, temp);

            renderScenes();
        });

        sceneList.appendChild(div);
    });
}

/* Voltar */
btnVoltar.onclick = () => {
    editor.classList.add('hidden');
    projectsContainer.classList.remove('hidden');
    projetoAtual = null;
};

/* Utilidades */
function atualizarStatusCard(card, status) {
    card.classList.remove('rascunho', 'ativo', 'arquivado');
    card.classList.add(status);
    card.querySelector('.status').className = `status status-${status}`;
    card.querySelector('.status').innerText = capitalizar(status);
}

function atualizarTextoCard(card) {
    card.querySelector('h3').innerText = projectName.value;
    card.querySelector('p').innerText =
        projectDesc.value || 'Sem descrição';
}

function limparCampos() {
    projectName.value = '';
    projectDesc.value = '';
    projectStatus.value = 'rascunho';
}

function capitalizar(texto) {
    return texto.charAt(0).toUpperCase() + texto.slice(1);
}
