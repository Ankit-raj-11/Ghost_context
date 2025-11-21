# 🚀 WebPizza React POC - Setup Guide

## 📋 Overview

This is a complete React version of the WebPizza AI POC, maintaining full feature parity with the original Angular implementation. Everything has been successfully converted!

## ✅ What's Included

### Core Application
- ✅ React 18 + Vite 5 setup
- ✅ TypeScript configuration
- ✅ All services converted (embedder, llm-client, rag-engine, vector-store, pdf-parser)
- ✅ Dual engine support (WebLLM + WeInfer)
- ✅ Complete RAG pipeline

### Components
- ✅ Home component with full chat interface
- ✅ Privacy Policy page
- ✅ Cookie Policy page
- ✅ React Router setup

### Styling
- ✅ All CSS files converted
- ✅ Responsive design
- ✅ Modern UI with animations

### Configuration
- ✅ Vite configuration with polyfills
- ✅ TypeScript configuration
- ✅ Vercel deployment config
- ✅ Cross-origin headers for WebGPU

### Documentation
- ✅ Comprehensive README
- ✅ CHANGELOG
- ✅ LICENSE (MIT)
- ✅ This setup guide

## 🔧 Installation & Running

### Step 1: Install Dependencies

```bash
cd webpizza-react-poc
npm install
```

**Note**: The `postinstall` script will automatically patch Transformers.js for browser compatibility.

### Step 2: Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

**Important Headers**: Vite is configured to serve the required WebGPU headers:
- `Cross-Origin-Embedder-Policy: require-corp`
- `Cross-Origin-Opener-Policy: same-origin`

### Step 3: Production Build

```bash
npm run build
```

This will:
1. Compile TypeScript
2. Build optimized bundles
3. Generate version file
4. Output to `dist/` directory

### Step 4: Preview Production Build

```bash
npm run preview
```

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel
```

The `vercel.json` configuration is already set up with:
- ✅ SPA routing (all routes → index.html)
- ✅ WebGPU cross-origin headers
- ✅ Build command configuration

### Other Platforms

If deploying elsewhere, ensure:
1. SPA routing is configured
2. Required headers are set:
   ```
   Cross-Origin-Embedder-Policy: require-corp
   Cross-Origin-Opener-Policy: same-origin
   Cross-Origin-Resource-Policy: cross-origin
   ```

## 📁 Project Structure

```
webpizza-react-poc/
├── src/
│   ├── components/          # React components
│   │   ├── Home.tsx        # Main chat interface
│   │   ├── Home.css        # Home component styles
│   │   ├── PrivacyPolicy.tsx
│   │   ├── CookiePolicy.tsx
│   │   └── LegalPages.css  # Legal pages styles
│   ├── services/           # Core services
│   │   ├── embedder.ts     # Text embedding service
│   │   ├── llm-client.ts   # WebLLM client
│   │   ├── llm-client-weinfer.ts  # WeInfer client
│   │   ├── rag-engine.ts   # RAG orchestration
│   │   ├── rag-engine-weinfer.ts
│   │   ├── vector-store.ts # IndexedDB vector store
│   │   └── pdf-parser.ts   # PDF processing
│   ├── lib/
│   │   └── weinfer/        # WeInfer library
│   ├── App.tsx             # Root component with routing
│   ├── main.tsx            # Entry point
│   └── version.ts          # Version constant
├── public/                 # Static assets
│   ├── favicon.svg
│   ├── favicon-96x96.png
│   ├── apple-touch-icon.png
│   └── site.webmanifest
├── scripts/
│   └── generate-version.js # Post-build version script
├── vite.config.ts          # Vite configuration
├── tsconfig.json           # TypeScript configuration
├── vercel.json             # Vercel deployment config
└── package.json            # Dependencies & scripts
```

## 🔍 Key Differences from Angular Version

### Architecture
- **State Management**: React Hooks (useState, useEffect, useRef) instead of Angular services with RxJS
- **Routing**: React Router instead of Angular Router
- **Build Tool**: Vite instead of Angular CLI
- **Styling**: CSS modules approach instead of component-scoped SCSS

### Features (All Maintained)
- ✅ Same RAG pipeline
- ✅ Same dual-engine support
- ✅ Same model selection
- ✅ Same privacy guarantees
- ✅ Same WebGPU acceleration
- ✅ Same chat interface
- ✅ Same document processing

## 🎯 Usage Guide

### 1. Select Engine
Choose between:
- **WebLLM** (Standard): Original implementation
- **WeInfer** (Optimized): ~3.76x faster

### 2. Choose Model
Select based on your hardware:
- **Fast & Small**: Llama 3.2 1B, Qwen 2 1.5B (~1GB)
- **Balanced**: Phi-3 Mini (~2GB), Llama 3.2 3B (~1.5GB)
- **High Quality**: Mistral 7B, Llama 3 8B (~4GB)

### 3. Upload PDF
- Click "Choose PDF File"
- Wait for document processing
- Documents are chunked and embedded locally

### 4. Chat
- Type your question
- Click send or press Enter
- Watch real-time streaming response
- Enable features:
  - 📖 Source Citations
  - 💭 Conversational Memory
  - 🔍 Hybrid Search

## 🐛 Troubleshooting

### Issue: WebGPU Not Available
**Solution**:
1. Open `chrome://flags`
2. Search "WebGPU"
3. Enable "Unsafe WebGPU"
4. Restart browser

### Issue: Build Errors
**Solution**:
```bash
# Clear node_modules
rm -rf node_modules
rm package-lock.json

# Reinstall
npm install
```

### Issue: Module Not Found
**Solution**: Check that all imports use correct paths. Vite uses ES modules.

### Issue: CORS Errors in Development
**Solution**: Vite config includes headers. If issues persist, check browser console.

## 🔐 Security & Privacy

- **No Server**: Everything runs in browser
- **No Tracking**: No analytics or cookies
- **No Upload**: Documents never leave your device
- **Local Storage**: IndexedDB for vectors, Cache API for models

## 📊 Performance Tips

1. **Use WeInfer**: ~3.76x faster than standard WebLLM
2. **Choose Smaller Models**: Faster inference, lower memory
3. **Close Other Tabs**: More GPU/RAM for the app
4. **Enable Hardware Acceleration**: In browser settings
5. **Clear Cache**: If experiencing issues

## 🎓 Learning Resources

### React Concepts Used
- Functional components
- Hooks (useState, useEffect, useRef, useCallback)
- Event handling
- Conditional rendering
- Component composition

### Advanced Features
- WebGPU API
- IndexedDB
- Web Workers (via WebLLM)
- Streaming responses
- File API

## 🤝 Contributing

Contributions welcome! This is a POC so feel free to:
- Report bugs
- Suggest features
- Improve documentation
- Optimize performance

## 📝 License

MIT License - See LICENSE file

## 👤 Credits

**Original Author**: Emanuele Strazzullo
**React Port**: AI Assistant with Cursor

---

## 🎉 You're Ready!

Your React version of WebPizza AI POC is complete and ready to use. Run `npm run dev` to start developing!

For questions or issues, check the README.md or open an issue on GitHub.

Happy coding! 🍕

