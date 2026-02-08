# 🤖 AI Chatbot with Long-term Memory & RAG

A powerful, full-stack AI assistant that remembers you. Built with **React**, **Node.js**, **Pinecone**, and **OpenRouter**, featuring robust long-term memory, PDF analysis, and real-time web search capabilities.

## 🌟 Key Features

### 🧠 Advanced Memory System
-   **Long-term Recall**: Stores important facts about you (e.g., name, job, preferences) permanently using vector embeddings.
-   **Smart Conflict Resolution**: Prioritizes the **most recent** information (e.g., if you change jobs, it forgets the old one).
-   **Memory Management UI**: View and delete specific memories directly from the sidebar. 🗑️
-   **Dual-Sync Storage**: Syncs vector data with a local JSON store for reliability and easy management.

### 🤖 Multi-Model Intelligence
-   **Auto-Routing**: Uses **OpenRouter** to find the best available model for your query.
-   **Robust Fallback**: Automatically switches to **Google Gemini 2.0 Flash Lite (Free)** if the primary model is busy or rate-limited. 🛡️
-   **Context-Aware**: Intelligently injected system prompts ensure detailed, Markdown-formatted answers.

### 📄 RAG (Retrieval-Augmented Generation)
-   **PDF Chat**: Upload PDF documents and ask questions about their content. 📂
-   **Seamless Integration**: The bot automatically detects if a question relates to the uploaded file.

### 🌐 Real-time Capabilities
-   **Web Search**: Integrated with **Tavily API** to fetch real-time information from the web when needed. 🌍
-   **Live Updates**: Streaming responses for a smooth chat experience.

### 🎨 Modern UI/UX
-   **Responsive Design**: Built with **React** and **Tailwind CSS**. 📱
-   **Dark Mode Interface**: Sleek, developer-friendly aesthetic.
-   **Interactive Sidebar**: Manage chats and memories effortlessly.

## 🚀 Tech Stack

-   **Frontend**: React (Vite), Tailwind CSS, Lucide Icons
-   **Backend**: Node.js, Express
-   **AI/ML**: OpenAI SDK (OpenRouter), Google Gemini, Pinecone (Vector DB) for RAG
-   **Tools**: Multer (File Uploads), PDF-Parse, Dotenv

## 🛠️ Getting Started

### Prerequisites
-   Node.js installed
-   API Keys for OpenRouter, Pinecone, and Tavily

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/ai-chatbot.git
    cd ai-chatbot
    ```

2.  **Setup Backend**
    ```bash
    cd server
    npm install
    # Create .env file with your API keys
    npm run dev
    ```

3.  **Setup Frontend**
    ```bash
    cd ../client
    npm install
    # Create .env file with VITE_API_URL
    npm run dev
    ```

---
*Built with ❤️ by [Divyanshu Raj]*
