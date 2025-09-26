# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Common Development Commands

### Running the Application

**Método 1: Script automático (Recomendado para Windows)**
```powershell
# Duplo clique no arquivo start_server.bat
# OU execute no PowerShell:
.\Start-Dev-Server.ps1
```

**Método 2: Comando manual**
```powershell
# Windows PowerShell
Start-Process python -ArgumentList "-m", "http.server", "8000" -PassThru
Start-Process "http://localhost:8000"  # Abre no navegador

# Windows Command Prompt
python -m http.server 8000
start http://localhost:8000
```

**Método 3: Outras alternativas**
```bash
# Node.js http-server (se instalado)
npx http-server -p 8000

# Live Server do VS Code (recomendado para desenvolvimento)
# Right-click em index.html → "Open with Live Server"
```

### Development Server
Since this is a client-side only application, any static file server will work. The project includes:
- `start_server.bat` - Script batch simples
- `Start-Dev-Server.ps1` - Script PowerShell avançado com verificações automáticas

### Code Quality
```bash
# Format JavaScript (if Prettier is configured)
npx prettier --write script.js

# Check HTML validation
# Use online validator or W3C Markup Validator

# CSS validation
# Use W3C CSS Validator for style.css
```

## Architecture Overview

This is a **client-side Web3 crypto wallet manager** built as a single-page application with vanilla JavaScript. The architecture follows a class-based approach with clear separation of concerns.

### Core Architecture

**WalletManager Class** (`script.js`):
- **State Management**: Manages connection state, current account, and Web3 provider
- **Event Handling**: Listens for wallet events (account changes, chain changes)
- **Web3 Integration**: Interfaces with MetaMask and other Ethereum-compatible wallets
- **UI Updates**: Handles all DOM manipulation and user feedback

**Key Architectural Patterns**:
- **Observer Pattern**: Event listeners for wallet state changes
- **Factory Pattern**: Network detection and wallet provider instantiation
- **Error Handling**: Comprehensive try-catch blocks with user-friendly messages
- **Security First**: All operations happen client-side, no data transmission to external servers

### File Structure & Responsibilities

- **`index.html`**: Complete UI structure with Bootstrap components and semantic HTML
- **`script.js`**: Core application logic, Web3 integration, and state management
- **`style.css`**: Custom styling with CSS variables, responsive design, and animations
- **`README.md`**: User documentation and project information

### Web3 Integration Architecture

The application connects to blockchain networks through the browser's Web3 provider:

1. **Provider Detection**: Checks for `window.ethereum` (MetaMask, etc.)
2. **Connection Flow**: Request permissions → Get accounts → Load network info
3. **State Synchronization**: Automatically updates when users change accounts/networks
4. **Error Recovery**: Graceful handling of connection failures and user rejections

### Supported Networks

The app supports major Ethereum networks via chain ID detection:
- Ethereum Mainnet (`0x1`)
- Polygon Mainnet (`0x89`)
- Binance Smart Chain (`0x38`)
- Arbitrum One (`0xa4b1`)
- Optimism (`0xa`)
- Various testnets

## Development Guidelines

### Adding New Features

When extending the wallet manager:

1. **New Wallet Methods**: Add methods to the `WalletManager` class following the existing async/await pattern
2. **UI Components**: Use Bootstrap classes for consistency, add custom CSS to `style.css`
3. **Error Handling**: Always wrap Web3 calls in try-catch blocks and provide user feedback via `showStatus()`
4. **Event Listeners**: Register new events in `setupEventListeners()` method

### Web3 Development Patterns

```javascript
// Always check for Web3 provider
if (typeof window.ethereum === 'undefined') {
    this.showStatus('Web3 provider not detected', 'warning');
    return;
}

// Use proper error handling for Web3 calls
try {
    const result = await window.ethereum.request({
        method: 'eth_someMethod',
        params: [...]
    });
} catch (error) {
    if (error.code === 4001) {
        // User rejected
    } else {
        // Other error
    }
}
```

### State Management Rules

- Always update `this.currentAccount` when account changes
- Set `this.isConnected` boolean for connection state
- Call `loadWalletInfo()` after any account/network change
- Use `showStatus()` for all user feedback (success, error, info)

### UI Update Patterns

- Use `showWalletInfo()` to reveal connected state
- Update specific elements by ID rather than rebuilding DOM
- Add CSS classes for animations (`fade-in`, etc.)
- Provide loading states for async operations

### Security Considerations

- Never request or store private keys
- All wallet interactions go through official Web3 APIs
- No data is sent to external servers
- Always validate user permissions before operations
- Handle wallet disconnection gracefully

### Testing Considerations

Since this is a Web3 dApp:
- Test with MetaMask in different networks
- Test connection/disconnection flows
- Verify behavior when users reject permissions
- Test responsive design on different screen sizes
- Verify error messages are user-friendly

### Browser Compatibility

- Requires modern browser with ES6+ support
- Depends on Web3 provider (MetaMask extension, etc.)
- Uses Clipboard API for address copying
- Bootstrap 5 for responsive layout

## Future Development Notes

The README indicates planned features:
- Transaction history display
- ERC-20 token management
- DeFi protocol integration
- WalletConnect support for mobile wallets
- Portfolio tracking and analytics

When implementing these features, maintain the current architecture patterns and ensure all operations remain client-side for security.