# Journl - Multimedia Journaling App

A beautiful, mobile-first journaling application that supports multimedia entry capture. Built with React, TypeScript, and Tailwind CSS.

## Features

- **Rich Text Journaling**: Write your thoughts with a clean, distraction-free text editor
- **Multimedia Support**: 
  - Upload and display images inline
  - Add links with automatic preview generation (title and favicon)
  - Attach documents (PDF, DOCX) with local storage
- **Mobile-First Design**: Optimized for mobile devices with responsive layout
- **Clean & Calm UI**: Soft shadows, rounded cards, and a "creative notebook" aesthetic
- **Local Storage**: All data stored locally in browser (no backend required)
- **Recent Entries**: View your recent journal entries with media attachment indicators

## Tech Stack

- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Vite** for build tooling
- **localStorage** for data persistence

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory, ready for deployment to Vercel or any static hosting service.

## Usage

1. **Writing**: Click in the text area and start writing your journal entry
2. **Adding Media**: 
   - Click the "+ Add media" button to expand options
   - Choose Image, Link, or Document
   - For images: Select files from your device
   - For links: Paste any URL and get automatic preview
   - For documents: Upload PDF or DOCX files
3. **Managing Attachments**: View uploaded items as cards below the text editor, remove with the X button
4. **Saving**: Click "Save Entry" when you're ready to save your journal entry
5. **Viewing History**: Scroll down to see your recent entries

## Deployment

This app is ready for deployment to Vercel:

1. Push your code to a Git repository
2. Connect your repository to Vercel
3. Deploy with default settings (Vite framework detection)

## File Structure

```
src/
├── components/          # React components
│   ├── MediaCard.tsx   # Display component for media items
│   ├── MediaUploader.tsx # Upload interface for media
│   └── TextEditor.tsx  # Text input component
├── types/              # TypeScript type definitions
│   └── journal.ts      # Journal entry and media types
├── utils/              # Utility functions
│   ├── storage.ts      # localStorage management
│   └── linkPreview.ts  # Link preview generation
├── App.tsx             # Main application component
├── main.tsx           # Application entry point
└── index.css          # Global styles and animations
```

## License

MIT License
