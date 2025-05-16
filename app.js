const cron = require('node-cron');

const thegraph = require('./thegraph');
const pools = require('./pools');

async function main() {
    const listPools = await pools.list();
    const result = [];
    for(const pool of listPools) {
        const { poolAddress, pair, chain, chainId, feetier } = pool;
        //const result = await thegraph.getChartDataDay(poolAddress);
        const range = await thegraph.getPriceRangeBasedOnRecentRSI(poolAddress);

        const data = {
            poolAddress: poolAddress,
            pair: pair,
            chain: chain,
            chainId: chainId,
            feetier: feetier,
            lowerPrice: range.lowerPrice,
            upperPrice: range.upperPrice,
            lowerPriceInverse: Number(1/range.lowerPrice),
            upperPriceInverse: Number(1/range.upperPrice),
            close: range.close,
            closeInverse: Number(1/range.close),
            rsi: range.rsi,
            candles: range.candles,
            periodStartUnix: range.periodStartUnix,
            date: new Date(range.periodStartUnix * 1000).toLocaleDateString('pt-BR', { timeZone: timezone }),
        }

        console.log(data);
        
        result.push(data);
    }
    
    return result;
}

const timezone = 'America/Sao_Paulo'; // ou o fuso horário desejado
cron.schedule('0 * * * *', async () => { // Defina o intervalo de execução do cron job (por exemplo, a cada 1 hora)
    console.log('Checando os preços a cada hora', new Date().toISOString());
    try {

        const res = await main();
        console.log(res);

    } catch (error) {
        console.error(error);
    }
}, { scheduled: true, timezone: timezone });

main();