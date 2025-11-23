# ToolkeeprUi

# ToolKeepr - Tool Management System

A comprehensive Angular-based tool inventory management system with dynamic properties, built with Angular Material Design.

## Features

- 🔧 **Comprehensive Tool Management**: Add, edit, and organize tool inventory
- 📋 **Dynamic Tool Types**: Create custom tool types with configurable properties
- ⭐ **Standard Tool Classification**: Mark and filter tools as standard inventory
- 🏷️ **Property Management**: Define custom properties for each tool type (text, number, date, boolean, select)
- 📊 **Dashboard Analytics**: Overview statistics and recent activity tracking
- 🔍 **Advanced Filtering**: Search and filter tools by status, type, and standard classification
- 📱 **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

## Technologies

- **Angular 17** - Modern web framework
- **Angular Material** - Material Design components
- **TypeScript** - Type-safe development
- **RxJS** - Reactive programming
- **CSS Grid & Flexbox** - Modern responsive layouts

## Development

### Prerequisites
- Node.js (version 18 or later)
- npm or yarn
- Angular CLI

### Setup
1. Clone the repository
2. Install dependencies: `npm install`
3. Start development server: `npm start`
4. Open browser to `http://localhost:4200`

### Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm run build:gh-pages` - Build for GitHub Pages deployment
- `npm run deploy` - Deploy to GitHub Pages
- `npm test` - Run unit tests

## GitHub Pages Deployment

This application is configured for automatic deployment to GitHub Pages.

### Automatic Deployment (Recommended)

1. **Push to main/master branch** - The GitHub Actions workflow will automatically build and deploy
2. **Enable GitHub Pages** in your repository settings:
   - Go to Settings → Pages
   - Select "Deploy from a branch"
   - Choose "gh-pages" branch
   - Click Save

### Manual Deployment

If you prefer manual deployment:

```bash
# Build and deploy manually
npm run deploy
```

### Deployment Configuration

The deployment is configured to handle Angular's browser output folder and SPA routing:

- ✅ **Browser Folder**: Correctly deploys from `dist/toolkeepr-ui/browser`
- ✅ **Base Href**: Automatically sets `/toolkeepr-ui/` for GitHub Pages
- ✅ **SPA Routing**: Includes 404.html redirect handling for Angular routes
- ✅ **Asset Optimization**: Production build with optimizations enabled

### GitHub Actions Workflow

The automated deployment:
1. Triggers on push to main/master branch
2. Sets up Node.js 18 environment
3. Installs dependencies with `npm ci`
4. Builds application with production configuration
5. Deploys to gh-pages branch with correct folder structure

## Usage

### Tool Management
1. **Navigate to "Manage Tools"** from the sidebar
2. **Tool Types Tab**: Create and configure tool types with custom properties
3. **Tools Tab**: Add individual tools with type-specific properties
4. **Properties Management**: Click the settings icon on any tool type to define custom properties

### Dashboard
- View inventory statistics
- Monitor recent activity
- Quick access to common functions

### Navigation
- **Dashboard**: Overview and statistics
- **Tools**: Browse and filter all tools
- **Standard Tools**: View only standard inventory
- **Manage Tools**: Add/edit tools and tool types

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and commit: `git commit -am 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Live Demo

The application is deployed and available at: `https://[your-username].github.io/toolkeepr-ui/`
