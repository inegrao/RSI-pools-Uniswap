# RSI Pools Ranges Uniswap V3

Calcula e sugere ranges de preços para pools de liquidez da Uniswap V3 com base em dados históricos de preço e no Indicador de Força Relativa (RSI - Relative Strength Index). Este projeto utiliza dados do TheGraph para buscar informações das pools.

## 🎯 Objetivo

O principal objetivo deste projeto é fornecer uma abordagem automatizada e baseada em dados para auxiliar na definição de ranges de liquidez concentrada em pools da Uniswap V3. A estratégia busca identificar períodos de volatilidade recente, sinalizados por cruzamentos do RSI em níveis de sobrecompra e sobrevenda, para determinar um range de preço observado.

**Atenção:** Este é um projeto para fins de estudo e demonstração técnica. As informações geradas não constituem aconselhamento financeiro. Faça sua própria pesquisa (DYOR) antes de tomar qualquer decisão de investimento.

## ✨ Como Funciona

1.  **Lista de Pools:** O script `app.js` lê uma lista de pools configuradas no arquivo `pools.js` (você precisará criar e configurar este arquivo).
2.  **Busca de Dados:** Para cada pool, o script consulta o subgraph da Uniswap V3 no TheGraph (`thegraph.js`) para obter dados horários de preço (abertura, fechamento, máxima, mínima) das últimas 720 horas (aproximadamente 30 dias).
3.  **Cálculo do RSI:** Com os dados de fechamento, um RSI de X períodos (atualmente configurado para usar os últimos 21 candles disponíveis na iteração) é calculado.
4.  **Definição do Range:**
    *   O script itera sobre os candles horários recentes.
    *   Ele identifica o preço máximo (`upperPrice`) e mínimo (`lowerPrice`) observados durante o período em que o RSI cruzou um limite inferior (ex: <30) e um limite superior (ex: >80).
    *   O range é definido pelos extremos de preço observados *até que ambas as condições de RSI (abaixo de 30 e acima de 80) tenham sido atendidas* dentro da janela de dados analisada.
5.  **Output:** As informações da pool, o range de preço sugerido (normal e inverso), o preço de fechamento mais recente, o RSI atual e o número de candles analisados para o range são exibidos no console.
6.  **Agendamento:** O script `app.js` utiliza `node-cron` para executar essa verificação automaticamente a cada hora (configurável).

## 🛠️ Tecnologias Utilizadas

*   **Node.js:** Ambiente de execução JavaScript.
*   **Axios:** Cliente HTTP para fazer requisições à API do TheGraph.
*   **Node-Cron:** Para agendar a execução periódica do script.
*   **dotenv:** Para gerenciar variáveis de ambiente (como a API Key do TheGraph).
*   **TheGraph:** Para consultar dados on-chain da Uniswap V3.

## ⚙️ Pré-requisitos

*   Node.js (versão 16.x ou superior recomendada)
*   npm ou yarn
*   Uma API Key do TheGraph (você pode obter uma em [TheGraph Studio](https://thegraph.com/studio/) ou usar o gateway público com moderação)

## 🚀 Instalação e Configuração

1.  **Clone o repositório:**
    ```bash
    git clone https://github.com/inegrao/RSI-pools-Uniswap.git
    cd RSI-pools-Uniswap
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    # ou
    # yarn install
    ```

3.  **Configure as Variáveis de Ambiente:**
    Crie um arquivo chamado `.env` na raiz do projeto e adicione sua API Key do TheGraph:
    ```env
    THEGRATH_API=SUA_API_KEY_AQUI
    ```

4.  **Configure as Pools (Importante!):**
    Crie um arquivo chamado `pools.js` na raiz do projeto. Este arquivo deve exportar uma função `list()` que retorna um array de objetos, cada um representando uma pool que você deseja monitorar.

    **Exemplo de `pools.js`:**
    ```javascript
    // pools.js
    async function list() {
        return [
            {
                poolAddress: "0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640", // Ex: USDC/WETH 0.05%
                pair: "USDC/WETH",
                chain: "Ethereum",
                chainId: 1, // Ou o chainId correspondente
                feetier: "0.05%"
            },
            {
                poolAddress: "0xc6962004f452be9203591991d15f6b388e09e8d0", // Ex: WBTC/WETH 0.3%
                pair: "WBTC/WETH",
                chain: "Ethereum",
                chainId: 1,
                feetier: "0.3%"
            }
            // Adicione mais pools conforme necessário
        ];
    }

    module.exports = {
        list,
    };
    ```
    *Adapte os endereços das pools, pares, chains e taxas conforme sua necessidade.*

## ▶️ Como Executar

1.  **Execução Manual (para teste):**
    ```bash
    node app.js
    ```
    Isso executará a função `main()` uma vez e exibirá os resultados no console.

2.  **Execução Agendada (Cron Job):**
    O script já está configurado para rodar a função `main()` a cada hora. Ao executar `node app.js`, o cron job será iniciado e continuará rodando em background (enquanto o processo do Node estiver ativo).

## 📄 Exemplo de Saída no Console (Ilustrativo)
```bash
{
poolAddress: '0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640',
pair: 'USDC/WETH',
chain: 'Ethereum',
chainId: 1,
feetier: '0.05%',
lowerPrice: 0.000485,
upperPrice: 0.000515,
lowerPriceInverse: 2061.85,
upperPriceInverse: 1941.74,
close: 0.000501,
closeInverse: 1996.00,
rsi: 45.67,
candles: 150,
periodStartUnix: 1700000000,
date: '14/11/2023'
}
// ... (mais pools)
```

## ⚠️ Considerações Importantes e Limitações

*   **FIXMEs no Código:** O arquivo `thegraph.js` contém alguns ajustes manuais (`FIXME`) para dados específicos de certas pools e datas. **Estes são apenas placeholders e devem ser removidos ou tratados de forma mais robusta para uso em produção ou análise séria.** Eles foram incluídos no código original para corrigir discrepâncias pontuais nos dados do TheGraph para fins de demonstração.
*   **Lógica de Range:** A lógica atual define o range com base no mínimo e máximo observados até que o RSI cruze ambos os limites (ex: <30 e >80). Esta é uma abordagem simplificada e pode não ser a estratégia de range ideal para todas as condições de mercado.
*   **API Key do TheGraph:** Certifique-se de que sua API Key tem cota suficiente para as consultas, especialmente se monitorar muitas pools ou rodar o script com muita frequência.
*   **Sem Persistência de Dados:** O script apenas exibe os dados no console e não os armazena em um banco de dados.
*   **Precisão do RSI:** O cálculo do RSI é feito com base nos dados horários e na janela de candles disponível na iteração. A precisão pode variar dependendo da qualidade dos dados do TheGraph.

## 💡 Possíveis Melhorias Futuras

*   Implementar estratégias de definição de range mais sofisticadas.
*   Adicionar persistência de dados em um banco de dados.
*   Criar uma interface de usuário (UI) para visualizar os dados.
*   Permitir configuração de parâmetros (períodos do RSI, limites de sobrecompra/sobrevenda) via arquivo de configuração.
*   Adicionar notificações (ex: via Telegram, Discord) para ranges interessantes.
*   Backtesting da estratégia de range.

## 📜 Licença

Este projeto é distribuído sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes. (Você precisará criar um arquivo LICENSE, ex: com o conteúdo da licença MIT).

---
