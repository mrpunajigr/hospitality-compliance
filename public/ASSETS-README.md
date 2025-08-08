# Template Assets Guide

## Required Assets for New Projects

Replace these placeholder files with your project-specific assets:

### Logo Files
- **logo.png** - Main company logo (recommended: 256x256px or larger)
- **favicon.png** - Browser favicon (recommended: 32x32px)

### Background Images  
- **hero-background.jpg** - Main landing page background image
- **placeholder-image.jpg** - Generic placeholder for content areas

### Custom Fonts
- **YourCustomFont.ttf** - Place your custom brand font here
- Update the font name in `app/globals.css` @font-face declaration
- Update font-family references throughout CSS

### Recommended Image Specifications
- **Logos**: PNG format with transparency, minimum 256x256px
- **Backgrounds**: JPG format, minimum 1920x1080px for desktop
- **Icons**: SVG format preferred for scalability
- **Favicons**: PNG format, 32x32px and 180x180px (Apple touch icon)

### File Naming Convention
Use descriptive, lowercase names with hyphens:
- ✅ company-logo.png
- ✅ hero-background.jpg  
- ❌ Logo_Final_v2.PNG
- ❌ bg image.jpeg

### Safari 12 Compatibility Notes
- Test all images load properly on Safari 12
- Avoid WebP format (not supported)
- Keep file sizes reasonable for older hardware
- Use progressive JPEG for large background images