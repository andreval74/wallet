
let web3Modal;
let provider;
let ethersProvider;
let signer;

function showStatus(msg, type = 'info') {
    const statusDiv = document.getElementById('connectionStatus');
    const messageSpan = document.getElementById('statusMessage');
    statusDiv.className = `alert alert-${type}`;
    statusDiv.classList.remove('d-none');
    messageSpan.textContent = msg;
    if (type === 'success') {
        setTimeout(() => { statusDiv.classList.add('d-none'); }, 4000);
    }
}

// Sempre força a conexão/autenticação ao clicar
async function connectWallet() {
    try {
        showStatus('Abrindo modal de conexão de carteiras...', 'info');
        // Sempre limpa o cache para forçar escolha/autenticação
        if (web3Modal && web3Modal.clearCachedProvider) {
            await web3Modal.clearCachedProvider();
        }
        // Se já existe provider, desconecta para garantir novo fluxo
        if (provider && provider.disconnect) {
            await provider.disconnect();
        }
        provider = await web3Modal.connect();
        ethersProvider = new ethers.providers.Web3Provider(provider);
        signer = ethersProvider.getSigner();

        // Força o usuário a autorizar a conta explicitamente
        if (provider.request) {
            try {
                await provider.request({ method: 'wallet_requestPermissions', params: [{ eth_accounts: {} }] });
            } catch (e) {
                showStatus('Permissão não concedida ou cancelada.', 'danger');
                return;
            }
        }

        // Adiciona listener para troca de conta na extensão
        if (provider.on && !provider._hasAccountListener) {
            provider.on('accountsChanged', async (accounts) => {
                if (accounts && accounts.length > 0) {
                    await updateWalletInfo();
                    showStatus('Conta alterada na carteira. Dados atualizados.', 'info');
                } else {
                    disconnectWallet();
                }
            });
            provider._hasAccountListener = true;
        }

        await updateWalletInfo();
        document.getElementById('walletInfo').classList.remove('d-none');
        showStatus('Carteira conectada com sucesso!', 'success');
    } catch (err) {
        showStatus('Conexão cancelada ou erro: ' + err.message, 'danger');
    }
}

async function updateWalletInfo() {
    if (!signer) return;
    const address = await signer.getAddress();
    document.getElementById('walletAddress').textContent = address;
    const network = await ethersProvider.getNetwork();
    document.getElementById('networkName').textContent = network.name + ' (' + network.chainId + ')';
    const balance = await ethersProvider.getBalance(address);
    document.getElementById('ethBalance').textContent = ethers.utils.formatEther(balance) + ' ETH';
}

async function disconnectWallet() {
    if (provider && provider.disconnect) {
        await provider.disconnect();
    }
    if (web3Modal && web3Modal.clearCachedProvider) {
        await web3Modal.clearCachedProvider();
    }
    provider = null;
    signer = null;
    ethersProvider = null;
    document.getElementById('walletInfo').classList.add('d-none');
    showStatus('Carteira desconectada.', 'info');
}

document.getElementById('connectWallet').onclick = connectWallet;
document.getElementById('disconnectWallet').onclick = disconnectWallet;
document.getElementById('copyAddressBtn').onclick = () => {
    const address = document.getElementById('walletAddress').textContent;
    navigator.clipboard.writeText(address);
    showStatus('Endereço copiado!', 'success');
};

window.addEventListener('DOMContentLoaded', () => {
    web3Modal = new window.Web3Modal.default({
        cacheProvider: false,
        providerOptions: {}
    });
});
