# Meus Gastos

App pessoal para anotar gastos. Irmão do **Meu Semestre**: mesmo design, mesma arquitetura. Idioma da interface: português do Brasil.

- Artifact publicado (privado): https://claude.ai/artifact/SaNn98yvH8JiaZFiunRwRC
- Referência de design/arquitetura: https://claude.ai/artifact/MhENF93F5skc6ehxVQWa2h (Meu Semestre)
- Repositório do app do semestre: AlanaKot/meu-semestre e AlanaKot/meu-semestre-site. Ao mexer neste projeto, copie as convenções de lá.

## Arquivo
Tudo está em `index.html`: um único arquivo com CSS e JS inline, sem build e sem dependências. Só carrega fontes do Google Fonts (Bricolage Grotesque, Inter, JetBrains Mono).

No Artifact, o arquivo é publicado sem `<!doctype>`, `<html>`, `<head>` ou `<body>` (o publicador envolve). Mantenha `<title>` e `<meta name="claude:viewport-fit-sides">` no topo.

## Design (não mudar sem pedido)
Mesmos tokens do Meu Semestre, no `:root` do `<style>`:
- Fundo `#f6f5f4`, superfície branca, texto azul-marinho `#14213d`, destaque bordô `#7a1f35`.
- Tema escuro em `prefers-color-scheme` e `[data-theme="dark"]` (bordô `#b83a56`).
- Cores semânticas ok/warn/bad com fundos próprios.
- Fontes: `--f-display` Bricolage Grotesque, `--f-body` Inter, `--f-mono` JetBrains Mono (valores e números).
- Componentes: `.panel`, `.card`, `.chip`, `.meter`, `.row`, `.bar`, `.grid2`, `dialog`, `.toast`. Cabeçalho fixo com abas.
- Dinheiro sempre em `--f-mono` com `tabular-nums`, formato `pt-BR` BRL.

## Dados
Coleções (db do Artifact, regra `read: owner, write: owner`):
- `categorias`: `{nome, orcamento (limite mensal, opcional), cor}`
- `gastos`: `{descricao, valor, data "YYYY-MM-DD", categoriaId, pagamento}`
- doc `config/geral`: `{orcamento}` (orçamento total do mês, opcional)
- `exemplo: true` marca itens de demonstração; o botão "Apagar exemplos" remove todos.

Sem o capability `db` (arquivo aberto fora do Claude) o app cai para `localStorage` (chave `meus-gastos-v1`). Capabilities declaradas na publicação: `db` e `downloads` (backup .json).

Apagar uma categoria apaga também os gastos dela, com confirmação de dois cliques.

## Telas
Painel (total do mês, orçamento, média/dia e projeção, por categoria com limite, gasto por dia, últimos gastos), Gastos (lista por dia com filtro de categoria), Categorias (limite por categoria). Navegação de mês nas três.

## Ideias para a próxima etapa
Gastos recorrentes (aluguel, assinaturas), receitas e saldo, parcelas no crédito, busca por texto, exportar CSV, gráfico dos últimos 6 meses.

## Como publicar uma mudança
Republique o mesmo arquivo no mesmo Artifact (a URL acima). Não mude o `<title>` ("Meus Gastos"). Não coloque dados reais do usuário no código: eles ficam no db.
