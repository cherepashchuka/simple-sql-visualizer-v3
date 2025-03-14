# Simple SQL Visualizer

A SQL table visualization tool that helps you understand and present database queries with ease.
When creating this tool, I was guided by the fact that it would help me in compiling documentation for software and pipelines for ML services.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ✨ Features

- 🎨 **Beautiful Visualizations**: Clean, modern UI with smooth animations
- 📝 **Simple Syntax**: Write table definitions in plain text
- 🎥 **GIF Export**: Create animated GIFs of your table structures
- 🎯 **Interactive**: Click and drag to rearrange tables
- 🔄 **Real-time Updates**: See changes instantly as you type


## 📖 Syntax Guide

### Highlighting Elements
```
// Highlight specific rows
highlight in table 'users' row 1,2,3;

// Highlight a column
highlight in table 'users' column 'email';

// Highlight a specific cell
highlight in table 'users' column 'email' row 1;
```

### Adding Columns
```
// Add a new column with empty cells
add in table 'users' column 'status';

// Add a column with specific values
add in table 'users' column 'score' cells [{1-'85'} {2-'92'}];
```

### Adding Rows
```
// Add a new row with values
add in table 'users' row [{John} {john@example.com} {Active} {78}];
```

### Example Animation
```
// Complete example showing multiple operations
highlight in table 'users' row 1;
add in table 'users' column 'status';
add in table 'users' column 'score' cells [{1-'85'} {2-'92'}];
add in table 'users' row [{John} {john@example.com} {Active} {78}];
highlight in table 'users' column 'status';
```

## 🤝 Contributing

No matter who you are, what country you come from, or what views you hold, сontributions are welcome! Please feel free to submit a Pull Request.
If this tool grows and helps people around me, I will be happy.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [React Flow](https://reactflow.dev/) for the amazing graph visualization library
- [gif.js](https://github.com/jnordberg/gif.js) for GIF generation
- All contributors who have helped shape this project

## 📧 Contact

Andrei Cherepashchuk - [@telegram](https://t.me/chereav) - justwinkyy@gmail.com

