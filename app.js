//Valor = reais (formatar valor)
function formatarMoeda(input) {
    let valor = input.value;

    // Remover todos os caracteres não dígito/vírgula
    valor = valor.replace(/\D/g, '');

    let valorNumerico = parseInt(valor);

    if (valorNumerico === 0) {
        // Se o valor for zero, limpar o input
        input.value = '';
        return;
    }

    // Formatar o valor para somente em reais (R$ X,XX)
    valor = (valorNumerico / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    input.value = valor;
}

//Classe Despesa
class Despesa {
    constructor(ano, mes, dia, tipo, descricao, valor) {
        this.ano = ano
        this.mes = mes
        this.dia = dia
        this.tipo = tipo
        this.descricao = descricao
        this.valor = valor
    }

    validarDados() {
        for (let i in this) {
            if (this[i] == undefined || this[i] == '' || this[i] == null) {
                return false
            }
        }
        return true
    }
}

//Adicionar os itens no localStorage do Browser
class Bd {

    constructor() {
        let id = localStorage.getItem('id')

        if (id === null) [
            localStorage.setItem('id', 0)
        ]
    }

    getProximoId() {
        let proximoId = localStorage.getItem('id') //null
        return parseInt(proximoId) + 1;
    }

    gravar(d) {
        let id = this.getProximoId();

        localStorage.setItem(id, JSON.stringify(d))

        localStorage.setItem('id', id)
    }

    recuperarTodosRegistros() {
        //Array de Despesas
        let despesas = Array()

        let id = localStorage.getItem('id')

        //Recuperar todas as despesas cadastradas em localStorage
        for (let i = 1; i <= id; i++) {
            //Recuperar a despesa
            let despesa = JSON.parse(localStorage.getItem(i))

            //Verificar se existe a possibilidade de haver índices que foram pulados/removidos,
            //Nesse caso, pular esses índices

            if (despesa === null) {
                continue
            }

            despesa.id = i
            despesas.push(despesa)
        }

        return despesas;
    }

    pesquisar(despesa) {
        let despesasFiltradas = Array()
        despesasFiltradas = this.recuperarTodosRegistros()

        //ano
        if (despesa.ano != '') {
            despesasFiltradas = despesasFiltradas.filter(d => d.ano == despesa.ano);
        }
        //mes
        if (despesa.mes != '') {
            despesasFiltradas = despesasFiltradas.filter(d => d.mes == despesa.mes);
        }
        //dia
        if (despesa.dia != '') {
            despesasFiltradas = despesasFiltradas.filter(d => d.dia == despesa.dia);
        }
        //tipo
        if (despesa.tipo != '') {
            despesasFiltradas = despesasFiltradas.filter(d => d.tipo == despesa.tipo);
        }
        //descricao
        if (despesa.descricao != '') {
            despesasFiltradas = despesasFiltradas.filter(d => d.descricao == despesa.descricao);
        }
        //valor
        if (despesa.valor != '') {
            despesasFiltradas = despesasFiltradas.filter(d => d.valor == despesa.valor);
        }

        return despesasFiltradas;
    }

    remover(id) {
        localStorage.removeItem(id);
    }
}

let bd = new Bd()

//Cadastro das despesas
function cadastrarDespesa() {
    let ano = document.getElementById('ano');
    let mes = document.getElementById('mes');
    let dia = document.getElementById('dia');
    let tipo = document.getElementById('tipo');
    let descricao = document.getElementById('descricao');
    let valor = document.getElementById('valor');

    let despesa = new Despesa(
        ano.value,
        mes.value,
        dia.value,
        tipo.value,
        descricao.value,
        valor.value
    );

    console.log("Despesa antes de cadastrar:", despesa); // Adiciona este console.log

    if (despesa.validarDados()) {
        // Verificando se o valor do dia está dentro do intervalo válido (1 a 31)
        let diaValue = parseInt(dia.value);
        if (diaValue < 1 || diaValue > 31 || isNaN(diaValue)) {
            // Exibindo uma mensagem de erro com SweetAlert
            Swal.fire({
                title: 'Erro',
                text: 'Por favor, digite um número entre 1 e 31 para o dia.',
                icon: 'error',
                confirmButtonText: 'OK',
                customClass: {
                    title: 'text-danger',
                    confirmButton: 'custom-btn-danger',
                    popup: 'custom-sweetalert-popup',
                },
                iconHtml: '<i class="fas fa-exclamation-circle"></i>'
            });
            return; // Impedindo a execução do código restante
        }

        bd.gravar(despesa);

        ano.value = '';
        mes.value = '';
        dia.value = '';
        tipo.value = '';
        descricao.value = '';
        valor.value = '';

        // Exibindo uma mensagem de sucesso com SweetAlert
        Swal.fire({
            title: 'Registro feito com sucesso',
            text: 'Sua despesa foi cadastrada com sucesso!',
            icon: 'success',
            confirmButtonText: 'OK',
            customClass: {
                title: 'text-success',
                confirmButton: 'custom-btn-success',
                content: 'text-success',
                popup: 'custom-sweetalert-popup',
            },
            iconHtml: '<i class="fas fa-check"></i>',
        }).then((result) => {
            if (result.isConfirmed) {
                location.reload();
            }
        });
    } else {
        // Se houver erro na validação dos dados, exibir SweetAlert com mensagem de erro
        Swal.fire({
            title: 'Erro na inclusão do registro',
            text: 'Por favor, preencha todos os campos obrigatórios e verifique se algum está vazio. Tente novamente.',
            icon: 'error',
            confirmButtonText: 'Voltar e corrigir',
            customClass: {
                title: 'text-danger',
                confirmButton: 'custom-btn-danger',
                popup: 'custom-sweetalert-popup',
            },
            iconHtml: '<i class="fas fa-exclamation-circle"></i>'
        });
    }
}

// Função para calcular o total das despesas
function calcularTotalDespesas(despesas) {
    let total = 0;
    despesas.forEach(function (d) {
        // Remover o símbolo de moeda, espaços em branco e vírgulas do valor antes de somar ao total
        let valorNumerico = parseFloat(d.valor.replace(/[^\d,-]/g, '').replace(',', '.'));
        total += valorNumerico;
    });
    return total;
}

// Carregar a lista das despesas
function carregaListaDespesas(despesas = Array(), filtro = false) {
    // Se a lista de despesas estiver vazia e não for um filtro, recuperar todas as despesas
    if (despesas.length == 0 && !filtro) {
        despesas = bd.recuperarTodosRegistros();
    }

    // Selecionar o elemento <tbody> da tabela
    let listaDespesas = document.getElementById('listaDespesas');
    listaDespesas.innerHTML = '';

    // Percorrer o Array despesas, listando cada despesa de forma dinâmica
    despesas.forEach(function (d) {
        // Criar linha (<tr>)
        let linha = listaDespesas.insertRow();
        // Criar colunas (<td>)
        linha.insertCell(0).innerHTML = `${d.dia}/${d.mes}/${d.ano}`;
        // Ajustar o tipo do objeto
        switch (d.tipo) {
            case '1': d.tipo = 'Alimentação'; break;
            case '2': d.tipo = 'Educação'; break;
            case '3': d.tipo = 'Lazer'; break;
            case '4': d.tipo = 'Saúde'; break;
            case '5': d.tipo = 'Transporte'; break;
        }
        linha.insertCell(1).innerHTML = d.tipo;
        linha.insertCell(2).innerHTML = d.descricao;
        linha.insertCell(3).innerHTML = d.valor;
        // Botão de excluir despesa
        let btn = document.createElement('button');
        btn.className = 'btn btn-dark d-block m-auto';
        btn.innerHTML = '<i class="fa-solid fa-trash"></i>';
        btn.id = `id-despesa-${d.id}`;
        btn.onclick = function () { //Remove a despesa
            let id = this.id.replace('id-despesa-', '');
            // Alerta de confirmação de exclusão
            Swal.fire({
                title: 'Tem certeza?',
                text: 'Você realmente deseja excluir esta despesa?',
                confirmButtonText: 'Sim, excluir',
                cancelButtonText: 'Cancelar',
                showCancelButton: true,
                confirmButtonColor: '#218838',
                cancelButtonColor: '#9f0707',
                customClass: {
                    title: 'text-danger',
                    popup: 'custom-sweetalert-popup',
                },
                iconHtml: '<i class="fa-solid fa-trash-can icon-large"></i>'
            }).then((result) => {
                if (result.isConfirmed) {
                    // Remover a despesa do armazenamento local
                    bd.remover(id);
                    // Recarregar a lista de despesas após remover a despesa
                    let despesas = bd.recuperarTodosRegistros();
                    carregaListaDespesas(despesas);
                }
            });
        };
        linha.insertCell(4).append(btn);
    });

    console.log("Despesas antes de calcular o total:", despesas); // Adiciona este console.log

    // Calcular o total das despesas
    let totalDespesas = calcularTotalDespesas(despesas);
    console.log("Total de despesas antes de formatar:", totalDespesas);

    // Formatar o total apenas para exibição
    let totalFormatado = totalDespesas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    console.log("Total de despesas formatado:", totalFormatado);

    // Manter o total como um número para cálculos posteriores
    let totalNumerico = parseFloat(totalDespesas.toFixed(2));
    console.log("Total de despesas numérico:", totalNumerico);


    // Adicionar uma linha com o total das despesas
    let linhaTotal = listaDespesas.insertRow();
    linhaTotal.innerHTML = `<td colspan="3" style="font-family: 'Poetsen One', sans-serif; font-weight: bold;"><strong>Total:</strong></td><td style="font-family: 'Poetsen One', sans-serif; color: #076c06;">${totalFormatado}</td><td></td>`;

    // Exibir a mensagem de despesa não encontrada se necessário
    let mensagemDespesaNaoEncontrada = document.getElementById('mensagemDespesaNaoEncontrada');
    if (despesas.length === 0) {
        mensagemDespesaNaoEncontrada.style.display = 'block';
    } else {
        mensagemDespesaNaoEncontrada.style.display = 'none';
    }
}

//Pesquisar Despesa - consulta.html
function pesquisarDespesa() {
    let ano = document.getElementById('ano').value
    let mes = document.getElementById('mes').value
    let dia = document.getElementById('dia').value
    let tipo = document.getElementById('tipo').value
    let descricao = document.getElementById('descricao').value
    let valor = document.getElementById('valor').value

    let despesa = new Despesa(ano, mes, dia, tipo, descricao, valor)

    let despesas = bd.pesquisar(despesa)

    this.carregaListaDespesas(despesas, true)
}
