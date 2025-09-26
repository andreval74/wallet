// CryptoWallet Manager - JavaScript
// Gerenciamento de carteiras de criptomoedas com Web3

class WalletManager {
    constructor() {
        this.currentAccount = null;
        this.web3Provider = null;
        this.isConnected = false;
        this.init();
    }

    // Inicializa o aplicativo
    init() {
        this.setupEventListeners();
        // Removido checkWalletConnection() para sempre aparecer como primeira vez
        this.detectAccountChanges();
    }

    // Configura os event listeners
    setupEventListeners() {
        const connectBtn = document.getElementById('connectWallet');
        const disconnectBtn = document.getElementById('disconnectWallet');

        connectBtn.addEventListener('click', () => this.connectWallet());
        disconnectBtn.addEventListener('click', () => this.disconnectWallet());
    }

    // Verifica se há carteiras instaladas
    checkWalletAvailability() {
        const wallets = {
            metamask: typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask,
            walletConnect: typeof window.WalletConnect !== 'undefined',
            coinbase: typeof window.ethereum !== 'undefined' && window.ethereum.isCoinbaseWallet
        };

        return wallets;
    }

    // Mostra status de conexão
    showStatus(message, type = 'info') {
        const statusDiv = document.getElementById('connectionStatus');
        const messageSpan = document.getElementById('statusMessage');
        
        statusDiv.className = `alert alert-${type}`;
        statusDiv.classList.remove('d-none');
        messageSpan.textContent = message;

        // Auto hide após 5 segundos para mensagens de sucesso
        if (type === 'success') {
            setTimeout(() => {
                statusDiv.classList.add('d-none');
            }, 5000);
        }
    }

    // Conecta/Seleciona conta na carteira (sempre força autenticação)
    async connectWallet() {
        try {
            this.showStatus('Verificando carteiras disponíveis...', 'info');

            // Verifica se MetaMask está disponível
            if (typeof window.ethereum === 'undefined') {
                this.showStatus(
                    'Nenhuma carteira detectada. Instale MetaMask ou outra carteira compatível.', 
                    'warning'
                );
                this.showWalletInstallGuide();
                return;
            }

            this.showStatus('Abrindo MetaMask para conectar conta... Insira sua senha se solicitada.', 'info');

            // SEMPRE força o usuário a selecionar/autenticar a conta no MetaMask
            // Isto garante que o usuário tenha que inserir a senha e confirmar a conta
            await window.ethereum.request({
                method: 'wallet_requestPermissions',
                params: [{ eth_accounts: {} }]
            });

            this.showStatus('Obtendo dados da conta conectada...', 'info');

            // Após confirmação, obtém as contas autorizadas
            const accounts = await window.ethereum.request({
                method: 'eth_accounts'
            });

            if (accounts.length > 0) {
                this.currentAccount = accounts[0];
                this.isConnected = true;
                this.web3Provider = window.ethereum;

                this.showStatus('Conta conectada com sucesso!', 'success');
                
                // Carrega informações da carteira
                await this.loadWalletInfo();
                this.showWalletInfo();
                
                // Atualiza interface
                this.updateConnectedInterface();
                
                // Log para desenvolvimento
                console.log('✅ Conta conectada:', this.currentAccount);
                console.log('🌐 Rede atual:', await this.getCurrentNetwork());
            } else {
                this.showStatus('Nenhuma conta foi conectada.', 'warning');
            }

        } catch (error) {
            console.error('Erro ao conectar conta:', error);
            
            if (error.code === 4001) {
                this.showStatus('Conexão cancelada pelo usuário.', 'warning');
            } else if (error.code === -32002) {
                this.showStatus('Já existe uma solicitação pendente no MetaMask. Verifique a extensão.', 'info');
            } else {
                this.showStatus('Erro ao conectar conta. Tente novamente.', 'danger');
            }
        }
    }

    // Desconecta da carteira
    disconnectWallet() {
        this.currentAccount = null;
        this.isConnected = false;
        this.web3Provider = null;

        // Oculta informações da carteira
        document.getElementById('walletInfo').classList.add('d-none');
        document.getElementById('extraFeatures').classList.add('d-none');
        document.getElementById('connectionStatus').classList.add('d-none');

        // Restaura estado inicial
        const connectBtn = document.getElementById('connectWallet');
        connectBtn.innerHTML = '<i class="bi bi-link-45deg"></i> Conectar Conta';
        connectBtn.disabled = false;

        this.showStatus('Carteira desconectada.', 'info');
    }

    // Carrega informações da carteira
    async loadWalletInfo() {
        try {
            if (!this.currentAccount || !this.web3Provider) return;

            // Obtém informações da rede
            const chainId = await this.web3Provider.request({ method: 'eth_chainId' });
            const networkName = this.getNetworkName(chainId);

            // Obtém saldo ETH
            const balance = await this.web3Provider.request({
                method: 'eth_getBalance',
                params: [this.currentAccount, 'latest']
            });

            const ethBalance = this.weiToEth(balance);

            // Atualiza interface com as informações
            document.getElementById('walletAddress').textContent = this.formatAddress(this.currentAccount);
            document.getElementById('networkName').innerHTML = `<span class="network-badge">${networkName}</span>`;
            document.getElementById('ethBalance').innerHTML = `<span class="balance-highlight">${ethBalance} ETH</span>`;

        } catch (error) {
            console.error('Erro ao carregar informações da carteira:', error);
            this.showStatus('Erro ao carregar informações da carteira.', 'warning');
        }
    }

    // Converte Wei para ETH
    weiToEth(wei) {
        const eth = parseInt(wei, 16) / Math.pow(10, 18);
        return eth.toFixed(4);
    }

    // Formata endereço da carteira
    formatAddress(address) {
        return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
    }

    // Obtém nome da rede
    getNetworkName(chainId) {
        const networks = {
            '0x1': 'Ethereum Mainnet',
            '0x3': 'Ropsten Testnet',
            '0x4': 'Rinkeby Testnet',
            '0x5': 'Goerli Testnet',
            '0x89': 'Polygon Mainnet',
            '0x13881': 'Polygon Mumbai',
            '0x38': 'BSC Mainnet',
            '0x61': 'BSC Testnet',
            '0xa': 'Optimism',
            '0xa4b1': 'Arbitrum One'
        };

        return networks[chainId] || `Rede Desconhecida (${chainId})`;
    }

    // Obtém informações da rede atual - útil para logs e debugging
    async getCurrentNetwork() {
        try {
            if (!this.web3Provider) return null;
            
            const chainId = await this.web3Provider.request({ method: 'eth_chainId' });
            return {
                chainId: chainId,
                name: this.getNetworkName(chainId)
            };
        } catch (error) {
            console.error('Erro ao obter rede atual:', error);
            return null;
        }
    }

    // Mostra informações da carteira
    showWalletInfo() {
        const walletInfo = document.getElementById('walletInfo');
        const extraFeatures = document.getElementById('extraFeatures');
        
        walletInfo.classList.remove('d-none');
        walletInfo.classList.add('fade-in');
        
        extraFeatures.classList.remove('d-none');
        extraFeatures.classList.add('fade-in');
    }

    // Atualiza interface quando conectado
    updateConnectedInterface() {
        const connectBtn = document.getElementById('connectWallet');
        connectBtn.innerHTML = '<i class="bi bi-arrow-repeat"></i> Alterar Conta';
        connectBtn.disabled = false; // Permite trocar de conta mesmo quando conectado
    }

    // Verifica se carteira está disponível (não conecta automaticamente)
    async checkWalletConnection() {
        // Esta função agora apenas verifica se a carteira está disponível
        // Não conecta automaticamente para sempre aparecer como primeira vez
        return typeof window.ethereum !== 'undefined';
    }

    // Detecta mudanças de conta
    detectAccountChanges() {
        if (typeof window.ethereum !== 'undefined') {
            window.ethereum.on('accountsChanged', (accounts) => {
                // Só atualiza os dados se o usuário já tiver conectado explicitamente
                if (this.isConnected && accounts.length > 0) {
                    this.currentAccount = accounts[0];
                    this.loadWalletInfo();
                    this.showStatus('Conta alterada automaticamente!', 'info');
                } else if (this.isConnected && accounts.length === 0) {
                    // Se estava conectado e agora não há contas, desconecta
                    this.disconnectWallet();
                }
            });

            window.ethereum.on('chainChanged', (chainId) => {
                // Só atualiza se já estiver conectado
                if (this.isConnected) {
                    this.loadWalletInfo();
                    const networkName = this.getNetworkName(chainId);
                    this.showStatus(`Rede alterada para: ${networkName}`, 'info');
                }
            });
        }
    }

    // Mostra guia de instalação de carteiras
    showWalletInstallGuide() {
        const statusDiv = document.getElementById('connectionStatus');
        statusDiv.innerHTML = `
            <div class="alert alert-warning">
                <h6><i class="bi bi-exclamation-triangle"></i> Nenhuma carteira detectada</h6>
                <p class="mb-2">Para usar este aplicativo, você precisa instalar uma carteira crypto:</p>
                <ul class="mb-3">
                    <li><a href="https://metamask.io/" target="_blank" class="text-decoration-none">MetaMask</a> - Mais popular</li>
                    <li><a href="https://wallet.coinbase.com/" target="_blank" class="text-decoration-none">Coinbase Wallet</a></li>
                    <li><a href="https://trustwallet.com/" target="_blank" class="text-decoration-none">Trust Wallet</a></li>
                </ul>
                <small>Após instalar, recarregue a página e clique em "Conectar Carteira".</small>
            </div>
        `;
        statusDiv.classList.remove('d-none');
    }
}

// Funções auxiliares globais
function copyAddress() {
    const addressElement = document.getElementById('walletAddress');
    const address = walletManager.currentAccount;
    
    if (address) {
        navigator.clipboard.writeText(address).then(() => {
            const button = event.target.closest('button');
            const originalClass = button.className;
            
            button.className = 'btn btn-sm copy-success';
            button.innerHTML = '<i class="bi bi-check"></i>';
            
            setTimeout(() => {
                button.className = originalClass;
                button.innerHTML = '<i class="bi bi-copy"></i>';
            }, 2000);
        });
    }
}

function requestAccountChange() {
    if (typeof window.ethereum !== 'undefined') {
        walletManager.showStatus('Abrindo MetaMask para seleção de conta...', 'info');
        
        window.ethereum.request({
            method: 'wallet_requestPermissions',
            params: [{ eth_accounts: {} }]
        }).then(() => {
            walletManager.showStatus('Conta atualizada! Verifique as informações abaixo.', 'success');
        }).catch((error) => {
            console.error('Erro ao solicitar mudança de conta:', error);
            
            if (error.code === 4001) {
                walletManager.showStatus('Atualização de conta cancelada pelo usuário.', 'warning');
            } else if (error.code === -32002) {
                walletManager.showStatus('Já existe uma solicitação pendente no MetaMask.', 'info');
            } else {
                walletManager.showStatus('Erro ao atualizar conta. Tente novamente.', 'danger');
            }
        });
    } else {
        walletManager.showStatus('MetaMask não detectado.', 'warning');
    }
}

// Funções de recursos extras (placeholder)
function loadTransactions() {
    alert('Funcionalidade de histórico de transações em desenvolvimento!');
    // Aqui você implementaria a lógica para buscar transações
}

function loadTokens() {
    alert('Funcionalidade de tokens em desenvolvimento!');
    // Aqui você implementaria a lógica para buscar tokens ERC-20
}

function checkSecurity() {
    alert('Verificação de segurança em desenvolvimento!');
    // Aqui você implementaria verificações de segurança
}

// Inicializa o aplicativo quando o DOM estiver carregado
let walletManager;

document.addEventListener('DOMContentLoaded', () => {
    walletManager = new WalletManager();
    
    // Adiciona um pouco de feedback visual
    console.log('🚀 CryptoWallet Manager iniciado!');
    console.log('💡 Dica: Abra o console para ver logs de desenvolvimento');
});