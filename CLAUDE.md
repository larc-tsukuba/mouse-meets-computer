# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a static website for LARC-Tools (Laboratory Animal Resource Center, University of Tsukuba) that showcases research tools developed for genetically modified animal research. The site is deployed at https://larc-tsukuba.github.io/mouse-meets-computer/ and presents a portfolio of bioinformatics tools including KOnezumi, DAJIN2, TSUMUGI, and others.

## Architecture

### Core Structure
- **Static Site**: Pure HTML/CSS/JavaScript without build tools or package managers
- **Modular Content**: Content sections are loaded dynamically from separate HTML files in `/html/` directory
- **Tab-based Navigation**: Single-page application with JavaScript-powered tab switching
- **Bilingual Support**: Japanese and English content throughout

### Key Files
- `index.html`: Main page with tab navigation structure and container elements
- `js/script.js`: Tab switching logic, dynamic HTML loading, URL hash handling
- `css/style.css`: Modern CSS with CSS custom properties, responsive design
- `html/`: Modular content files (tools.html, news.html, members.html, publications.html, links.html)

### Content Loading Pattern
The site uses fetch() to dynamically load HTML content:
```javascript
fetch('./html/tools.html')
    .then(response => response.text())
    .then(data => {
        document.getElementById('tools-html').innerHTML = data;
    })
```

### Styling Architecture
- CSS custom properties (CSS variables) defined in `:root` for consistent theming
- Modern gradient-based design with orange accent color (#EF8300)
- Responsive design using flexbox and grid layouts
- Font Awesome icons integrated throughout

## Development

Since this is a static site without build tools:
- **No build step required** - files can be edited directly
- **Local testing**: Open `index.html` in browser or use simple HTTP server
- **Deployment**: Direct push to GitHub Pages (main branch)

## Content Management

### Adding New Tools
Tools are defined as `<li>` elements in `html/tools.html`. Each tool should include:
- Unique ID for the tool item
- Tool description with bilingual text
- Responsive image (usually from external GitHub repos)
- Button links for website, paper, GitHub, etc.

### URL Hash Navigation
The site supports hash-based navigation (#tools, #news, #members, #publications, #links). The JavaScript handles:
- Hash-based tab switching on page load
- Hash updates when tabs are clicked
- Scroll position reset for smooth navigation

## Conventions

- **Bilingual content**: Always provide both Japanese and English text
- **External links**: Use `target="_blank"` for external links
- **Image sources**: Tool logos typically loaded from external GitHub repositories
- **Code comments**: Use Japanese comments in HTML sections, English in JavaScript
- **CSS organization**: Grouped by functionality with clear section headers