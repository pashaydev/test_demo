<!-- ⚠️ Best viewed in VS Code Markdown Preview -->
<!-- In GitHub this file may look unformatted or misaligned -->

<div align="center" style="font-size:28px; font-weight:700; color:#4ec9b0;">
✨ RentVerse ✨
</div>

---

<div align="center" style="font-size:18px; font-weight:700; color:#aaaaaa;">
RentVerse is a modern real estate investment platform that combines traditional property investing with cryptocurrency payments. Built with React and Tailwind CSS, it mirrors the functionality of Arrived.com while adding blockchain-based transaction capabilities.
</div>

---
![Dashboard Overview](public/home.jpg)
---

# 🌐 RentVerse Demo
---

RentVerse is a demo platform showcasing a next-generation real-estate experience powered by cryptocurrency payments, interactive 3D property visualization, and a fully responsive, component-driven architecture.

---

## ✨ Key Features

- 💱 Cryptocurrency-enabled property transactions  
- 📱 Mobile-responsive interface  
- 🔍 SEO-optimized architecture  
- 📊 Real-time market data integration  
- 🏡 Interactive 3D property visualization  
- 🔗 Smart contract integration for secure blockchain transactions  

---

![Dashboard Overview](public/client.png)
---

## 🔌 Wallet connection & 🌙 Dark mode (added in this fork)

Live demo: **https://rentverse-demo.fly.dev** · branch `feature/wallet-dark-mode`

### Wallet connection
- The **Connect** buttons (Navbar, mobile menu, Home CTA) connect a browser wallet (MetaMask, OKX, Trust, Rabby… — anything injecting an EIP-1193 provider).
- Connected state shows `address · balance · chain`; click it to disconnect. The session is restored on reload without a popup, and the UI follows account / network switches in the wallet.
- No wallet installed → the button becomes an **Install wallet** link. Rejected / pending requests show a short message.
- Code: `src/wallet/` (`WalletContext.jsx` + `connectors/`) and `src/components/wallet/WalletButton.jsx`. Tests: `npm test`.
- **Adding another wallet** (WalletConnect, Coinbase, …): create `src/wallet/connectors/<name>.js` returning `{ id, name, isAvailable, getProvider }` where `getProvider()` resolves to an EIP-1193 provider, and add it to the array in `src/wallet/connectors/index.js`. Nothing else changes.

### Dark mode
- Toggle (🌙/☀️) in the Navbar. Preference is stored in `localStorage.theme`; without one the OS setting is used. The theme is applied before first paint (inline script in `public/index.html`), so there is no light flash.
- Implementation: 7 semantic colours (`page`, `surface`, `surface-muted`, `body`, `muted`, `subtle`, `line`) defined once as CSS variables in `src/index.css` and exposed as Tailwind colours (`tailwind.config.js`, `darkMode: 'class'`). Pages use `bg-surface`, `text-muted`… instead of `bg-white`, `text-secondary-600`… so both palettes live in one file. Photo badges and already-dark sections keep their literal colours; the 3D viewer keeps its own palette.
- If you opened the original app before, unregister its old service worker once (DevTools → Application → Service Workers) — it cached stale bundles and has been removed.

### Run locally
```
npm install
npm start        # Express API on :3099 + React dev server on :3000
npm test         # wallet tests
```

### Deploy (Fly.io)
`server/app.js` serves the CRA `build/` (SPA fallback included) in production, so one machine runs everything.
```
fly auth login
fly apps create rentverse-demo      # pick another name if taken (also update fly.toml)
fly deploy --ha=false
```

---

## 🧩 Core Pages and Components

### 1. 🏠 Home Page
- Hero section with value proposition  
- Featured properties grid  
- “Why Choose Us” crypto benefits section  
- Step-by-step investment guide  
- Latest blog previews  
- Community section  

### 2. 🏘️ Properties Page
- Searchable and filterable property grid  
- Advanced search options  
- Detailed property cards  
- Three.js-powered 3D viewer  

### 3. 👥 About Us Page
- Mission and vision overview  
- Team member profiles  
- Platform statistics and milestones  

### 4. ✍️ Blog Section
- Category-based filtering  
- Blog search functionality  
- Author profiles  
- Social sharing options  

---

## 🧱 Development Guidelines

### 🧩 Component Standards
- Follow atomic design principles  
- Use TypeScript for type safety  
- Apply Tailwind breakpoints for responsiveness  
- Add comments and maintain documentation  

### 🔧 State Management
- React Context for shared global state  
- Redux for complex or multi-layered data flows  
- Minimal local component state  

### 🔐 Security Practices
- Validate all user inputs  
- Secure wallet connection handling  
- Follow blockchain transaction best practices  
- Run regular dependency and security audits  

---

## 🤝 Contributing

We welcome contributions! Please follow the workflow below:

1. 📌 Create a new feature branch  
2. 🧪 Write tests for added functionality  
3. 📝 Document new or updated features  
4. 🎯 Maintain consistent coding style  
5. 🔁 Submit a pull request with a clear description  

---

## 🙏 Acknowledgments

Inspired by Arrived.com and supported by the open-source work of the React and Tailwind CSS communities.

---

# How to run the project

## Clone

```
   git clone https://github.com/klasma-tech/MVP_demo.git
```

## Change directory

```
   cd MVP_demo
```

## Install dependencies

```
   npm install
```

## Run on localhost

```
   npm start
```
