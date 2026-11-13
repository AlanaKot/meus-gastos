# Meus Gastos

App pessoal para anotar gastos: painel do mês, lista de gastos e categorias com limite mensal. Irmão do [Meu Semestre](https://github.com/AlanaKot/meu-semestre-site) e feito no mesmo padrão.

## Como usar

O app inteiro é o arquivo `index.html`. Ele funciona de três jeitos:

- **Hospedado** (GitHub Pages), como um site comum.
- **Aberto direto no navegador**: baixe o `index.html` e dê dois cliques.
- **Publicado no claude.ai** como artifact.

Fora do claude.ai, os dados ficam salvos no navegador do aparelho em que você usa o app. Eles não vão para nenhum servidor.

1. Na aba **Categorias**, crie as categorias (Mercado, Transporte, Lazer...). O limite mensal é opcional.
2. Toque no **+** para anotar um gasto. O valor aceita `12,50`, `12.50` e `1.250,00`.
3. No **Painel**, toque em **Orçamento** para definir quanto quer gastar no mês.

As setas ao lado do nome do mês trocam o mês mostrado em todas as abas.

## Contas da casa

A aba **Contas** é para quem divide as contas com outras pessoas.

1. Toque em **Nomes** e coloque quem divide com você (por exemplo `Ana, Bia`). Você já entra na divisão.
2. Toque no **+** para anotar uma conta (luz, internet, aluguel) com o valor total e o vencimento. O app mostra quanto fica para cada pessoa.
3. Em cada conta, ligue **Paguei a conta** quando pagar e **Ana me pagou** quando receber.

O quadro **Quem te deve** soma o que cada pessoa ainda deve em todos os meses. Ao editar uma conta, **Repetir no mês seguinte** cria a mesma conta para o mês que vem.

## Backup

No topo, o botão redondo com uma **caixa** abre o Backup. Ali dá para baixar um arquivo `.json` com todos os dados e importar o arquivo de volta.

Use o backup para levar os dados de um aparelho para outro e para não perder nada se os dados do navegador forem limpos.

## Aparência

O botão redondo com um **círculo** escolhe o tema (automático, claro ou escuro) e a cor do app (azul ou bordô). A escolha vale só naquele aparelho.

## Usar como aplicativo

Com o site hospedado, dá para instalar o Meus Gastos na tela inicial. Ele ganha ícone próprio, abre sem a barra do navegador e funciona **sem internet**.

- **Android (Chrome):** toque em **Instalar**, no topo. Se o botão não aparecer, use o menu ⋮ → **Instalar app**.
- **iPhone (Safari):** toque em Compartilhar → **Adicionar à Tela de Início**.
- **Computador (Chrome ou Edge):** botão **Instalar** no topo, ou o ícone de instalar na barra de endereço.

O app instalado no iPhone guarda os dados separados do Safari, então use o **Backup** para passar de um para o outro.

Para quem mexe no código: os arquivos `manifest.webmanifest`, `sw.js` e os ícones `.png` precisam ficar na mesma pasta do `index.html`. Ao mudar o `sw.js` ou os ícones, aumente a `VERSAO` dentro dele.
