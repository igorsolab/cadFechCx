function selectNotasReprovadas(empresa){

    let sql = ` SELECT aac.IDFECH, aac.OBSERVACAO, te.NOMEFANTASIA, tu.NOMEUSUCPLT FROM AD_ACOMPFECHCAIXA aac 
                INNER JOIN TSIEMP te ON aac.CODEMP = te.CODEMP
                INNER JOIN TSIUSU tu ON aac.CODUSU = tu.CODUSU
                WHERE te.CODEMP = ${empresa} and aac.APROVADO = 'N'`;
    let dadosReprovadas = getDadosSql(sql,true)

    console.log(sql)
    console.log(dadosReprovadas)

    let cardsPendentes = "<div class='container'><div class='row'>"
    if(dadosReprovadas.length > 0){
        dadosReprovadas.map((e)=>{

        cardsPendentes += `
        <div class="col-6 mb-3">
            <div class="card">
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
    }else{
        cardsPendentes+="<div style='text-align:center;'>Nao houve avaliacao de fechamento</div>"
    }
    cardsPendentes+="</div></div>"

    console.log(cardsPendentes)
    let fechReprovados = $("#fechReprovados");
    fechReprovados.empty()
    fechReprovados.append(cardsPendentes)
}
