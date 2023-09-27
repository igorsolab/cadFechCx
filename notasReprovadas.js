function selectNotasReprovadas(){
    let buscaNotasReprovadas = `
    <div class="container">
        <div class="col d-flex justify-content-center text-left">
            <div class="card mb-3">
                <div class="card-header bg-transparent">Buscar:</div>
                <div class="card-body">
                    ${selectEmpresa('notasReprovadas','')}
                    <button type="submit" onclick="buscaNotaReprovada()" style="width:100%;" class="btn btn-primary mb-3 mt-3">Buscar</button>
                </div>
            </div>
        </div>
    </div>
    <div id="cards_reprovados"></div>
    `;
    return buscaNotasReprovadas;
}


function buscaNotaReprovada(){
    let empresa = $("#notasReprovadas").val()

    let sql = ` SELECT aac.IDFECH, aac.OBSERVACAO, te.NOMEFANTASIA, tu.NOMEUSUCPLT FROM AD_ACOMPFECHCAIXA aac 
                INNER JOIN TSIEMP te ON aac.CODEMP = te.CODEMP
                INNER JOIN TSIUSU tu ON aac.CODUSU = tu.CODUSU
                WHERE aac.CODEMP = ${empresa} and aac.APROVADO = 'N'`;
    let dadosReprovadas = getDadosSql(sql,true)


    let cardsPendentes = "<div class='container'><div class='row'>"
    dadosReprovadas.map((e)=>{

        cardsPendentes += `
        <div class="col-6 mb-3">
            <div class="card">
                <div class="card-header"></div>
                <div class="card-body d-flex justify-content-between align-items-center">
                <div class="dados_card">
                        <h4 class="card-title">${e.NOMEFANTASIA}</h4>
                        Usuario: ${e.NOMEUSUCPLT}<br/>
                        Observacao: ${e.OBSERVACAO}
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
    $("#cards_reprovados").empty()
    $("#cards_reprovados").append(cardsPendentes);
    console.log(dadosReprovadas)
}
