# PDF Compressor - Online PDF File Size Reducer

A modern, client-side PDF compression tool that reduces file sizes while maintaining quality. Built with vanilla JavaScript and PDF-lib for secure, fast processing entirely in your browser.

## 🚀 Features

- **100% Client-Side Processing** - Your files never leave your device
- **Multiple Compression Levels** - Choose between Low, Medium, and High compression
- **Drag & Drop Interface** - Intuitive file selection with drag and drop support
- **Batch Processing** - Compress multiple PDF files at once
- **Real-time Progress** - Visual progress indicators during compression
- **Responsive Design** - Works perfectly on desktop, tablet, and mobile devices
- **No File Size Limits** - Process files up to 50MB (configurable)
- **ZIP Download** - Download multiple compressed files as a ZIP archive

## 🛠️ Technologies Used

- **HTML5** - Semantic markup and modern web standards
- **CSS3** - Modern styling with Flexbox, Grid, and animations
- **JavaScript (ES6+)** - Modern JavaScript with classes and async/await
- **PDF-lib** - Client-side PDF manipulation library
- **JSZip** - ZIP file creation for batch downloads
- **Font Awesome** - Beautiful icons
- **Google Fonts** - Inter font family for modern typography

## 📱 Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 🎨 UI/UX Features

### Modern Design
- Clean, minimalist interface
- Gradient backgrounds and smooth animations
- Responsive design that works on all devices
- Intuitive drag-and-drop functionality

### User Experience
- Clear visual feedback for all actions
- Progress indicators during processing
- Detailed compression statistics
- Error handling with helpful messages
- Keyboard navigation support

### Accessibility
- Semantic HTML structure
- ARIA labels for screen readers
- High contrast colors
- Keyboard-friendly interface

## 🔧 How It Works

1. **File Selection**: Users can drag and drop PDF files or click to browse
2. **Compression Settings**: Choose from three compression levels:
   - **Low**: Better quality, larger file size (80% image quality)
   - **Medium**: Balanced quality and size (60% image quality, removes metadata)
   - **High**: Smaller size, good quality (40% image quality, removes metadata, scales large pages)
3. **Processing**: Files are processed client-side using PDF-lib
4. **Download**: Individual files or ZIP archive for multiple files

## 📊 Compression Techniques

The application uses several techniques to reduce PDF file sizes:

- **Image Quality Reduction**: Adjusts image compression based on selected level
- **Metadata Removal**: Strips unnecessary metadata from PDFs
- **Page Scaling**: Reduces oversized pages in high compression mode
- **Object Stream Optimization**: Uses PDF object streams for better compression
- **Content Optimization**: Removes redundant data and optimizes PDF structure

## 🚀 Getting Started

1. **Clone or Download** the repository
2. **Open** `index.html` in a modern web browser
3. **Start Compressing** - No installation or setup required!

### Local Development

```bash
# Clone the repository
git clone [repository-url]

# Navigate to the project directory
cd pdf-compressor

# Open in browser (no build process required)
open index.html
```

### Deployment

The application is entirely client-side and can be deployed to any static hosting service:

- GitHub Pages
- Netlify
- Vercel
- AWS S3
- Any web server

Simply upload all files to your hosting provider.

## 📁 Project Structure

```
pdf-compressor/
├── index.html          # Main HTML file
├── styles.css          # CSS styles and animations
├── script.js           # JavaScript application logic
└── README.md           # Project documentation
```

## 🔒 Privacy & Security

- **No Server Processing**: All compression happens in your browser
- **No File Uploads**: Files never leave your device
- **No Data Collection**: No analytics or tracking
- **Secure Processing**: Uses modern web APIs and libraries

## ⚡ Performance

- **Fast Processing**: Optimized algorithms for quick compression
- **Memory Efficient**: Handles large files without browser crashes
- **Progressive Loading**: Loads external libraries only when needed
- **Responsive UI**: Smooth animations and interactions

## 🎯 Use Cases

- **Email Attachments**: Reduce file sizes for email sending
- **Web Uploads**: Optimize PDFs for faster web uploads
- **Storage Optimization**: Save disk space on your device
- **Bandwidth Saving**: Reduce download/upload times
- **Document Sharing**: Make files easier to share

## 🔧 Customization

The application is highly customizable:

### Compression Settings
Modify compression levels in `script.js`:
```javascript
const settings = {
    low: { imageQuality: 0.8, removeMetadata: false },
    medium: { imageQuality: 0.6, removeMetadata: true },
    high: { imageQuality: 0.4, removeMetadata: true }
};
```

### File Size Limits
Adjust maximum file size:
```javascript
if (file.size > 50 * 1024 * 1024) { // 50MB limit
    // Handle large files
}
```

### UI Themes
Customize colors and styling in `styles.css`:
```css
:root {
    --primary-color: #667eea;
    --secondary-color: #764ba2;
    --success-color: #4caf50;
    --error-color: #f44336;
}
```

## 🐛 Troubleshooting

### Common Issues

1. **Files not compressing**: Ensure files are valid PDFs
2. **Large file errors**: Check file size limits (default 50MB)
3. **Browser compatibility**: Use a modern browser
4. **Slow processing**: Large files may take time to process

### Error Messages

- **"Please select only PDF files"**: Only PDF files are supported
- **"File is too large"**: Reduce file size or increase limit
- **"File already selected"**: Duplicate files are not allowed

## 📈 Future Enhancements

Potential improvements for future versions:

- **Advanced Compression Options**: More granular control over compression settings
- **Image Format Conversion**: Convert images within PDFs to more efficient formats
- **OCR Integration**: Optimize scanned documents
- **Cloud Storage Integration**: Direct upload to cloud services
- **Batch Processing API**: Process multiple files simultaneously
- **Compression Presets**: Predefined settings for different use cases

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

### Development Guidelines

1. Follow existing code style and conventions
2. Test changes across different browsers
3. Ensure responsive design works on all devices
4. Add comments for complex functionality
5. Update documentation as needed

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- **PDF-lib**: Amazing PDF manipulation library
- **Font Awesome**: Beautiful icon set
- **Google Fonts**: Inter font family
- **JSZip**: ZIP file creation library

## 📞 Support

If you encounter any issues or have questions:

1. Check the troubleshooting section
2. Review browser compatibility
3. Ensure you're using the latest version
4. Submit an issue with detailed information

---

**Built with ❤️ for better file management**
