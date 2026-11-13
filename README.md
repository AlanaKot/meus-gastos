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

A aba **Contas** é para quem paga as contas da casa e divide com outras pessoas.

1. Toque em **Ajustes** e coloque quem divide com você (por exemplo `Ana, Bia`). Você já entra na divisão. Ali também cabe a sua chave Pix, que é opcional.
2. Toque no **+** para anotar uma conta (luz, internet, aluguel) com o valor total e o vencimento. Dá para desligar quem não participa daquela conta.
3. Em cada conta, ligue **Paguei a conta** quando pagar e **Ana me pagou** quando receber.

- **Quem te deve** soma o que cada pessoa ainda deve em todos os meses. O botão **Cobrar** monta a mensagem pronta para mandar.
- Quando você liga **Paguei a conta**, a sua parte entra no Painel como gasto, na categoria **Casa**.
- **Repetir todo mês** faz a conta aparecer sozinha quando o mês vira.

## Gastos que se repetem

- **Repetir todo mês:** para assinaturas e mensalidades. O app cria a cópia quando o mês vira. Para parar, desligue a chave na cópia mais recente.
- **Parcelas:** ao criar um gasto, coloque o número de parcelas. O valor é dividido e cada parcela cai num mês.
- **Duplicar:** na edição de um gasto, cria outro igual com a data de hoje.

## Importar o extrato do banco

No **Backup** (botão da caixa), **Importar extrato do banco (.ofx)** lê o arquivo que o banco oferece em "exportar extrato". OFX é um arquivo de texto com as movimentações.

O app mostra as saídas, você desmarca o que não é gasto seu, escolhe as categorias e importa. Importar o mesmo extrato duas vezes não duplica. O arquivo é lido no próprio aparelho e não é enviado para lugar nenhum.

PDF não é aceito: cada banco monta o PDF de um jeito, e a leitura erraria valores.

## Busca e planilha

- A **lupa**, no topo, procura em gastos e contas de todos os meses.
- No **Backup**, **Exportar gastos em planilha (.csv)** baixa um arquivo que abre no Excel e no Google Planilhas.

## Backup

No topo, o botão redondo com uma **caixa** abre o Backup. Ali dá para baixar um arquivo `.json` com todos os dados e importar o arquivo de volta.

Use o backup para levar os dados de um aparelho para outro e para não perder nada se os dados do navegador forem limpos.

## Sincronizar entre celular e computador (opcional)

Com o site hospedado, os dados podem ficar iguais em todos os aparelhos. Uma cópia fica numa pasta escondida do **seu** Google Drive, que só o app enxerga. Sem internet, o app continua funcionando e sincroniza depois. Se não quiser usar, nada muda.

### Preparar uma vez (no computador, uns 15 minutos)

Se você já fez isso para o Meu Semestre, pode usar o mesmo **ID do cliente**: os dois apps ficam no mesmo endereço. Os nomes dos menus do Google podem mudar um pouco.

1. Entre em [console.cloud.google.com](https://console.cloud.google.com) com sua conta Google e crie um projeto.
2. Em **APIs e serviços → Biblioteca**, procure **Google Drive API** e clique em **Ativar**.
3. Em **Google Auth Platform** (ou **Tela de permissão OAuth**), preencha o nome do app e seu e-mail. Em **Público-alvo**, escolha **Externo** e adicione seu e-mail em **Usuários de teste**.
4. Em **Clientes → Criar cliente**, escolha **Aplicativo da Web**. Em **Origens JavaScript autorizadas**, coloque o endereço do seu site, só o começo (por exemplo `https://seu-usuario.github.io`).
5. Copie o **ID do cliente**. Ele termina em `.apps.googleusercontent.com`. Isso não é senha: só funciona no endereço que você autorizou.

### Ligar em cada aparelho

1. No app, toque no botão redondo com uma **nuvem**, no topo.
2. Cole o ID do cliente e toque em **Conectar com o Google**.
3. Escolha sua conta. O Google pode avisar que o app não foi verificado: como o app é seu, toque em **Continuar**.

Os dados dos aparelhos se juntam, nada é apagado. Depois de cerca de uma hora sem uso, o Google pede para entrar de novo: o fim da página mostra "Toque na nuvem, no topo, para sincronizar". Para desligar: **Backup** → **Sincronização com o Google Drive** → **Desligar neste aparelho**.

## Aparência

O botão redondo com um **círculo** escolhe o tema (automático, claro ou escuro) e a cor do app (azul ou bordô). A escolha vale só naquele aparelho.

## Usar como aplicativo

Com o site hospedado, dá para instalar o Meus Gastos na tela inicial. Ele ganha ícone próprio, abre sem a barra do navegador e funciona **sem internet**.

- **Android (Chrome):** toque em **Instalar**, no topo. Se o botão não aparecer, use o menu ⋮ → **Instalar app**.
- **iPhone (Safari):** toque em Compartilhar → **Adicionar à Tela de Início**.
- **Computador (Chrome ou Edge):** botão **Instalar** no topo, ou o ícone de instalar na barra de endereço.

O app instalado no iPhone guarda os dados separados do Safari, então use o **Backup** para passar de um para o outro.

Para quem mexe no código: os arquivos `manifest.webmanifest`, `sw.js` e os ícones `.png` precisam ficar na mesma pasta do `index.html`. Ao mudar o `sw.js` ou os ícones, aumente a `VERSAO` dentro dele.
