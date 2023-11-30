function enviarImagem(emp){
    return relacaoDadosPendentes(emp)
}

function relacaoDadosPendentes(numberEmpresa){
    let sql = `
		select ac3.IMG_ENV ,
		ac.DHFECH, 
		ac.IDFECH,
		t2.NOMEFANTASIA, 
		t.NOMEUSUCPLT, 
		t2.CODEMP, 
		ac.IDCONFCEGA ,
		ac3.ATIVO 
		from AD_CADFECHCAIXA ac 
            inner join AD_CONFERENCIACEGA ac2 on ac2.IDCONFCEGA = ac.IDCONFCEGA
            inner join TSIUSU t on ac.CODUSU = t.CODUSU
            inner join TSIEMP t2 on t2.CODEMP = ac.CODEMP 
            left join AD_ADCADFECHIMG ac3 on ac3.IDFECH = ac.IDFECH
            WHERE ac.CODEMP = ${numberEmpresa}
            AND 
                ( 	CASE 
                        WHEN ac3.IMG_ENV IS NULL THEN 1
                        WHEN ac3.IMG_ENV = 'N' THEN 1
                        WHEN (select count(*) from AD_ADCADFECHIMG a3 where ATIVO = 'S' AND a3.IDFECH = ac3.IDFECH) = 0 THEN 1
                        ELSE 0
                    END ) = 1
            AND ac.ATIVO = 'S' 
            GROUP BY ac3.IMG_ENV ,ac.DHFECH, ac.IDFECH,t2.NOMEFANTASIA, 	t.NOMEUSUCPLT, 	t2.CODEMP, ac.IDCONFCEGA ,ac3.ATIVO 
            ORDER BY DHFECH`




    let dados = getDadosSql(sql, true);
    console.log(dados)
    
    let cardsPendentes = `
    <style>
        .card-pendente:hover{
            transition:.5s;
            box-shadow: -2px 4px 24px 0px rgba(0,0,0,0.75);
            -webkit-box-shadow: -2px 4px 24px 0px rgba(0,0,0,0.75);
            -moz-box-shadow: -2px 4px 24px 0px rgba(0,0,0,0.75);
        }
    </style>
    <div class='container'><div class='row'>`
    dados.map((e)=>{
        let data = e.DHFECH.split(" ");
        let dataFormatada = formatandoData(data[0])+" "+data[1]

        cardsPendentes += `
        <div class="col-4 mb-3">
            <div class="card card-pendente">
                <div class="card-header bg-warning">PENDENTE</div>
                <div class="card-body d-flex justify-content-between align-items-center">
                    <div class="dados_card">
                        <h4 class="card-title">${e.NOMEFANTASIA}</h4>
                        Usuario: ${e.NOMEUSUCPLT} <br/> Data: ${dataFormatada}<br/>
                    </div>
                    <div>
                        <button onclick="documentoIsChecked(${e.IDFECH})" class="btn btn-secondary">
                            <span title="Adicionar Imagens">
                                <i class="bi bi-images"></i>
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
        `;
    })
    cardsPendentes+="</div></div>"
    let envioImagens = $("#envioImagens")
    envioImagens.empty();
    envioImagens.append(cardsPendentes)
    console.log(envioImagens)
    return cardsPendentes;
}
function formatandoData(data){
    return data.replace(/(\d{2})(\d{2})(\d{4})/, "$1/$2/$3")
}


function documentoIsChecked(idfech){
    $("body").css("overflow","auto")

    // let sql = `SELECT COUNT(*) FROM AD_ADCADFECHIMG WHERE IDFECH = ${idfech} AND ATIVO = 'S'`;
    // let qtdFotos =  getDadosSql(sql);

    // se nao existir o registro de fotos , cria o registro no banco de dados
    // if(qtdFotos[0][0] == 0 ) {
    //     criaRegFotos(idfech);
    // } 

    let sql = `SELECT * FROM AD_ADCADFECHIMG WHERE IDFECH = ${idfech} AND ATIVO = 'S'`

    let imgs = getDadosSql(sql, true)
    let comprovantes = `<div class="row mt-3" id="image-container">`

    for (let i = 0; i < imgs.length; i++) {
        const imgKey = `IMG`;

        // var blobImage = dataURLtoBlob(imgs[i].IMG)
        // var arquivoImage = new File([blob], "comprovanteEnviado.png")


        if (imgs[i].IDIMG != null) {
            comprovantes += `
            <div class="col-3">
                <div class="card card-comprovante">
                    <div class="card-body" style="height: 200px;">
                        <img style="display:block; width:100%;height:100%;" id="img${i}" src="${imgs[i][imgKey]}" />
                    </div>
                    <div class="card-footer">
                        <label class="form-label">Selecione a Imagem</label>
                        <input type="file" class="form-control form-control-sm" id="fileImg${i}" name="fileImg${i}">
                        <label class="form-label">Descricao do comprovante</label>
                        <input id="txt${i}" type="text" value="${imgs[i].IMG_LABEL == undefined || imgs[i].IMG_LABEL == null ? "" : imgs[i].IMG_LABEL}" class="form-control" placeholder="Titulo do comprovante"/>
                        <label class="form-label">NUNOTA:</label>
                        <input id="nunota${i}" type="number" class="form-control" value="${imgs[i].NUNOTA == undefined || imgs[i].NUNOTA == null ? "" : imgs[i].NUNOTA }" placeholder="NUNOTA"/>
                        <button class="btn btn-primary mt-3" style="width:100%" onclick="salvarComprovante(${idfech}, ${i} , ${imgs[i].IDIMG})">Salvar</button>
                    </div>
                </div>
            </div>
            `
        }

    }
    
    comprovantes+=`</div>`;
    let button = `<button class="btn btn-primary col-3" onclick="addImageField(${idfech})">Adicionar comprovantes</button>`
    // comprovantes.appendChild(addButton);
    modalCadImagens(comprovantes,button);

}

function criaRegFotos(idfech){
    let fields = {}
    fields.IDFECH = dataFormatSankhya(idfech)
    fields.IMG_ENV = dataFormatSankhya("N")
    let entity = "AD_ADCADFECHIMG"
    saveRecord(entity,fields)
    console.log("Estou no Cria Registro Fotos")
}

// Função para adicionar mais campos de imagem (se desejar)
function addImageField(idfech) {
    const container = document.getElementById("image-container");
    const cardCount = container.querySelectorAll(".card-comprovante").length;

    if (cardCount < 50) { // Limite de 8 imagens
        const imageCount = cardCount + 1;

        const colDiv = document.createElement("div");
        colDiv.classList.add("col-3");

        const cardDiv = document.createElement("div");
        cardDiv.classList.add("card","card-comprovante");

        const cardBodyDiv = document.createElement("div");
        cardBodyDiv.classList.add("card-body");
        cardBodyDiv.style.height = "200px";

        const img = document.createElement("img");
        img.style.display = "block";
        img.style.width = "100%";
        img.style.height = "100%";
        img.src = null

        cardBodyDiv.appendChild(img);

        const cardFooterDiv = document.createElement("div");
        cardFooterDiv.classList.add("card-footer");

        const label1 = document.createElement("label");
        label1.classList.add("form-label");
        label1.textContent = "Selecione a Imagem";

        const input1 = document.createElement("input");
        input1.type = "file";
        input1.classList.add("form-control", "form-control-sm");
        input1.id = `fileImg${imageCount}`;
        input1.name = `fileImg${imageCount}`;

        const label2 = document.createElement("label");
        label2.classList.add("form-label");
        label2.textContent = "Descricao do comprovante";

        const input2 = document.createElement("input");
        input2.type = "text";
        input2.classList.add("form-control");
        input2.placeholder = "Titulo do comprovante";
        input2.id = `txt${imageCount}`;

        const label3 = document.createElement("label");
        label3.classList.add("form-label");
        label3.textContent = "NUNOTA:";

        const input3 = document.createElement("input");
        input3.type = "text";
        input3.classList.add("form-control");
        input3.placeholder = "NUNOTA";
        input3.id = `nunota${imageCount}`;

        const button = document.createElement("button");
        button.type = "text";
        button.classList.add("btn","btn-primary","mt-3");
        button.style.width = "100%"
        button.textContent = "Salvar";
        button.addEventListener("click", () => salvarComprovante(idfech, imageCount));

        cardFooterDiv.appendChild(label1);
        cardFooterDiv.appendChild(input1);
        cardFooterDiv.appendChild(label2);
        cardFooterDiv.appendChild(input2);        
        cardFooterDiv.appendChild(label3);
        cardFooterDiv.appendChild(input3);
        cardFooterDiv.appendChild(button)

        cardDiv.appendChild(cardBodyDiv);
        cardDiv.appendChild(cardFooterDiv);
        colDiv.appendChild(cardDiv);
        container.appendChild(colDiv);
        console.log(container)

    }
}


function dataURLtoBlob(dataURL) {
    var arr = dataURL.split(',');
    var mime = arr[0].match(/:(.*?);/)[1];
    var b64Data = atob(arr[1]);
    var n = b64Data.length;
    var u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = b64Data.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  }

function modalCadImagens(doc,button){
    let modal = `
    
    <div class="modal fade" id="modalImagens" tabindex="-1">
        <div class="modal-dialog modal-xl">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Cadastrar comprovantes</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" onclick="fechaModal('modalImagens')" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    ${doc}
                </div>
                <div class="modal-footer">
                    ${button}
                    <button type="button" class="btn btn-secondary" onclick="fechaModal('modalImagens')" data-bs-dismiss="modal">Fechar</button>
                </div>
            </div>
        </div>
    </div>
    `
    $('body').append(modal)

    var myModal = new bootstrap.Modal(document.getElementById('modalImagens'), {
        keyboard: false,
        backdrop: false
    })

    myModal.show()
}

function fechaModal(modal){
    console.log("Fechando Modal")
    var myModal = new bootstrap.Modal(document.getElementById(`${modal}`), {
        backdrop: false
    })
    myModal.hide()
    $(`#${modal}`).remove();
    var modalBackdrop = document.querySelector('.modal-backdrop');
    if (modalBackdrop) {
        modalBackdrop.remove(); // Remove o backdrop manualmente
    }
}

// cadServicos
async function convertImage(i) {
    return new Promise((resolve, reject) => {
        var file = document.getElementById("fileImg"+i).files;
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
            reject(console.error("Nenhum arquivo selecionado"));
        }
    });
}

async function salvarComprovante(idfech, num, idimg) {

    console.log(idimg)
    let nunota = $("#nunota"+num).val();
    let descricao = $("#txt"+num).val();

    try {
        let entity = "AD_ADCADFECHIMG";
        let fields = {};
        let key = {};
        
        if(idimg==undefined || idimg == null || idimg == ""){
            let img = await convertImage(num);
            fields.NUNOTA = dataFormatSankhya(nunota);
            fields.IMG_LABEL = dataFormatSankhya(descricao);
            fields.IMG_ENV = dataFormatSankhya("S")
            fields.ATIVO = dataFormatSankhya("S")
            fields.IMG = dataFormatSankhya(img);
            fields.IDFECH = dataFormatSankhya(idfech)
            saveRecord(entity, fields);
        }
        else {            
            key = {
                "IDIMG":dataFormatSankhya(idimg),
                "IDFECH": dataFormatSankhya(idfech)
            }

            try {
                let img = await convertImage(num)
                if(img)
                    fields.IMG = dataFormatSankhya(img)
            } catch(error) {
                console.log(error)
            }
            fields.NUNOTA = dataFormatSankhya(nunota);
            fields.IMG_LABEL = dataFormatSankhya(descricao);
            saveRecord(entity, fields, key);
        }
        console.log(fields)
        // Salvar no banco de dados usando a função saveRecord
    } catch (error) {
        console.error("Erro ao converter o arquivo:", error);
    }
    fechaModal('modalImagens');
    documentoIsChecked(idfech)
}


// fim cadastro de servicos

// function convertImage(id,idimg,number){

//     var file = document.getElementById("fileImg"+number).files;
//     console.log(document.getElementById("img"+number))
//     // Obtenha o arquivo selecionado
//     // Verifique se um arquivo foi selecionado
//     let fields = {}
//     let key = {
//         "IDIMG" : dataFormatSankhya(idimg),
//         "IDFECH" : dataFormatSankhya(id)
//     }
//     let img;
//     if (file.length > 0) {
//         img = file[0];
//         console.log(img)
//         var reader = new FileReader();
//         reader.onload = function(e){     
//                 result = e.target.result;
//                 fields["IMG_ENV"] = dataFormatSankhya("S")
//                 fields["IMG"] = dataFormatSankhya(result)
//                 saveRecord("AD_ADCADFECHIMG",fields,key)

//         }
//         reader.readAsDataURL(img);
//         }
//     }