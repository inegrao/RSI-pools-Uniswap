const axios = require("axios");
require('dotenv').config();

const API_KEY = process.env.THEGRATH_API;
const endpoint = `https://gateway-arbitrum.network.thegraph.com/api/${API_KEY}/subgraphs/id/FbCGRftH4a3yZugY7TnbYgPJVEv2LvMT6oF1fxPe9aJM`;

async function getChartDataDay(param) {
    const query = `
    {
        pool(id: "${param}") {
            id
            poolDayData(first: 90, orderBy: id, orderDirection: desc) {
                date
                close
                high
                low
                open
                volumeUSD
                feesUSD
                token0Price
                token1Price
                tick
                tvlUSD
            }
            token0 {
                symbol
                decimals
            }
            token1 {
                symbol
                decimals
            }
        }
    }`;

    const { data } = await axios.post(endpoint, {query});

    for (let i = 1; i < data.data.pool.poolDayData.length; i++) {
        if(i > 1) {
            data.data.pool.poolDayData[i].close = data.data.pool.poolDayData[i-1].open;
        }

        //FIXME: Ajuste de erro no grafico.
        if(param == '0xc6962004f452be9203591991d15f6b388e09e8d0') {
            if(data.data.pool.poolDayData[i].date == 1738972800) {
                data.data.pool.poolDayData[i].high = '0.0003820195216312707391077126925881903';
            }
        }                
    }

    return data.data.pool;
}

//cria um range de preços baseado no RSI
async function getPriceRangeBasedOnRecentRSI(param) {
    try {
        const candles = await getChartData(param);

        let recentHigh = null;
        let recentLow = null;

        let currentHigh = -Infinity;
        let currentLow = Infinity;

        let rsiBelow30 = false;
        let rsiAbove70 = false;

        let highest = [];
        let lowest = [];

        let rsiAtual = 0;
        
        for (let i = 0; i <= candles.poolHourData.length; i++) {

            const high = parseFloat(candles.poolHourData[i].high);
            const low = parseFloat(candles.poolHourData[i].low);

            const closePrices = candles.poolHourData.slice(i - 21 + 1, i + 1).map(candle => parseFloat(candle.close));

            const { rsi } = calculateRSI(closePrices);

            if(rsiAtual == 0 && closePrices.length > 0) {
                rsiAtual = rsi;
            }

            highest.push(high); //acumla as máximas
            lowest.push(low); //acumula os minimas
            
            if (rsi < 30) {
                rsiBelow30 = true;
            }

            if (rsi > 80) {
                rsiAbove70 = true;
            } 

            // Saímos do loop se já encontrarmos ambos os extremos
            if (rsiBelow30 && rsiAbove70) {
                break;
            }

        }

        //console.log('RSI atual:', rsiAtual);
        //console.log('total Candkes:', lowest.length);

        recentLow = Math.min(...lowest);
        recentHigh = Math.max(...highest);

        if (recentLow === null || recentHigh === null) {
            throw new Error("Não foi possível encontrar um intervalo válido para o RSI.");
        }

        return {
            lowerPrice: recentLow,
            upperPrice: recentHigh,
            close: parseFloat(candles.poolHourData[0].close),
            periodStartUnix: candles.poolHourData[0].periodStartUnix,
            rsi: rsiAtual,
            candles: lowest.length,
        };

    } catch (error) {
        console.error('Erro ao obter range de preço baseado no RSI recente:', error);
    }
}

async function getChartData(param) {
    const query = `
    {
        pool(id: "${param}") {
            id
            poolHourData(first: 720, orderBy: id, orderDirection: desc) {
                periodStartUnix
                close
                high
                low
                open
                volumeUSD
                feesUSD
            }
        }
    }`;

    const { data } = await axios.post(endpoint, {query});

    //FIXME: Ajuste de erro no grafico. Retirar dia 15/04/2025
    for (let i = 1; i < data.data.pool.poolHourData.length; i++) {
        if(param == '0xc6962004f452be9203591991d15f6b388e09e8d0') {
            if(data.data.pool.poolHourData[i].periodStartUnix == 1738987200) {
                data.data.pool.poolHourData[i].high = '0.0003820195216312707391077126925881903';
            }
            if(data.data.pool.poolHourData[i].periodStartUnix == 1739005200) {
                data.data.pool.poolHourData[i].high = '0.0003837193767086211955103877824026566';
            }
        }                
    }

    //console.log(data.data.pool.poolHourData);

    return data.data.pool;
}

// Calcula o RSI
function calculateRSI(closes) {
    const rsiPeriods = closes.length - 1; // Ajusta o número de períodos baseado no tamanho dos preços fornecidos
  
    let gains = 0;
    let losses = 0;
  
    for (let i = 1; i < closes.length; i++) {
      const change = closes[i] - closes[i - 1];
      if (change > 0) {
        gains += change;
      } else {
        losses -= change;
      }
    }
  
    const averageGain = gains / rsiPeriods;
    const averageLoss = losses / rsiPeriods;
    const rs = averageGain / averageLoss;
    const rsi = 100 - (100 / (1 + rs));

    return { rsi };
}

module.exports = {
    getChartDataDay,
    getPriceRangeBasedOnRecentRSI,
}