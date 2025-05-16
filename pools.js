
async function list(params) {
    return [
        {
            poolAddress: "0xc6962004f452be9203591991d15f6b388e09e8d0",
            pair: "WETH/USDC",
            chain: "Arbitrum",
            chainId: 42161,
            feetier: 0.05,
        },
        {
            poolAddress: "0x2f5e87c9312fa29aed5c179e456625d79015299c",
            pair: "WBTC/WETH",
            chain: "Arbitrum",
            chainId: 42161,
            feetier: 0.05,
        },
        {
            poolAddress: "0x641c00a822e8b671738d32a431a4fb6074e5c79d",
            pair: "WETH/USDT",
            chain: "Arbitrum",
            chainId: 42161,
            feetier: 0.05,
        },
        {
            poolAddress: "0x6f38e884725a116c9c7fbf208e79fe8828a2595f",
            pair: "WETH/USDC",
            chain: "Arbitrum",
            chainId: 42161,
            feetier: 0.01,
        },
        {
            poolAddress: "0x5969efdde3cf5c0d9a88ae51e47d721096a97203",
            pair: "WBTC/USDT",
            chain: "Arbitrum",
            chainId: 42161,
            feetier: 0.05,
        },
        {
            poolAddress: "0xbe3ad6a5669dc0b8b12febc03608860c31e2eef6",
            pair: "USDC/USDT",
            chain: "Arbitrum",
            chainId: 42161,
            feetier: 0.01,
        }
    ]
}

module.exports = {
    list
}