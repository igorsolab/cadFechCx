const hostname = location.hostname;
const port = location.port;
const user = getUserLogado();
var jnid = getJNID();

function getJNID(){

    let JSESSIONID = document.cookie.split('; ').find(row => row.startsWith('JSESSIONID=')).split('=')[1];
    JSESSIONID = JSESSIONID.split('.');
    JSESSIONID = JSESSIONID[0];
    return JSESSIONID;

}

// função para capturar codigo do usuario logado
function getUserLogado(){

    let userLogado = document.cookie.split('; ').find(row => row.startsWith('userIDLogado=')).split('=')[1];
    return userLogado;

}


function IniciarApp(){
    scriptHTML();
}



function scriptHTML(){
    let tela = $("#exibe");
    tela.append(navbar())
}

function navbar(){
    let tabs = `
    <nav class="mb-5" style="background-color: #212529;padding:15px 0px">
        <div class="text-center mb-3 text-white" style=" font-size:2em;">
            <strong>FECHAMENTO DE CAIXA</strong>
        </div>
        <ul class="nav nav-pills mb-3 d-flex justify-content-center" id="pills-tab" role="tablist">
            <li class="nav-item" role="presentation">
                <button class="nav-link active" id="pills-home-tab" data-bs-toggle="pill" data-bs-target="#pills-home" type="button" style="color:white" role="tab" aria-controls="pills-home" aria-selected="true">Cadastrar fechamento de caixa</button>
            </li>
            <li class="nav-item" role="presentation">
                <button class="nav-link" id="pills-contact-tab" data-bs-toggle="pill" data-bs-target="#pills-contact" type="button" style="color:white" role="tab" aria-controls="pills-contact" aria-selected="false">Envio de Imagem</button>
            </li>
            <li class="nav-item" role="presentation">
                <button class="nav-link" id="pills-profile-tab" data-bs-toggle="pill" data-bs-target="#pills-profile" type="button" style="color:white" role="tab" aria-controls="pills-profile" aria-selected="false">Notas avaliadas</button>
            </li>
            
        </ul>
    </nav>

    <div class="tab-content" id="pills-tabContent">
        <div class="tab-pane fade show active" id="pills-home" role="tabpanel" aria-labelledby="pills-home-tab">${cadastroFechamento()}</div>
        <div class="tab-pane fade" id="pills-profile" role="tabpanel" aria-labelledby="pills-profile-tab">${selectNotasReprovadas()}</div>
        <div class="tab-pane fade" id="pills-contact" role="tabpanel" aria-labelledby="pills-contact-tab">${enviarImagem()}</div>
    </div>
    `;

    
    return tabs;
}


function cadastroFechamento(){
    let card = `
        <div class="container" id="card_fechamento">
            <div class="col d-flex justify-content-center text-left">
                <div class="card mb-3">
                    <div class="card-header bg-transparent">Fechar Caixa: </div>
                    <div class="card-body d-flex flex-column justify-content-around" style="width:500px;height:100%;gap:20px">
                        <div class="form-floating" id="divConfCega">
                            <input class="form-control" type="text" id="id_conf_cega">
                            <label for="divSelectEmp">Selecione o ID da Conferencia Cega</label>
                        </div>
                        <div class="form-floating" id="divSelectEmp">
                            ${selectEmpresa('selectEmp','onchange="atualizaSelectUsuario()"')}
                            <label for="divSelectEmp">Selecione a empresa</label>
                        </div>
                        <div class="form-floating" id="divSelectUsu">
                            <select class="form-select" id="selectUsu">
                                <option value="" selected>Selecione o usuario</option>
                            </select>
                            <label for="selectUsu">Selecione o usuario</label>
                        </div>
                        <div class="form-floating" id="input_date">
                            <input type="datetime-local" class="text-left form-control" id="buscar_data" />
                            <label for="buscar_data">Selecione a data e hora do fechamento</label>
                        </div>
                        <div class="form-check form-switch">
                            <input onchange="existeDocumento()" class="form-check-input" type="checkbox" id="confirmacao_documento">
                            <label class="form-check-label" for="confirmacao_documento">O documento sera enviado?</label>
                        </div>
                        

                        <div class="form-floating" id="valor_fechamento">
                            <input type="number" class="form-control" id="valor"/>
                            <label for="divSelectEmp">Valor do fechamento</label>
                        </div>
                        
                        <button type="submit" onclick="salvarFechamento()" id="acao_salvar" style="width:100%;" class="btn btn-primary mb-3 mt-3">Salvar</button>
                    </div>
                </div>
            </div>
        </div>
    `
    return card
}




function existeDocumento(){
    let checkbox = $("#confirmacao_documento");
    if(checkbox.is(':checked')){
        $('#card-documento').css({
            // 'background-color':'#eee',
            // "width":"400px",
            // "height":"100%",
            // "margin-bottom":"20px",
            // "overflow":"hidden"
            "display":"block"
        });
    }else{
        $('#card-documento').css({
            // 'background-color':'',
            // "width":"0",
            // "height":"0",
            // "overflow":"hidden"
            "display":"none"
        });
    }
    
}

async function salvarFechamento(){
    let selectEmp                       = $("#selectEmp").val();
    let idConfCega                      = $("#id_conf_cega").val();
    let selectUsu                       = $("#selectUsu").val();
    let dataAtualSemFormatar            = new Date().toLocaleString('pt-BR');
    let dataSelecionadaSemFormatar      = $("#buscar_data").val();
    let confirmacao                     = $("#confirmacao_documento");
    let valor                           = $("#valor").val()
    let valorConfirmacao                = confirmacao.is(":checked") ? "S" : "N";

    // formatando data para salvar no banco
    let data = dataAtualSemFormatar.split(",")
    let dataAtual = ""
    dataAtual = data.join(" ")
    let dataSelecionada = "";

    if(dataSelecionadaSemFormatar !== undefined){ 
        data = dataSelecionadaSemFormatar.split("T")
        let formataData = data[0].split("-");
        dataSelecionada =  `${formataData[2]}/${formataData[1]}/${formataData[0]} ${data[1]}`
    } 
    else{
        dataSelecionada = undefined
    }

    let fields = {}
    let entity = "AD_CADFECHCAIXA";

    fields.CODEMP                           = dataFormatSankhya(selectEmp);
    fields.CODUSU                           = dataFormatSankhya(selectUsu)
    fields.DHFECH                           = dataFormatSankhya((dataSelecionada == undefined || dataSelecionada.includes("undefined")) ? (dataAtual) : (dataSelecionada));
    fields.CONFIRMACAO                      = dataFormatSankhya(valorConfirmacao);
    fields.VLRSALDO                         = dataFormatSankhya(valor)
    fields.IDCONFCEGA                       = dataFormatSankhya(idConfCega)
    saveRecord(entity,fields);
    // console.log(fields)

    documentoSalvo();
}

function documentoSalvo(){
    let modal = `
    <div class="modal" id="modalDocumento" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">Dados enviados com sucesso!</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" onclick="location.reload()" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <p>Os dados foram enviados com sucesso. O fechamento de caixa esta concluido</p>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="location.reload()" data-bs-dismiss="modal">Fechar</button>
            </div>
            </div>
        </div>
    </div>
    `

    let body = $("body")
    body.append(modal)

    var modalDocumento = new bootstrap.Modal(document.getElementById("modalDocumento"));
    modalDocumento.show()
}


function atualizaSelectUsuario(){
    let codEmp = $("#selectEmp").val();
    let sql = "";
    if(codEmp == "" || codEmp == undefined){
        sql = `select NOMEUSU,CODUSU from TSIUSU`;
    }
    else{
        sql = `select NOMEUSU,CODUSU from TSIUSU where CODEMP = ${codEmp}`
    }

    let dadosSelect = getDadosSql(sql,true)

    let divSelectUsu = $("#divSelectUsu");
    divSelectUsu.empty()
    
    let select = `
    <select class="form-select" id="selectUsu">
        <option value="" selected>Selecione o usuario</option>`;

        for(let i = 0; i < dadosSelect.length; i ++){

            select +=`<option value="${dadosSelect[i].CODUSU}">${dadosSelect[i].NOMEUSU}</option>`;
        }
    
    select+=`</select>
    <label for="divSelectUsu">Selecione o usuario</label>
    `;

    divSelectUsu.append(select)
}


function selectEmpresa(nome,onchange){
    let sql = `SELECT CODEMP, NOMEFANTASIA FROM TSIEMP WHERE CODEMP < 100`;
    let dadosSelect = getDadosSql(sql,true);
    let select = `
    <select ${onchange} class="form-select" id="${nome}">
        <option value="" selected>Selecione a empresa</option>`;

        for(let i = 0; i < dadosSelect.length; i ++){

            select +=`<option value="${dadosSelect[i].CODEMP}">${dadosSelect[i].NOMEFANTASIA}</option>`;
        }
    
    select+=`</select>`;
    return select;
}

