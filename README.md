# SQL Visualizer

A simple open-source application for creating and visualizing SQL tables with animations.

## Features

- Create up to 3 in-memory tables
- Add, edit, and remove columns and rows
- Tables persist across page refreshes
- Custom animation language to create step-by-step visualizations
- GIF generation for sharing animated SQL operations

## Custom Animation Language

The application uses a simple custom language to describe table operations:

```
highlight in table 'tablename' row 1,2,3;
highlight in table 'tablename' column 'columnname';
highlight in table 'tablename' column 'columnname' row 1;
```

Each line represents one step in the animation. Commands are separated by semicolons.

## Usage

1. Create tables using the table editor
2. Add columns and rows to your tables
3. Write animation code using the custom syntax
4. Click "Execute" to generate an animation
5. Download the generated GIF for sharing

## Development

This project uses:
- React with TypeScript
- Vite
- React Bootstrap for UI components
- gifshot for GIF generation

### Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## License

MIT License
