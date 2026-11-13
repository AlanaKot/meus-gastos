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

## O que o app faz (já definido)

- **Painel:** gasto do mês, comparação com o mês anterior, orçamento do mês e quanto resta, média por dia e projeção, gasto por categoria e por dia, últimos gastos.
- **Gastos:** lista por dia, filtro por categoria, navegação entre meses. Campos: descrição, valor, data, categoria, forma de pagamento (Pix, débito, crédito, dinheiro, boleto).
- **Contas (da casa):** contas divididas com quem mora junto. Campos: conta, valor total, vencimento. Em cada conta, chaves para marcar "Paguei a conta" e "Fulana me pagou". Os nomes ficam em `S.config.pessoas`; a divisão é por nomes + 1. Mostra o que falta pagar, o que falta receber e quanto cada pessoa deve somando todos os meses.
- **Categorias:** nome, cor e limite mensal opcional, com barra de progresso (verde, amarelo, vermelho).
- Apagar uma categoria apaga também os gastos dela, com confirmação.
- Dinheiro em pt-BR (R$ 1.250,00). Aceitar `12,50`, `12.50` e `1.250,00` na digitação.

## Ideias para depois

Gastos recorrentes (aluguel, assinaturas), receitas e saldo, parcelas no crédito, busca por texto, exportar CSV, gráfico dos últimos 6 meses.

## Publicação

- O site é publicado pelo GitHub Pages (branch `main`, pasta raiz). O repositório é público, e não tem dado pessoal no código.
- Existe um rascunho no claude.ai (https://claude.ai/artifact/SaNn98yvH8JiaZFiunRwRC) no visual antigo. Se for republicar lá, envie só o conteúdo de dentro do `<head>` (do `<title>` em diante) e do `<body>`, sem as tags `<!doctype>`, `<html>`, `<head>` e `<body>`.
