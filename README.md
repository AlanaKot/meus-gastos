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

## Entradas e quanto sobrou

No fim do **Painel**, em **Entradas do mês**, anote o salário e outras rendas (**+ Entrada**). Com elas, o quadro **Sobrou no mês** mostra entradas menos gastos. Uma entrada pode ter **Repetir todo mês**.

## Cartão de crédito

No **Painel**, o quadro **Cartão de crédito** aparece quando existe gasto no crédito. Toque em **Definir** e diga o dia em que a fatura fecha. O app mostra a fatura aberta e a seguinte, somando as compras e parcelas de cada período.

## Contas da casa

A aba **Contas** é para quem paga as contas da casa e divide com outras pessoas.

1. Toque em **Ajustes** e coloque quem divide com você (por exemplo `Ana, Bia`). Você já entra na divisão. Ali também cabe a sua chave Pix, que é opcional.
2. Toque no **+** para anotar uma conta (luz, internet, aluguel) com o valor total e o vencimento. Dá para desligar quem não participa daquela conta.
3. Em cada conta, ligue **Paguei a conta** quando pagar e **Ana me pagou** quando receber.

- **Quem te deve** soma o que cada pessoa ainda deve em todos os meses. O botão **Cobrar** monta a mensagem pronta para mandar.
- Quando você liga **Paguei a conta**, a sua parte entra no Painel como gasto, na categoria **Casa**.
- **Repetir todo mês** faz a conta aparecer sozinha quando o mês vira.
- **Partes diferentes:** no formulário da conta, escreva o valor de quem paga outro tanto. O resto é dividido igualmente entre quem ficou em "igual" e você.
- **Lembretes:** um aviso no topo do app mostra as contas que vencem hoje, amanhã ou estão atrasadas. No botão **Lembretes** dá para baixar um arquivo para a agenda do celular (avisa na véspera, mesmo com o app fechado) e ligar uma notificação diária.

## Gastos que se repetem

- **Repetir todo mês:** para assinaturas e mensalidades. O app cria a cópia quando o mês vira. Para parar, desligue a chave na cópia mais recente.
- **Parcelas:** ao criar um gasto, coloque o número de parcelas. O valor é dividido e cada parcela cai num mês.
- **Duplicar:** na edição de um gasto, cria outro igual com a data de hoje.
- **Repetir hoje:** na aba Gastos, os gastos que você mais repete viram botões. Um toque anota de novo com a data de hoje.
- **Parcelas juntas:** ao editar uma parcela, dá para mudar a categoria e o pagamento de todas, ou excluir todas de uma vez.

## Conferir o extrato do banco

Na aba **Gastos**, o botão **Conferir extrato do banco** lê o arquivo OFX que o banco oferece em "exportar extrato". OFX é um arquivo de texto com as movimentações. O mesmo botão existe no **Backup**.

O app compara cada linha do extrato com o que já está anotado (isso se chama conciliar) e mostra o que vai fazer com cada uma:

- **Gasto novo:** ainda não está no app. Escolha a categoria.
- **Já anotado:** mesmo valor e até 3 dias de diferença de um gasto que você digitou. Só confere, sem criar outro.
- **Conta da casa:** mesmo valor de uma conta ainda não paga. Liga o "Paguei a conta".
- **Pix das contas da casa:** entrada com o valor que uma pessoa te deve. Liga o "me pagou" dela. Vem marcado só quando o nome dela aparece no extrato.
- **Já importado antes**, **pagamento da fatura do cartão** e **dinheiro que só mudou de lugar** (aplicação, resgate, caixinha): vêm desmarcados.

- **Entradas de dinheiro:** marque o que é renda sua (salário, freela) para virar entrada do mês. Vem marcada a que parece com uma entrada já anotada.

Nos gastos novos, o app sugere a categoria. Ele aprende com as suas escolhas: o nome da loja ou pessoa fica guardado com a categoria, e a lista aparece no fim da aba **Categorias**, em **Aprendido do extrato**, onde dá para corrigir ou esquecer.

Só o que estiver marcado é aplicado, e **Cancelar** não muda nada. O que foi conferido ganha a marca "✓ extrato" na lista. O arquivo é lido no próprio aparelho e não é enviado para lugar nenhum.

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
