# Regras do projeto

Meus Gastos: app pessoal para anotar gastos. Irmão do **Meu Semestre**, e deve seguir o mesmo padrão dele, que está no repositório público `AlanaKot/meu-semestre-site`. Leia o `CLAUDE.md`, o `README.md` e o `index.html` de lá antes de mexer aqui.

## Sobre quem usa

- A dona do projeto é iniciante em programação. Explique termos novos em uma frase.
- Respostas curtas e diretas, em português.

## Fluxo de mudanças

- Nunca enviar direto na `main`.
- Toda mudança: criar uma branch, fazer commit, abrir um PR e mandar o link.
- Só fazer merge quando ela pedir ("pode juntar").

## Padrão do app

O `index.html` já segue o padrão do `meu-semestre-site`. Ao mexer, manter:

- **Visual:** padrão dos apps do iPhone. Título grande da aba, listas agrupadas em quadros brancos sobre fundo cinza claro (preto no modo escuro), barra de abas embaixo no celular e pílula no topo em telas largas. A cor do app é escolhida pela pessoa no botão Aparência (azul claro do iPhone 14 por padrão, ou bordô), guardada só no aparelho. Fontes do próprio sistema, sem Google Fonts.
- **Arquivos na mesma pasta do `index.html`:** `manifest.webmanifest`, `sw.js` e os ícones `icon-192.png`, `icon-512.png` e `apple-touch-icon.png` (modo aplicativo, funciona sem internet). Ao mudar `sw.js` ou os ícones, aumentar a `VERSAO` dentro do `sw.js`. Os ícones daqui precisam ser novos, não os do semestre.
- **Dados:** `localStorage` do navegador fora do claude.ai. Todo item salvo ganha `_t` (hora da mudança) e todo item apagado vai para `S.apagados`. Backup em `.json` (baixar e importar). Sincronização com o Google Drive é opcional e igual à do semestre; nunca gravar Client ID, chave ou senha no código.
- Tudo em `index.html`, sem etapa de build. Precisa funcionar hospedado e aberto direto no navegador, sem depender de servidor nem de IA.

## O que o app faz

- **Entradas (`S.receitas`):** salário e outras rendas, anotadas no fim do Painel. "Sobrou no mês" = entradas − gastos.
- **Cartão:** `S.config.fechamento` (dia) e `faturas()` somam os gastos no crédito da fatura aberta e da seguinte.
- **Painel:** gasto do mês, comparação com o mês anterior, orçamento do mês e quanto resta, média por dia e projeção, gasto por categoria, por forma de pagamento, por dia e nos últimos 6 meses, últimos gastos.
- **Gastos:** lista por dia, filtro por categoria, navegação entre meses. Campos: descrição, valor, data, categoria, forma de pagamento (Pix, débito, crédito, dinheiro, boleto). Parcelas (um gasto por mês, só ao criar), "Repetir todo mês", Duplicar e botões "Repetir hoje" (`favoritos()`). Parcelas da mesma compra têm o mesmo `grupo`.
- **Contas (da casa):** a dona paga todas as contas e as amigas mandam o Pix da parte delas. Campos: conta, valor total, vencimento, quem divide (`fora` guarda quem não entra), "Repetir todo mês". Chaves "Paguei a conta" e "Fulana me pagou". Os nomes ficam em `S.config.pessoas`; a divisão é em partes iguais entre quem entra + ela. Botão Cobrar monta a mensagem (com `S.config.pix`, se houver). `partes` guarda valor fixo por pessoa; o resto divide igual (`parteDe(c, i)` e `minhaParte(c)`). Lembretes: aviso no topo (`avisoContas`), arquivo `.ics` e notificação diária ao abrir.
- A parte dela numa conta paga aparece nos gastos, calculada na hora por `todosGastos()` (não é salva em dobro), na categoria "Casa" (`catCasa()`).
- **Fixos:** `gerarFixos()` cria a cópia do mês novo com código `série-mês`, para dois aparelhos sincronizados não duplicarem.
- **Categorias:** nome, cor e limite mensal opcional, com barra de progresso (verde, amarelo, vermelho).
- Apagar uma categoria apaga também os gastos dela, com confirmação. Apagar gasto ou conta oferece Desfazer.
- **Busca** (lupa), **exportar CSV** e **conferir extrato OFX** (`revisarOFX`): concilia cada linha com gastos já anotados, contas da casa e Pix recebido de quem divide, com revisão antes de aplicar; `ofx` no item e `ofxRec` na conta evitam repetir. As categorias escolhidas são aprendidas em `S.config.regras` (nome da loja -> categoria), editáveis na aba Categorias. PDF de extrato não é lido, de propósito.
- **Sincronização com o Google Drive:** opcional, copiada do semestre (arquivo `meus-gastos.json` na `appDataFolder`).
- Dinheiro em pt-BR (R$ 1.250,00). Aceitar `12,50`, `12.50` e `1.250,00` na digitação.

## Ideias para depois

Saldo acumulado entre meses, mais de um cartão, metas de economia.

## Publicação

- O site é publicado pelo GitHub Pages (branch `main`, pasta raiz). O repositório é público, e não tem dado pessoal no código.
- Existe uma cópia do app no claude.ai (https://claude.ai/artifact/SaNn98yvH8JiaZFiunRwRC), para dar uma olhada. Lá os dados ficam na conta do Claude, separados dos do site. Para republicar lá, envie só o conteúdo de dentro do `<head>` (do `<title>` em diante) e do `<body>`, sem as tags `<!doctype>`, `<html>`, `<head>` e `<body>`.
