# Roofing System Product Information Assistant

## Overview

This is a full-stack web application that serves as a Product Information Assistant for roofing systems. The application allows users to chat with an AI assistant about various roofing membrane types (TPO, EPDM, PVC), upload and manage PDF documents, and get detailed information about warranties, specifications, and building requirements.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: React Query (@tanstack/react-query) for server state
- **Routing**: Wouter for client-side routing
- **UI Components**: Radix UI primitives with custom styling
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (@neondatabase/serverless)
- **File Processing**: Multer for file uploads, PDF processing capabilities
- **AI Integration**: OpenAI API for chat responses and RAG (Retrieval-Augmented Generation)

### Development Setup
- **Development Server**: Vite dev server with HMR
- **Production Build**: Vite build + esbuild for server bundling
- **Session Management**: PostgreSQL sessions with connect-pg-simple
- **Environment**: Replit-optimized with custom plugins

## Key Components

### Database Schema
- **documents**: Stores uploaded PDF files with content and metadata (includes pre-loaded assembly letters)
- **chatMessages**: Stores chat conversation history with user and assistant messages
- **productData**: Complete product database with 205 roofing product sheets from ZIP file (33 TPO, 40 PVC, 48 EPDM, 84 other products)

### AI Service (RAG Implementation)
- **RAG Service**: Combines document search with product database queries
- **AI Integration**: OpenAI GPT-4o for generating contextual responses
- **Context Building**: Merges relevant documents and product data for AI responses
- **Source Attribution**: Tracks and provides source references for AI responses

### Document Management
- **PDF Processing**: Extracts text content from uploaded PDF files
- **File Upload**: Handles multiple file uploads with validation
- **Content Search**: Full-text search across document content
- **Metadata Extraction**: Stores file information and processing timestamps

### Chat Interface
- **Real-time Chat**: Interactive chat interface with message history
- **Source Citations**: Displays source documents and relevance scores
- **Quick Queries**: Pre-defined common questions about roofing systems
- **Message Management**: Ability to clear chat history

## Data Flow

1. **Pre-loaded Data**: System starts with 205 complete product sheets from ZIP file and 3 assembly letters for context
2. **Document Upload**: Users can upload additional PDF files → Server processes and extracts text → Content stored in database
3. **Chat Interaction**: User sends message → RAG service searches relevant content → AI generates response with sources → Response displayed with citations
4. **Product Search**: System searches pre-loaded product sheets for roofing specifications and product details
5. **Document Search**: Full-text search across assembly letters and uploaded document content
6. **Response Generation**: AI combines search results to provide comprehensive answers with proper source citations

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connection
- **drizzle-orm**: Type-safe database ORM
- **openai**: AI response generation
- **@tanstack/react-query**: Client-side state management
- **@radix-ui/react-***: UI component primitives
- **multer**: File upload handling
- **wouter**: Client-side routing

### Development Dependencies
- **vite**: Build tool and dev server
- **typescript**: Type checking
- **tailwindcss**: Styling framework
- **@replit/vite-plugin-***: Replit-specific development plugins

## Deployment Strategy

### Development
- **Local Development**: Vite dev server with Express backend
- **Hot Module Replacement**: Full-stack HMR for rapid development
- **Environment Variables**: DATABASE_URL for PostgreSQL connection, OPENAI_API_KEY for AI integration

### Production
- **Build Process**: Vite builds client, esbuild bundles server
- **Static Assets**: Client built to `dist/public`
- **Server Bundle**: Express app bundled to `dist/index.js`
- **Database**: PostgreSQL with Drizzle migrations in `migrations/` directory

### Key Features
- **Mobile Responsive**: Optimized for desktop and mobile interfaces
- **Real-time Updates**: React Query ensures fresh data
- **File Management**: Comprehensive document upload and management
- **Search Functionality**: Full-text search across all content
- **AI-Powered Responses**: Context-aware responses about roofing systems
- **Source Attribution**: Transparent citation of information sources

The application is designed to be a comprehensive tool for roofing professionals and customers to access detailed product information, compare different membrane types, and get expert guidance on roofing system specifications and requirements.

### Recent Changes (January 2025)
- ✓ Created pre-loaded product database with 7 roofing system specifications from assembly letters
- ✓ Integrated assembly letter content directly into the system for immediate AI context
- ✓ Enhanced AI assistant with specialized roofing system knowledge (TPO, EPDM, PVC)
- ✓ Implemented source citation system for traceability
- ✓ Fixed TypeScript errors and improved error handling
- ✓ Added comprehensive product information from Carlisle and Versico manufacturers
- ✓ Updated document library to display product sheets from zip file instead of assembly letters
- ✓ Modified AI system to prioritize product data over assembly letters for answers and sources
- ✓ Added file upload functionality directly to chat interface (upload button)
- ✓ Created product modal for detailed product sheet viewing
- ✓ Assembly letters now serve as contextual information only
- ✓ Integrated actual product sheets from ZIP file (10 TPO/PVC/EPDM products)
- ✓ Updated system to use authentic product data from manufacturer specifications
- ✓ Extracted complete product database with all 205 product sheets from ZIP file
- ✓ Organized products by system type: 33 TPO, 40 PVC, 48 EPDM, 84 other products
- ✓ Implemented ChatGPT-like conversation history with session management
- ✓ Added dark-themed history sidebar with session creation, editing, and deletion
- ✓ Enhanced chat interface to support session-based conversations with message isolation
- ✓ Fixed unhandled promise rejection errors in React Query mutations
- ✓ Implemented real PDF text extraction using pdf-parse library
- ✓ Enhanced document analysis with comprehensive content extraction and AI cross-referencing
- ✓ Added loading states for document upload and processing with visual feedback
- ✓ Created automatic ready messages after document processing completion
- ✓ Improved source prioritization: Product Database → Uploaded Documents → Assembly Letters