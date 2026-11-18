# Regras do projeto

Meus Gastos: app pessoal para anotar gastos. Irmão do **Meu Semestre**, e deve seguir o mesmo padrão dele, que está no repositório público `AlanaKot/meu-semestre-site`. Leia o `CLAUDE.md`, o `README.md` e o `index.html` de lá antes de mexer aqui.

## Sobre quem usa

- A dona do projeto é iniciante em programação. Explique termos novos em uma frase.
- Respostas curtas e diretas, em português.

## Fluxo de mudanças

- Nunca enviar direto na `main`.
- Toda mudança: criar uma branch, fazer commit, abrir um PR e mandar o link.
- Só fazer merge quando ela pedir ("pode juntar").

## Testes

- `node testes/testar.js` abre o app num navegador invisível e confere as funções principais (precisa de Node e Playwright). Rodar antes de abrir um PR; tem que terminar em "Tudo certo".
- Ao criar ou mudar uma função, acrescentar ou ajustar a conferência dela no mesmo arquivo. Usar só dados inventados.

## Padrão do app

O `index.html` já segue o padrão do `meu-semestre-site`. Ao mexer, manter:

- **Visual:** padrão dos apps do iPhone. Título grande da aba, listas agrupadas em quadros brancos sobre fundo cinza claro (preto no modo escuro), barra de abas embaixo no celular e pílula no topo em telas largas. A cor do app é escolhida pela pessoa no botão Aparência (azul claro do iPhone 14 por padrão, ou bordô), guardada só no aparelho. Fontes do próprio sistema, sem Google Fonts.
- **Arquivos na mesma pasta do `index.html`:** `manifest.webmanifest`, `sw.js` e os ícones `icon-192.png`, `icon-512.png` e `apple-touch-icon.png` (modo aplicativo, funciona sem internet). Ao mudar `sw.js` ou os ícones, aumentar a `VERSAO` dentro do `sw.js`. Os ícones daqui precisam ser novos, não os do semestre.
- **Dados:** `localStorage` do navegador fora do claude.ai. Todo item salvo ganha `_t` (hora da mudança) e todo item apagado vai para `S.apagados`. Backup em `.json` (baixar e importar). Sincronização com o Google Drive é opcional e igual à do semestre; nunca gravar Client ID, chave ou senha no código.
- **Ajustes (`S.config`):** `_ts` guarda a hora de cada ajuste, e `juntarConfig()` junta ajuste por ajuste. Sempre gravar por `salvarConfig()`, nunca direto em `S.config`.
- **Importar backup:** item daqui mais novo que o do arquivo fica; ajustes só entram se faltam aqui.
- **Nomes de quem divide:** as contas guardam `recebido`, `partes` e `fora` pela posição do nome. Ao mudar a lista, `abrirPessoas` refaz essas posições para a marcação acompanhar a pessoa. Qualquer mudança nisso precisa manter essa regra.
- Se uma tela der erro ao desenhar, `render()` mostra um aviso com o botão de backup em vez de ficar em branco.
- Tudo em `index.html`, sem etapa de build. Precisa funcionar hospedado e aberto direto no navegador, sem depender de servidor nem de IA.

## O que o app faz

- **Entradas (`S.receitas`):** salário e outras rendas, anotadas no fim do Painel. "Sobrou no mês" = entradas − gastos.
- **Saldo acumulado:** `saldoAcumulado(m)` soma o que sobrou (entradas − gastos) de cada mês, a partir do primeiro mês com entrada anotada. Não é salvo, é calculado na hora; aparece no quadro "Sobrou no mês" do Painel e na linha "Acumulado" do resumo do ano.
- **Meta de economia:** `S.config.meta`, comparada com o que sobrou no mês.
- **Cartões:** `S.config.cartoes` (`[{id, nome, fechamento}]`; o formato antigo `S.config.fechamento` ainda é lido como um cartão de código vazio). `faturas()` soma os gastos no crédito da fatura aberta e da seguinte de cada cartão; o gasto guarda `cartaoId` e, sem ele, cai no primeiro cartão.
- **Painel recolhível:** os quadros são montados por `secao()`; os recolhidos ficam no `localStorage` (chave `meus-gastos-painel`), só no aparelho. **Ordem dos quadros:** o botão "Reorganizar quadros" (fim do Painel) mostra setas ↑↓; cada uma das duas colunas tem a sua ordem (`COLUNAS`, `coluna()`, `moverQuadro()`), guardada no `localStorage` (chave `meus-gastos-ordem`), só no aparelho e fora do backup. **Resumo do ano** em `abrirAno()`.
- **Janelas de editar:** Cancelar e Salvar lado a lado; as outras ações (Duplicar, Excluir) ficam numa lista `.opcoes` embaixo, uma por linha, para não se espremerem no celular.
- **Primeiros passos** (`primeirosPassos()`): quadro no Painel enquanto não existe categoria e gasto.
- **Painel:** gasto do mês, comparação com o mês anterior, orçamento do mês e quanto resta, média por dia e projeção, gasto por categoria, por forma de pagamento, por dia e nos últimos 6 meses (com uma linha do orçamento, ou do limite da categoria escolhida, e, sem filtro, uma linha do máximo que dava para gastar para bater a meta: entradas − meta), últimos gastos.
- **Gastos:** lista por dia, filtro por categoria, navegação entre meses. Campos: descrição, valor, data, categoria, forma de pagamento (Pix, débito, crédito, dinheiro, boleto). Parcelas (um gasto por mês, só ao criar), "Repetir todo mês", Duplicar e botões "Repetir hoje" (`favoritos()`). Parcelas da mesma compra têm o mesmo `grupo`.
- **Contas (da casa):** a dona paga todas as contas e as amigas mandam o Pix da parte delas. Campos: conta, valor total, vencimento, quem divide (`fora` guarda quem não entra), "Repetir todo mês". Chaves "Paguei a conta" e "Fulana me pagou". Os nomes ficam em `S.config.pessoas`; a divisão é em partes iguais entre quem entra + ela. Botão Cobrar monta a mensagem (com `S.config.pix`, se houver); "Recebi tudo" marca todas as contas em aberto de uma pessoa. `partes` guarda valor fixo por pessoa; o resto divide igual (`parteDe(c, i)` e `minhaParte(c)`). Lembretes: aviso no topo (`avisoContas`), arquivo `.ics` e notificação diária ao abrir.
- A parte dela numa conta paga aparece nos gastos, calculada na hora por `todosGastos()` (não é salva em dobro), na categoria "Casa" (`catCasa()`).
- **Desejos** (`S.desejos`, aba `#desejos`, `vDesejos()` e `abrirDesejo()`): lista do que quero comprar. Campos: nome, preço, quanto já guardei, prioridade, link, observação e foto. A foto é reduzida para 600 px e guardada como JPEG em texto (`reduzirFoto()`), e só é mostrada se passar em `fotoOk()`. "Comprei" arquiva o desejo e abre o gasto já preenchido; "Desisti" arquiva e soma em "Economizei". Entra no backup e na sincronização como as outras coleções (`COLS`).
- **Fixos:** `gerarFixos()` cria a cópia do mês novo com código `série-mês`, para dois aparelhos sincronizados não duplicarem.
- **Categorias:** nome, cor e limite mensal opcional, com barra de progresso (verde, amarelo, vermelho).
- Apagar uma categoria apaga também os gastos dela, com confirmação. Apagar gasto ou conta oferece Desfazer.
- **Busca** (lupa), **exportar CSV** e **conferir extrato OFX** (`revisarOFX`): concilia cada linha com gastos já anotados, contas da casa e Pix recebido de quem divide, com revisão antes de aplicar; `ofx` no item e `ofxRec` na conta evitam repetir. As categorias escolhidas são aprendidas em `S.config.regras` (nome da loja -> categoria), editáveis na aba Categorias. PDF de extrato não é lido, de propósito.
- **Sincronização com o Google Drive:** opcional, copiada do semestre (arquivo `meus-gastos.json` na `appDataFolder`).
- Dinheiro em pt-BR (R$ 1.250,00). Aceitar `12,50`, `12.50` e `1.250,00` na digitação.

## Ideias para depois

Ver a lista de melhorias combinadas na issue #10 do repositório.

## Publicação

- O site é publicado pelo GitHub Pages (branch `main`, pasta raiz). O repositório é público, e não tem dado pessoal no código.
- Existe uma cópia do app no claude.ai (https://claude.ai/artifact/SaNn98yvH8JiaZFiunRwRC), para dar uma olhada. Lá os dados ficam na conta do Claude, separados dos do site. Para republicar lá, envie só o conteúdo de dentro do `<head>` (do `<title>` em diante) e do `<body>`, sem as tags `<!doctype>`, `<html>`, `<head>` e `<body>`.
