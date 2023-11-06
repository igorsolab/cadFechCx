function servicos(emp){
    let geralServicos = `
        <div class="d-flex justify-content-around flex-row" style="height:20vh;background-color:#eee;margin-top:-48px;">
            <div class="col-6 d-flex justify-content-center align-self-center">${cadastrarServico(emp)}</div>
            <div class="col-6 d-flex justify-content-center align-self-center">${servicosAvaliados(emp)}</div>
        </div>
        <div id="servicosAvaliados" class="mt-5" style="height:50vh"></div>
    `
    let cadService = $("#cadastroServicos")
    cadService.empty()
    cadService.append(geralServicos)

}

function cadastrarServico(emp){
    let cadastrarServicos = `
        <button class="btn btn-primary text-white d-flex justify-content-center" onclick="docServicos(${emp})">Cadastrar servico</button>
    `
    return cadastrarServicos
}

function servicosAvaliados(emp){

    let servicosAvaliados = `
        <button class="btn btn-danger text-white d-flex justify-content-center" onclick="comprovantesAvaliados(${emp})">Visualizar servicos avaliados</button>
    `

    return servicosAvaliados
    
}

function comprovantesAvaliados(emp){
    let comprovantesAvaliados = `
        <div class="d-flex justify-content-center">
            ${servicosReprovados(emp)}
        </div>
    `
    return comprovantesAvaliados
}

function servicosReprovados(emp){
    let sql = `
    select ac.IDSERV, ac.NUNOTA, t2.NOMEFANTASIA, ac.LABEL, ac.OBSERVACAO from AD_CADFECHSERVICES ac
    inner join TGFCAB t on t.NUNOTA = ac.NUNOTA
    inner join TSIEMP t2 on t2.CODEMP = t.CODEMP
    WHERE AVALIACAO = 'N'
    AND t.CODEMP = ${emp}
    `;

    console.log(sql)

    let servicosReprovados = ""
    let dadosServicos = getDadosSql(sql,true)
    if(dadosServicos.length < 1){
        servicosReprovados = "<tr><td><h6 class='mt-5 text-center'>Nao ha nenhum servico reprovado</h6></td></tr>"
    }else{
    
    servicosReprovados = `<div class="container"> <div class="row" style="margin:0 auto">`
        for(let i = 0; i < dadosServicos.length; i++){
            servicosReprovados+=`

            <tr>
                <td>
                    <div class="card">
                        <div class="card-body">
                            <div class="d-flex justify-content-between">
                                <h5 class="card-title">${dadosServicos[i].NOMEFANTASIA}</h5>
                                <h6 class="card-subtitle mb-2 text-muted">NUNOTA: ${dadosServicos[i].NUNOTA}</h6>
                            </div>
                            <h6>Descricao do titulo: <span style="font-weight:400"> ${dadosServicos[i].LABEL}</span></h6>
                            <h6 class="">Motivo da reprovacao: <span style="font-weight:400">${dadosServicos[i].OBSERVACAO}</span></h6>
                        </div>
                        <div class="card-footer d-flex justify-content-around">
                            <button class="btn btn-warning text-black" onclick="corrigirDocumento('${dadosServicos[i].IDSERV}',${emp})">Corrigir comprovante</button>
                        </div>
                    </div>
                </td>
            </tr>
            `
        }
        
        servicosReprovados+="</div></div>"
    }
    tabelaServicosAvaliados(servicosReprovados, 'Servicos Reprovados: ','servicosReprovadosTable')
}

function corrigirDocumento(id,emp){

    let sql = `SELECT LABEL,NUNOTA FROM AD_CADFECHSERVICES WHERE IDSERV = ${id}`
    let dados = getDadosSql(sql, true)

    let corrigirDocumento = `
        <div class="card">
            <div class="card-body" >
                <label class="form-label">Selecione a Imagem</label>
                <input type="file" class="form-control form-control-sm" id="fileDocUpdate" name="fileDoc">
                <label class="form-label mt-2">Descricao do comprovante</label>
                <input id="descricaoServUpdate" type="text" class="form-control" value="${dados[0].LABEL}" placeholder="Titulo do documento"/>
                <label class="form-label mt-2">NUNOTA:</label>
                <input id="nunotaServUpdate" type="number" value="${dados[0].NUNOTA}" class="form-control" placeholder="NUNOTA"/>
            </div>
        </div>
    `
    let modal = `
    <div class="modal fade" id="modalCorrecaoServico" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">Corrigir Comprovante</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" onclick="fechaModal('modalCorrecaoServico')" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                ${corrigirDocumento}
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="fechaModal('modalCorrecaoServico')" data-bs-dismiss="modal">Fechar</button>
                <button type="button" class="btn btn-primary" onclick="alterarServico(${id},${emp})">Salvar alteracoes</button>
            </div>
            </div>
        </div>
    </div>
    `
    $("body").append(modal)
    var myModal = new bootstrap.Modal(document.getElementById('modalCorrecaoServico'), {
        keyboard: false,
    })

    myModal.show()
}

function tabelaServicosAvaliados(servicos, title,nomeTable){

    let tabelaPaginada = `

    <div class="container">
        <div class="card" style="max-width:500px;margin:0 auto;">
            <table 
                id="${nomeTable}"
                class="table table-bordered"
                style="overflow:hidden;border-collapse:separate;"
                data-pagination="true"
                data-page-size="3"
                data-toggle="table">
                    <thead style="font-weight:100; font-size:20px">
                        <tr class="table-borderless">
                            <th  data-field="title">${title}</th>
                        </tr>
                    </thead>
                <tbody>
                    ${servicos}
                </tbody>
            </table>
        </div>
    </div>
    `
    $(function () {
        $(`#${nomeTable}`).bootstrapTable({
            paginationVAlign:"both",
            paginationParts:['pageList'],
        });
    });
    let tela = $("#servicosAvaliados");
    tela.empty()
    tela.append(tabelaPaginada)
}


function servicosConferidos(emp){
    let sql = `
    select ac.NUNOTA, ac.TIPOARQUIVO, ac.LABEL, t2.NOMEFANTASIA from AD_CADFECHSERVICES ac
    inner join TGFCAB t on t.NUNOTA = ac.NUNOTA
    inner join TSIEMP t2 on t2.CODEMP = t.CODEMP
    where t.CODEMP = ${emp}
    `

    let dadosServicosConferidos = getDadosSql(sql,true);
    console.log(dadosServicosConferidos)
}

function docServicos(emp){
 
    let servicos = `<div class="mt-3 d-flex justify-content-center" id="cadastroDocumento">`

    servicos += `
    <div class="col-3">
        <div class="card">
            <div class="card-body" >
                <label class="form-label">Selecione a Imagem</label>
                <input type="file" class="form-control form-control-sm" id="fileDoc" name="fileDoc">
                <label class="form-label mt-2">Descricao do comprovante</label>
                <input id="descricaoServ" type="text" class="form-control" placeholder="Titulo do documento"/>
                <label class="form-label mt-2">NUNOTA:</label>
                <input id="nunotaServ" type="number" class="form-control" placeholder="NUNOTA"/>
            </div>
            <div class="card-footer">
                <button class="btn btn-primary" onclick="salvarServicos(${emp})">Adicionar documento</button>
            </div>
        </div>
    </div>
    `
    
    servicos+=`</div>`;

    let tela = $("#servicosAvaliados");
    tela.empty()
    tela.append(servicos)
}


async function convertDocument() {
    return new Promise((resolve, reject) => {
        var file = document.getElementById("fileDoc").files;
        let img;
        if (file.length > 0) {
            img = file[0];
            var reader = new FileReader();
            reader.onload = function (e) {
                resolve(e.target.result);
            };
            reader.onerror = function (error) {
                reject(error);
            };
            reader.readAsDataURL(img);
        } else {
            reject(new Error("Nenhum arquivo selecionado"));
        }
    });
}



async function salvarServicos(emp) {

    let nunota = $("#nunotaServ").val();
    let descricao = $("#descricaoServ").val();

    try {
        let img = await convertDocument();
        let tipoDoc = "";
        if(img.includes("data:image")){
            tipoDoc = "I"
        }else if(img.includes("data:application/pdf")){
            tipoDoc = "P"
        }
        let entity = "AD_CADFECHSERVICES";
        let fields = {};

        fields.TIPOARQUIVO = dataFormatSankhya(tipoDoc);
        fields.NUNOTA = dataFormatSankhya(nunota);
        fields.LABEL = dataFormatSankhya(descricao);
        fields.DOCUMENTO = dataFormatSankhya(img);
        fields.AVALIACAO = dataFormatSankhya("E")

        // Salvar no banco de dados usando a função saveRecord
        saveRecord(entity, fields);
        console.log(entity, fields);

    } catch (error) {
        console.error("Erro ao converter o arquivo:", error);
    }
    
    servicos(emp);
}

async function alterarServico(id,emp){
    let sql = "SELECT DOCUMENTO FROM AD_CADFECHSERVICES WHERE IDSERV = "+id;
    let dados = getDadosSql(sql, true);

    let nunota = $("#nunotaServUpdate").val();
    let descricao = $("#descricaoServUpdate").val();
    let fields = {};


    try {
        let img = await convertDocumentoAtualizado();
        if(!img){
            img = dados[0].DOCUMENTO
        } else{
            let tipoDoc = "";
            if(img.includes("data:image")){
                tipoDoc = "I"
            }else if(img.includes("data:application/pdf")){
                tipoDoc = "P"
            }
            fields.TIPOARQUIVO = dataFormatSankhya(tipoDoc);

        }
        let entity = "AD_CADFECHSERVICES";
        let key = {
            "IDSERV":dataFormatSankhya(id)
        }

        fields.NUNOTA = dataFormatSankhya(nunota);
        fields.LABEL = dataFormatSankhya(descricao);
        fields.DOCUMENTO = dataFormatSankhya(img);
        fields.AVALIACAO = dataFormatSankhya("C")

        // Salvar no banco de dados usando a função saveRecord
        saveRecord(entity, fields, key);
        console.log(entity, fields, key);

    } catch (error) {
        console.error("Erro ao converter o arquivo:", error);
    }
    fechaModal('modalCorrecaoServico')
    servicosReprovados(emp)
}

async function convertDocumentoAtualizado() {
    return new Promise((resolve, reject) => {
        var file = document.getElementById("fileDocUpdate").files;
        let img;
        if (file.length > 0) {
            img = file[0];
            var reader = new FileReader();
            reader.onload = function (e) {
                resolve(e.target.result);
            };
            reader.onerror = function (error) {
                reject(error);
            };
            reader.readAsDataURL(img);
        } else {
            resolve(null)
        }
    });
}