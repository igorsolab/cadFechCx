function enviarImagem(){

        let buscaNotasReprovadas = `
        <div class="container">
            <div class="col d-flex justify-content-center text-left">
                <div class="card mb-3">
                    <div class="card-header bg-transparent">Buscar:</div>
                    <div class="card-body">
                        ${selectEmpresa('enviarImagem','')}
                        <button type="submit" onclick="cadastroDeImagens()" style="width:100%;" class="btn btn-primary mb-3 mt-3">Buscar</button>
                    </div>
                </div>
            </div>
        </div>
        <div id="dados_fech"></div>
        `;
        return buscaNotasReprovadas;
}

function cadastroDeImagens(){
    let numberEmpresa = $("#enviarImagem").val();
    let sql = `
    select ac3.IMG01_ENV ,ac.DHFECH, ac.IDFECH,t2.NOMEFANTASIA, t.NOMEUSUCPLT from AD_CADFECHCAIXA ac 
    inner join AD_CONFERENCIACEGA ac2 on ac2.IDCONFCEGA = ac.IDCONFCEGA 
    inner join TSIUSU t on ac.CODUSU = t.CODUSU
    inner join TSIEMP t2 on t2.CODEMP = ac.CODEMP 
    left join AD_CADFECHIMG ac3 on ac3.IDFECH = ac.IDFECH 
    where ac.CONFIRMACAO = 'S'
    AND ac.CODEMP = ${numberEmpresa}
    `

    let dadosCadImagens = getDadosSql(sql, true);
    relacaoDadosPendentes(dadosCadImagens)
}

function relacaoDadosPendentes(dados){

    console.log(dados)
    let cardsPendentes = "<div class='container'><div class='row'>"
    dados.map((e)=>{
        let data = e.DHFECH.split(" ");
        let dataFormatada = formatandoData(data[0])+" "+data[1]
        let status = "";
        let cor_status = ""
        if(e.IMG01_ENV == "S"){
            status = "COMPROVANTE ENVIADO"
            cor_status = "bg-success text-white"
        }else{
            status = "PENDENTE"
            cor_status = ""
        }

        cardsPendentes += `
        <div class="col-6 mb-3">
            <div class="card">
                <div class="card-header ${cor_status}">${status}</div>
                <div class="card-body d-flex justify-content-between align-items-center">
                <div class="dados_card">
                        <h4 class="card-title">${e.NOMEFANTASIA}</h4>
                        Usuario: ${e.NOMEUSUCPLT} <br/> Data: ${dataFormatada}<br/>
                        ID: ${e.IDFECH}
                    </div>
                    <div>
                        <button onclick="documentoIsChecked(${e.IDFECH})" class="btn btn-secondary"><span title="Adicionar Imagens"><i class="bi bi-images"></i></span></button>
                    </div>
                </div>
            </div>
        </div>
        `;
    })
    cardsPendentes+="</div></div>"
    $("#dados_fech").empty()
    $("#dados_fech").append(cardsPendentes);
}
function formatandoData(data){
    return data.replace(/(\d{2})(\d{2})(\d{4})/, "$1/$2/$3")
}

function documentoIsChecked(idfech){

    let sql = `SELECT COUNT(*) FROM AD_CADFECHIMG WHERE IDFECH = ${idfech} `;
    let qtdFotos =  getDadosSql(sql);
    console.log(qtdFotos)

    // se nao existir o registo de fotos , cria o registro no sankhya
    if(qtdFotos[0][0] == 0 ) {
        criaRegFotos(idfech);
        console.log("nao tem foto");
    } 
    console.log(sql)

    sql = `SELECT * FROM AD_CADFECHIMG WHERE IDFECH = ${idfech}`
    console.log(sql)

    let imgs = getDadosSql(sql, true)
    let documentos = `
                <div class="row mt-3">
                    <div class="col-3">
                        <div class="card">
                            <div class="card-body" style="height: 200px;">
                                <img style="display:block; width:100%;height:100%;" id="img1" src="${imgs[0].IMG01}" />
                            </div>
                            <div class="card-footer">
                                <label class="form-label">Selecione a Imagem</label>
                                <input type="file" onchange="convertImage(${idfech},${imgs[0].IDIMG},1)" class="form-control form-control-sm" id="img01" name="img01">
                                <label class="form-label">Descricao do comprovante</label>
                                <input id="txt1" onfocusout="salvarTexto(${idfech},${imgs[0].IDIMG},1)" type="text" class="form-control" placeholder="Titulo do comprovante"/>
                            </div>
                        </div>
                    </div>
                    <div class="col-3">
                        <div class="card">
                            <div class="card-body" style="height: 200px;">
                                <img style="display:block; width:100%;height:100%;" id="img2" src="${imgs[0].IMG02}" />
                            </div>
                            <div class="card-footer">
                                <label class="form-label">Selecione a Imagem</label>
                                <input type="file" onchange="convertImage(${idfech},${imgs[0].IDIMG},2)" class="form-control form-control-sm" id="img02" name="img02">
                                <label class="form-label">Descricao do comprovante</label>
                                <input id="txt2" onfocusout="salvarTexto(${idfech},${imgs[0].IDIMG},2)" type="text" class="form-control" placeholder="Titulo do comprovante"/>
                            </div>
                        </div>
                    </div>
                    <div class="col-3">
                        <div class="card">
                            <div class="card-body" style="height: 200px;">
                                <img style="display:block; width:100%;height:100%;" id="img3" src="${imgs[0].IMG03}" />
                            </div>
                            <div class="card-footer">
                                <label class="form-label">Selecione a Imagem</label>
                                <input type="file" onchange="convertImage(${idfech},${imgs[0].IDIMG},3)" class="form-control form-control-sm" id="img03" name="img03">
                                <label class="form-label">Descricao do comprovante</label>
                                <input id="txt3" onfocusout="salvarTexto(${idfech},${imgs[0].IDIMG},3)" type="text" class="form-control" placeholder="Titulo do comprovante"/>
                            </div>
                        </div>
                    </div>  
                    <div class="col-3">
                        <div class="card">
                            <div class="card-body" style="height: 200px;">
                                <img style="display:block; width:100%;height:100%;" id="img4" src="${imgs[0].IMG04}" />
                            </div>
                            <div class="card-footer ">
                                <label class="form-label">Selecione a Imagem</label>
                                <input type="file" onchange="convertImage(${idfech},${imgs[0].IDIMG},4)" class="form-control form-control-sm" id="img04" name="img04">
                                <label class="form-label">Descricao do comprovante</label>
                                <input id="txt4" onfocusout="salvarTexto(${idfech},${imgs[0].IDIMG},4)" type="text" class="form-control" placeholder="Titulo do comprovante"/>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="row mt-3">
                    <div class="col-3">
                        <div class="card">
                            <div class="card-body" style="height: 200px;">
                                <img style="display:block; width:100%;height:100%;" id="img5" src="${imgs[0].IMG05}" />
                            </div>
                            <div class="card-footer">
                                <label class="form-label">Selecione a Imagem</label>
                                <input type="file" onchange="convertImage(${idfech},${imgs[0].IDIMG},5)" class="form-control form-control-sm" id="img05" name="img05">
                                <label class="form-label">Descricao do comprovante</label>
                                <input id="txt5" onfocusout="salvarTexto(${idfech},${imgs[0].IDIMG},5)" type="text" class="form-control" placeholder="Titulo do comprovante"/>
                            </div>
                        </div>
                    </div>
                    <div class="col-3">
                        <div class="card">
                            <div class="card-body" style="height: 200px;">
                                <img style="display:block; width:100%;height:100%;" id="img6" src="${imgs[0].IMG06}" />
                            </div>
                            <div class="card-footer">
                                <label class="form-label">Selecione a Imagem</label>
                                <input type="file" onchange="convertImage(${idfech},${imgs[0].IDIMG},6)" class="form-control form-control-sm" id="img06" name="img06">
                                <label class="form-label">Descricao do comprovante</label>
                                <input id="txt6" onfocusout="salvarTexto(${idfech},${imgs[0].IDIMG},6)" type="text" class="form-control" placeholder="Titulo do comprovante"/>
                            </div>
                        </div>
                    </div>
                    <div class="col-3">
                        <div class="card">
                            <div class="card-body" style="height: 200px;">
                                <img style="display:block; width:100%;height:100%;" id="img7" src="${imgs[0].IMG07}" />
                            </div>
                            <div class="card-footer">
                                <label class="form-label">Selecione a Imagem</label>
                                <input type="file" onchange="convertImage(${idfech},${imgs[0].IDIMG},7)" class="form-control form-control-sm" id="img07" name="img07">
                                <label class="form-label">Descricao do comprovante</label>
                                <input id="txt7" onfocusout="salvarTexto(${idfech},${imgs[0].IDIMG},7)" type="text" class="form-control" placeholder="Titulo do comprovante"/>
                            </div>
                        </div>
                    </div>
                    <div class="col-3">
                        <div class="card">
                            <div class="card-body" style="height: 200px;">
                                <img style="display:block; width:100%;height:100%;" id="img8" src="${imgs[0].IMG08}" />
                            </div>
                            <div class="card-footer">
                                <label class="form-label">Selecione a Imagem</label>
                                <input type="file" onchange="convertImage(${idfech},${imgs[0].IDIMG},8)" class="form-control form-control-sm" id="img08" name="img08">
                                <label class="form-label">Descricao do comprovante</label>
                                <input id="txt8" onfocusout="salvarTexto(${idfech},${imgs[0].IDIMG},8)" type="text" class="form-control" placeholder="Titulo do comprovante"/>
                            </div>
                        </div>
                    </div>
                </div>`

        modalCadImagens(documentos)

        $("#txt1").val(imgs[0].IMG01LABEL)
        $("#txt2").val(imgs[0].IMG02LABEL)
        $("#txt3").val(imgs[0].IMG03LABEL)
        $("#txt4").val(imgs[0].IMG04LABEL)
        $("#txt5").val(imgs[0].IMG05LABEL)
        $("#txt6").val(imgs[0].IMG06LABEL)
        $("#txt7").val(imgs[0].IMG07LABEL)
        $("#txt8").val(imgs[0].IMG08LABEL)
}

function modalCadImagens(doc){
    let modal = `
    
    <div class="modal fade" id="modalImagens" tabindex="-1">
        <div class="modal-dialog modal-xl">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Cadastrar comprovantes</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" onclick="fechaModal()" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    ${doc}
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" onclick="fechaModal()" data-bs-dismiss="modal">Fechar</button>
                </div>
            </div>
        </div>
    </div>
    `
    $('body').append(modal)

    var myModal = new bootstrap.Modal(document.getElementById('modalImagens'), {
        keyboard: false
    })

    myModal.show()
}

function salvarTexto(idfech,idimg,number){
    let texto = $("#txt"+number).val();
    
    let entity = "AD_CADFECHIMG";
    let fields = {}
    let key = {
        "IDIMG" : dataFormatSankhya(idimg)
    }

    fields["IMG0"+number+"LABEL"] = dataFormatSankhya(texto)
    saveRecord(entity,fields,key)
    console.log(entity,fields,key)

}

function fechaModal(){
    console.log("Fechando Modal")
    var myModal = new bootstrap.Modal(document.getElementById('modalImagens'), {
        backdrop: false
    })
    myModal.hide()
    $('.modal-backdrop').remove();
    $("#modalImagens").remove()
}
function criaRegFotos(idfech){
    let entity = `AD_CADFECHIMG`;
    let criaRegistro = {};
    criaRegistro.IDFECH = dataFormatSankhya(idfech)
    saveRecord(entity,criaRegistro);
}

function convertImage(id,idimg,number){
    var file = document.getElementById("img0"+number).files;
    console.log(document.getElementById("img"+number))
    // Obtenha o arquivo selecionado
    // Verifique se um arquivo foi selecionado
    let fields = {}
    let key = {
        "IDIMG" : dataFormatSankhya(idimg)
    }
    let img;
    if (file.length > 0) {
        img = file[0];
        console.log(img)
        var reader = new FileReader();
        reader.onload = function(e){
                
                result = e.target.result;
                fields["IMG0"+number+"_ENV"] = dataFormatSankhya("S")
                fields["IMG0"+number] = dataFormatSankhya(result)
                saveRecord("AD_CADFECHIMG",fields,key)
                fechaModal()
                documentoIsChecked(id)
            }
            reader.readAsDataURL(img);
        }
    }
