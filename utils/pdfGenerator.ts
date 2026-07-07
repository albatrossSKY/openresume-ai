import { PDFDocument, StandardFonts, rgb, PDFFont, PDFPage } from 'pdf-lib';
import { ResumeData, ResumeStyle } from '../types/resume';

// Helper to convert hex colors to RGB required by pdf-lib
function hexToRgb(hex: string) {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255;
  return rgb(r, g, b);
}

// Text wrapping utility
function wrapText(text: string, maxWidth: number, font: PDFFont, fontSize: number): string[] {
  if (!text) return [];
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const testWidth = font.widthOfTextAtSize(testLine, fontSize);
    if (testWidth > maxWidth) {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }
  return lines;
}

export async function generateResumePDF(data: ResumeData, style: ResumeStyle): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  
  // Override standard style tokens if specific layout styles are selected
  if (style.layoutStyle === 'academic') {
    style = {
      ...style,
      layoutType: 'single-column',
      fontFamily: 'serif',
      headerStyle: 'classic-centered',
      sectionHeaderStyle: 'underline',
      bulletStyle: 'disc',
      spacing: 'comfortable',
    };
  } else if (style.layoutStyle === 'creative') {
    style = {
      ...style,
      layoutType: 'two-column-left',
      headerStyle: 'left-aligned',
      bulletStyle: 'disc',
      skillStyle: 'pills',
      spacing: 'cozy',
    };
  } else if (style.layoutStyle === 'executive') {
    style = {
      ...style,
      layoutType: 'single-column',
      fontFamily: 'serif',
      headerStyle: 'classic-centered',
      sectionHeaderStyle: 'minimal-bold',
      bulletStyle: 'square',
      spacing: 'cozy',
    };
  } else if (style.layoutStyle === 'timeline') {
    style = {
      ...style,
      layoutType: 'two-column-right',
      fontFamily: 'mono',
      headerStyle: 'left-aligned',
      bulletStyle: 'dash',
      skillStyle: 'pills',
      spacing: 'compact',
    };
  } else if (style.layoutStyle === 'minimalist') {
    style = {
      ...style,
      layoutType: 'single-column',
      headerStyle: 'left-aligned',
      sectionHeaderStyle: 'minimal-bold',
      bulletStyle: 'none',
      spacing: 'comfortable',
    };
  }

  // Set up fonts
  let regularFontName = StandardFonts.Helvetica;
  let boldFontName = StandardFonts.HelveticaBold;
  let italicFontName = StandardFonts.HelveticaOblique;
  
  if (style.fontFamily === 'serif') {
    regularFontName = StandardFonts.TimesRoman;
    boldFontName = StandardFonts.TimesRomanBold;
    italicFontName = StandardFonts.TimesRomanItalic;
  } else if (style.fontFamily === 'mono') {
    regularFontName = StandardFonts.Courier;
    boldFontName = StandardFonts.CourierBold;
    italicFontName = StandardFonts.CourierOblique;
  }
  
  const font = await pdfDoc.embedFont(regularFontName);
  const boldFont = await pdfDoc.embedFont(boldFontName);
  const italicFont = await pdfDoc.embedFont(italicFontName);
  
  // --- EMBED PROFILE PHOTO ---
  let embeddedPhoto: any = null;
  if (data.personalInfo.photoUrl && data.personalInfo.photoUrl.startsWith('data:image/')) {
    try {
      const dataUrlParts = data.personalInfo.photoUrl.split(',');
      const mimeType = dataUrlParts[0].split(';')[0].split(':')[1];
      const base64Data = dataUrlParts[1];
      
      // Decode base64 bytes
      const binaryStr = atob(base64Data);
      const len = binaryStr.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
      }
      
      if (mimeType === 'image/png') {
        embeddedPhoto = await pdfDoc.embedPng(bytes);
      } else {
        embeddedPhoto = await pdfDoc.embedJpg(bytes);
      }
    } catch (e) {
      console.error("Failed to embed profile photo in PDF:", e);
    }
  }
  
  // Colors
  const primaryColor = hexToRgb(style.colorPalette.primary);
  const secondaryColor = hexToRgb(style.colorPalette.secondary);
  const textColor = hexToRgb(style.colorPalette.text);
  const mutedColor = hexToRgb(style.colorPalette.muted);
  const borderColor = hexToRgb(style.colorPalette.border);
  const accentColor = hexToRgb(style.colorPalette.accent);
  const pageBgColor = hexToRgb(style.colorPalette.background);
  
  // PDF settings
  const pageWidth = 612; // Letter Width
  const pageHeight = 792; // Letter Height
  const margin = style.marginSize;
  const baseSize = style.fontSizeBase;
  
  // Spacing parameters based on style
  let lineGap = 4;
  let sectionGap = 16;
  let itemGap = 10;
  if (style.spacing === 'compact') {
    lineGap = 2.5;
    sectionGap = 10;
    itemGap = 6;
  } else if (style.spacing === 'comfortable') {
    lineGap = 5;
    sectionGap = 22;
    itemGap = 14;
  }
  
  // Page creation tracker
  let currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
  
  // Apply page background
  const drawBackground = (page: PDFPage) => {
    page.drawRectangle({
      x: 0,
      y: 0,
      width: pageWidth,
      height: pageHeight,
      color: pageBgColor,
    });
    if (style.layoutStyle === 'creative') {
      page.drawRectangle({
        x: 0,
        y: 0,
        width: 175,
        height: pageHeight,
        color: primaryColor,
      });
    }
  };
  drawBackground(currentPage);
  
  let yCursor = pageHeight - margin;
  
  // Page validation and creation helper
  const checkSpaceAndAddNewPage = (heightNeeded: number): PDFPage => {
    if (yCursor - heightNeeded < margin) {
      currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
      drawBackground(currentPage);
      yCursor = pageHeight - margin;
    }
    return currentPage;
  };
  
  // Draw bullet points
  const drawBulletStyle = (page: PDFPage, x: number, y: number, size: number) => {
    if (style.bulletStyle === 'disc') {
      page.drawCircle({ x: x + 4, y: y + 3, size: 2.5, color: primaryColor });
    } else if (style.bulletStyle === 'square') {
      page.drawRectangle({ x: x + 2, y: y + 1, width: 4, height: 4, color: primaryColor });
    } else if (style.bulletStyle === 'dash') {
      page.drawLine({ start: { x: x + 1, y: y + 3 }, end: { x: x + 7, y: y + 3 }, thickness: 1, color: primaryColor });
    }
  };

  // Section header drawing helper
  const drawSectionHeader = (page: PDFPage, title: string, x: number, width: number): PDFPage => {
    const headerHeight = baseSize + 10;
    const activePage = checkSpaceAndAddNewPage(headerHeight + 10);
    
    yCursor -= 6;
    
    if (style.sectionHeaderStyle === 'underline') {
      activePage.drawText(title.toUpperCase(), {
        x,
        y: yCursor,
        size: baseSize + 2,
        font: boldFont,
        color: primaryColor,
      });
      yCursor -= 4;
      activePage.drawLine({
        start: { x, y: yCursor },
        end: { x: x + width, y: yCursor },
        thickness: 1.5,
        color: primaryColor,
      });
      yCursor -= 8;
    } else if (style.sectionHeaderStyle === 'pill') {
      activePage.drawRectangle({
        x: x - 4,
        y: yCursor - 3,
        width: boldFont.widthOfTextAtSize(title.toUpperCase(), baseSize + 2) + 12,
        height: baseSize + 8,
        color: primaryColor,
        opacity: 0.15,
      });
      activePage.drawText(title.toUpperCase(), {
        x: x + 2,
        y: yCursor,
        size: baseSize + 1,
        font: boldFont,
        color: primaryColor,
      });
      yCursor -= 14;
    } else if (style.sectionHeaderStyle === 'left-border') {
      activePage.drawLine({
        start: { x, y: yCursor + baseSize },
        end: { x, y: yCursor - 3 },
        thickness: 3,
        color: primaryColor,
      });
      activePage.drawText(title.toUpperCase(), {
        x: x + 8,
        y: yCursor,
        size: baseSize + 2,
        font: boldFont,
        color: primaryColor,
      });
      yCursor -= 12;
    } else {
      // Minimal bold
      activePage.drawText(title.toUpperCase(), {
        x,
        y: yCursor,
        size: baseSize + 2.5,
        font: boldFont,
        color: textColor,
      });
      yCursor -= 10;
    }
    
    return activePage;
  };

  // --- HEADER DRAWING ---
  const drawHeader = () => {
    const info = data.personalInfo;
    const contentWidth = pageWidth - 2 * margin;
    
    if (style.layoutStyle === 'creative') {
      let photoYOffset = 0;
      if (embeddedPhoto) {
        // Creative layout: Left sidebar width is 175. Center photo in sidebar
        currentPage.drawImage(embeddedPhoto, {
          x: 60,
          y: pageHeight - 75,
          width: 55,
          height: 55,
        });
        photoYOffset = 65;
      }
      
      // Draw sidebar title and name
      currentPage.drawText(info.fullName, {
        x: 15,
        y: pageHeight - 45 - photoYOffset,
        size: baseSize + 6,
        font: boldFont,
        color: rgb(1, 1, 1),
      });
      currentPage.drawText(info.title || '', {
        x: 15,
        y: pageHeight - 58 - photoYOffset,
        size: baseSize - 1,
        font: italicFont,
        color: rgb(0.9, 0.9, 0.9),
      });
      yCursor = pageHeight - margin - 15;
      return;
    }
    
    if (style.headerStyle === 'colored-banner') {
      // Draw background banner
      currentPage.drawRectangle({
        x: 0,
        y: pageHeight - margin - 80,
        width: pageWidth,
        height: margin + 80,
        color: primaryColor,
      });
      
      let textX = margin;
      if (embeddedPhoto) {
        currentPage.drawImage(embeddedPhoto, {
          x: margin,
          y: pageHeight - margin - 50,
          width: 50,
          height: 50,
        });
        textX += 62;
      }
      
      yCursor = pageHeight - 30;
      currentPage.drawText(info.fullName, {
        x: textX,
        y: yCursor,
        size: baseSize + 14,
        font: boldFont,
        color: pageBgColor,
      });
      
      yCursor -= 22;
      currentPage.drawText(info.title, {
        x: textX,
        y: yCursor,
        size: baseSize + 3,
        font: italicFont,
        color: accentColor,
      });
      
      yCursor -= 20;
      
      // Inline contact details on banner
      const contactItems = [info.email, info.phone, info.location, info.website].filter(Boolean);
      const contactText = contactItems.join('  |  ');
      currentPage.drawText(contactText, {
        x: textX,
        y: yCursor,
        size: baseSize - 1,
        font: font,
        color: pageBgColor,
      });
      
      const socialItems = [
        info.linkedin ? `LinkedIn: ${info.linkedin.replace('https://', '')}` : '',
        info.github ? `GitHub: ${info.github.replace('https://', '')}` : ''
      ].filter(Boolean);
      
      if (socialItems.length > 0) {
        yCursor -= 14;
        currentPage.drawText(socialItems.join('  |  '), {
          x: textX,
          y: yCursor,
          size: baseSize - 1.5,
          font: font,
          color: accentColor,
        });
      }
      
      yCursor = pageHeight - margin - 90;
      
    } else if (style.headerStyle === 'classic-centered') {
      yCursor -= 10;
      
      let photoYOffset = 0;
      if (embeddedPhoto) {
        currentPage.drawImage(embeddedPhoto, {
          x: (pageWidth - 50) / 2,
          y: yCursor - 50,
          width: 50,
          height: 50,
        });
        photoYOffset = 55;
        yCursor -= photoYOffset;
      }
      
      if (style.layoutStyle === 'executive') {
        currentPage.drawRectangle({
          x: margin,
          y: yCursor - 62,
          width: pageWidth - 2 * margin,
          height: 70,
          borderColor: primaryColor,
          borderWidth: 2,
        });
        currentPage.drawRectangle({
          x: margin + 3,
          y: yCursor - 59,
          width: pageWidth - 2 * margin - 6,
          height: 64,
          borderColor: primaryColor,
          borderWidth: 0.75,
        });
        yCursor -= 6;
      }
      
      const nameWidth = boldFont.widthOfTextAtSize(info.fullName, baseSize + 16);
      currentPage.drawText(info.fullName, {
        x: (pageWidth - nameWidth) / 2,
        y: yCursor,
        size: baseSize + 16,
        font: boldFont,
        color: primaryColor,
      });
      
      yCursor -= 20;
      const titleWidth = font.widthOfTextAtSize(info.title, baseSize + 2);
      currentPage.drawText(info.title, {
        x: (pageWidth - titleWidth) / 2,
        y: yCursor,
        size: baseSize + 2,
        font: italicFont,
        color: mutedColor,
      });
      
      yCursor -= 18;
      const contactItems = [info.email, info.phone, info.location, info.website].filter(Boolean);
      const contactText = contactItems.join('  •  ');
      const contactWidth = font.widthOfTextAtSize(contactText, baseSize - 1);
      currentPage.drawText(contactText, {
        x: (pageWidth - contactWidth) / 2,
        y: yCursor,
        size: baseSize - 1,
        font: font,
        color: textColor,
      });
      
      const socialItems = [info.linkedin, info.github].filter(Boolean).map(s => s.replace('https://', ''));
      if (socialItems.length > 0) {
        yCursor -= 14;
        const socialText = socialItems.join('  •  ');
        const socialWidth = font.widthOfTextAtSize(socialText, baseSize - 1);
        currentPage.drawText(socialText, {
          x: (pageWidth - socialWidth) / 2,
          y: yCursor,
          size: baseSize - 1,
          font: font,
          color: mutedColor,
        });
      }
      
      yCursor -= 16;
      
    } else if (style.headerStyle === 'modern-split') {
      yCursor -= 10;
      
      let textX = margin;
      if (embeddedPhoto) {
        currentPage.drawImage(embeddedPhoto, {
          x: margin,
          y: yCursor - 50,
          width: 50,
          height: 50,
        });
        textX += 62;
      }
      
      // Left side: Name and Title
      currentPage.drawText(info.fullName, {
        x: textX,
        y: yCursor,
        size: baseSize + 18,
        font: boldFont,
        color: primaryColor,
      });
      
      // Right side: First contact info item
      if (info.email) {
        const emailWidth = font.widthOfTextAtSize(info.email, baseSize - 0.5);
        currentPage.drawText(info.email, {
          x: pageWidth - margin - emailWidth,
          y: yCursor,
          size: baseSize - 0.5,
          font: font,
          color: textColor,
        });
      }
      
      yCursor -= 20;
      currentPage.drawText(info.title, {
        x: textX,
        y: yCursor,
        size: baseSize + 2,
        font: italicFont,
        color: secondaryColor,
      });
      
      if (info.phone) {
        const phoneWidth = font.widthOfTextAtSize(info.phone, baseSize - 0.5);
        currentPage.drawText(info.phone, {
          x: pageWidth - margin - phoneWidth,
          y: yCursor,
          size: baseSize - 0.5,
          font: font,
          color: textColor,
        });
      }
      
      yCursor -= 16;
      
      // Draw details list on right side
      const rightDetails = [
        info.location, 
        info.website?.replace('https://', ''),
        info.linkedin?.replace('https://', ''),
        info.github?.replace('https://', '')
      ].filter(Boolean);
      
      const rightDetailsText = rightDetails.join('  |  ');
      const detailsWidth = font.widthOfTextAtSize(rightDetailsText, baseSize - 1.5);
      
      currentPage.drawText(rightDetailsText, {
        x: pageWidth - margin - detailsWidth,
        y: yCursor,
        size: baseSize - 1.5,
        font: font,
        color: mutedColor,
      });
      
      // Draw an elegant line beneath split header
      yCursor -= 8;
      currentPage.drawLine({
        start: { x: margin, y: yCursor },
        end: { x: pageWidth - margin, y: yCursor },
        thickness: 0.5,
        color: borderColor,
      });
      
      yCursor -= 14;
      
    } else {
      // Left aligned
      yCursor -= 10;
      
      let textX = margin;
      if (embeddedPhoto) {
        currentPage.drawImage(embeddedPhoto, {
          x: margin,
          y: yCursor - 50,
          width: 50,
          height: 50,
        });
        textX += 62;
      }
      
      currentPage.drawText(info.fullName, {
        x: textX,
        y: yCursor,
        size: baseSize + 18,
        font: boldFont,
        color: primaryColor,
      });
      
      yCursor -= 22;
      currentPage.drawText(info.title, {
        x: textX,
        y: yCursor,
        size: baseSize + 3,
        font: italicFont,
        color: secondaryColor,
      });
      
      yCursor -= 18;
      const contactItems = [
        info.email,
        info.phone,
        info.location,
        info.website?.replace('https://', ''),
        info.linkedin?.replace('https://', ''),
        info.github?.replace('https://', '')
      ].filter(Boolean);
      
      currentPage.drawText(contactItems.join('  |  '), {
        x: textX,
        y: yCursor,
        size: baseSize - 1,
        font: font,
        color: mutedColor,
      });
      
      yCursor -= 16;
    }
  };

  // --- DRAW SINGLE COLUMN RESUME ---
  const drawSingleColumn = () => {
    const contentWidth = pageWidth - 2 * margin;
    const xPos = margin;

    const drawProfile = () => {
      if (data.personalInfo.summary) {
        drawSectionHeader(currentPage, 'Profile Summary', xPos, contentWidth);
        const summaryLines = wrapText(data.personalInfo.summary, contentWidth, font, baseSize + 0.5);
        for (const line of summaryLines) {
          checkSpaceAndAddNewPage(baseSize + lineGap);
          currentPage.drawText(line, {
            x: xPos,
            y: yCursor,
            size: baseSize + 0.5,
            font: font,
            color: textColor,
          });
          yCursor -= (baseSize + lineGap + 2);
        }
        yCursor -= sectionGap;
      }
    };

    const drawWork = () => {
      if (data.workExperience.length > 0) {
        drawSectionHeader(currentPage, 'Professional Experience', xPos, contentWidth);
        
        for (const job of data.workExperience) {
          if (style.layoutStyle === 'minimalist') {
            const leftColX = margin;
            const rightColX = margin + contentWidth * 0.28;
            const rightColW = contentWidth * 0.72;
            
            checkSpaceAndAddNewPage(baseSize * 2 + 10);
            currentPage.drawText(job.company, {
              x: leftColX,
              y: yCursor,
              size: baseSize,
              font: boldFont,
              color: primaryColor,
            });
            const dateText = `${job.startDate}—${job.current ? 'Pres' : job.endDate}`;
            currentPage.drawText(dateText, {
              x: leftColX,
              y: yCursor - 10,
              size: baseSize - 2,
              font: font,
              color: mutedColor,
            });
            currentPage.drawText(job.position, {
              x: rightColX,
              y: yCursor,
              size: baseSize + 0.5,
              font: boldFont,
              color: textColor,
            });
            yCursor -= (baseSize + 3);
            
            for (const bullet of job.description) {
              const wrappedBullets = wrapText(bullet, rightColW - 10, font, baseSize - 0.5);
              for (let i = 0; i < wrappedBullets.length; i++) {
                checkSpaceAndAddNewPage(baseSize + lineGap);
                currentPage.drawText(wrappedBullets[i], {
                  x: rightColX,
                  y: yCursor,
                  size: baseSize - 0.5,
                  font: font,
                  color: textColor,
                });
                yCursor -= (baseSize + lineGap + 1);
              }
            }
            yCursor -= itemGap;
          } else {
            checkSpaceAndAddNewPage(baseSize * 2 + 10);
            currentPage.drawText(job.company, {
              x: xPos,
              y: yCursor,
              size: baseSize + 1.5,
              font: boldFont,
              color: primaryColor,
            });
            if (job.location) {
              const locWidth = font.widthOfTextAtSize(job.location, baseSize - 0.5);
              currentPage.drawText(job.location, {
                x: pageWidth - margin - locWidth,
                y: yCursor,
                size: baseSize - 0.5,
                font: font,
                color: mutedColor,
              });
            }
            yCursor -= (baseSize + 3);
            currentPage.drawText(job.position, {
              x: xPos,
              y: yCursor,
              size: baseSize + 0.5,
              font: italicFont,
              color: textColor,
            });
            const dateText = `${job.startDate} — ${job.current ? 'Present' : job.endDate}`;
            const dateWidth = font.widthOfTextAtSize(dateText, baseSize - 0.5);
            currentPage.drawText(dateText, {
              x: pageWidth - margin - dateWidth,
              y: yCursor,
              size: baseSize - 0.5,
              font: font,
              color: textColor,
            });
            yCursor -= (baseSize + lineGap + 3);
            
            for (const bullet of job.description) {
              const wrappedBullets = wrapText(bullet, contentWidth - 14, font, baseSize);
              for (let i = 0; i < wrappedBullets.length; i++) {
                checkSpaceAndAddNewPage(baseSize + lineGap);
                if (i === 0) {
                  drawBulletStyle(currentPage, xPos, yCursor, baseSize);
                }
                currentPage.drawText(wrappedBullets[i], {
                  x: xPos + 12,
                  y: yCursor,
                  size: baseSize,
                  font: font,
                  color: textColor,
                });
                yCursor -= (baseSize + lineGap + 1.5);
              }
              yCursor -= 2;
            }
            yCursor -= itemGap;
          }
        }
        yCursor -= sectionGap;
      }
    };

    const drawProjects = () => {
      if (data.projects.length > 0) {
        drawSectionHeader(currentPage, 'Key Projects', xPos, contentWidth);
        for (const proj of data.projects) {
          checkSpaceAndAddNewPage(baseSize + 12);
          currentPage.drawText(proj.name, {
            x: xPos,
            y: yCursor,
            size: baseSize + 1,
            font: boldFont,
            color: textColor,
          });
          if (proj.link) {
            const cleanLink = proj.link.replace('https://', '').replace('http://', '');
            const linkWidth = font.widthOfTextAtSize(cleanLink, baseSize - 1.5);
            currentPage.drawText(cleanLink, {
              x: pageWidth - margin - linkWidth,
              y: yCursor,
              size: baseSize - 1.5,
              font: italicFont,
              color: secondaryColor,
            });
          }
          yCursor -= (baseSize + 3);
          const techText = proj.technologies.join(', ');
          currentPage.drawText(proj.role, {
            x: xPos,
            y: yCursor,
            size: baseSize - 0.5,
            font: italicFont,
            color: mutedColor,
          });
          if (techText) {
            const techWidth = font.widthOfTextAtSize(`[${techText}]`, baseSize - 1);
            currentPage.drawText(`[${techText}]`, {
              x: pageWidth - margin - techWidth,
              y: yCursor,
              size: baseSize - 1,
              font: font,
              color: primaryColor,
            });
          }
          yCursor -= (baseSize + lineGap + 3);
          
          for (const bullet of proj.description) {
            const wrappedBullets = wrapText(bullet, contentWidth - 14, font, baseSize);
            for (let i = 0; i < wrappedBullets.length; i++) {
              checkSpaceAndAddNewPage(baseSize + lineGap);
              if (i === 0) {
                drawBulletStyle(currentPage, xPos, yCursor, baseSize);
              }
              currentPage.drawText(wrappedBullets[i], {
                x: xPos + 12,
                y: yCursor,
                size: baseSize,
                font: font,
                color: textColor,
              });
              yCursor -= (baseSize + lineGap + 1.5);
            }
            yCursor -= 2;
          }
          yCursor -= itemGap;
        }
        yCursor -= sectionGap;
      }
    };

    const drawEducation = () => {
      if (data.education.length > 0) {
        drawSectionHeader(currentPage, 'Education', xPos, contentWidth);
        for (const edu of data.education) {
          if (style.layoutStyle === 'minimalist') {
            const leftColX = margin;
            const rightColX = margin + contentWidth * 0.28;
            checkSpaceAndAddNewPage(baseSize * 2 + 10);
            
            const dateText = `${edu.startDate} — ${edu.endDate}`;
            currentPage.drawText(dateText, {
              x: leftColX,
              y: yCursor,
              size: baseSize - 1.5,
              font: font,
              color: mutedColor,
            });
            currentPage.drawText(edu.institution, {
              x: rightColX,
              y: yCursor,
              size: baseSize + 0.5,
              font: boldFont,
              color: textColor,
            });
            yCursor -= (baseSize + 3);
            currentPage.drawText(`${edu.degree} in ${edu.major}`, {
              x: rightColX,
              y: yCursor,
              size: baseSize - 0.5,
              font: italicFont,
              color: textColor,
            });
            yCursor -= itemGap;
          } else {
            checkSpaceAndAddNewPage(baseSize * 2 + 10);
            currentPage.drawText(edu.institution, {
              x: xPos,
              y: yCursor,
              size: baseSize + 1,
              font: boldFont,
              color: textColor,
            });
            const dateText = `${edu.startDate} — ${edu.endDate}`;
            const dateWidth = font.widthOfTextAtSize(dateText, baseSize - 1);
            currentPage.drawText(dateText, {
              x: pageWidth - margin - dateWidth,
              y: yCursor,
              size: baseSize - 1,
              font: font,
              color: mutedColor,
            });
            yCursor -= (baseSize + 3);
            currentPage.drawText(`${edu.degree} in ${edu.major} ${edu.gpa ? `(GPA: ${edu.gpa})` : ''}`, {
              x: xPos,
              y: yCursor,
              size: baseSize - 0.5,
              font: font,
              color: textColor,
            });
            if (edu.location) {
              const locWidth = font.widthOfTextAtSize(edu.location, baseSize - 1);
              currentPage.drawText(edu.location, {
                x: pageWidth - margin - locWidth,
                y: yCursor,
                size: baseSize - 1,
                font: italicFont,
                color: mutedColor,
              });
            }
            yCursor -= (baseSize + 8);
          }
        }
        yCursor -= sectionGap;
      }
    };

    const drawSkills = () => {
      if (data.skills.length > 0) {
        drawSectionHeader(currentPage, 'Skills', xPos, contentWidth);
        for (const skillCat of data.skills) {
          checkSpaceAndAddNewPage(baseSize + 6);
          if (style.skillStyle === 'pills') {
            currentPage.drawText(`${skillCat.category}:`, {
              x: xPos,
              y: yCursor,
              size: baseSize,
              font: boldFont,
              color: textColor,
            });
            let skillX = xPos + boldFont.widthOfTextAtSize(`${skillCat.category}:`, baseSize) + 8;
            for (const skill of skillCat.skills) {
              const labelWidth = font.widthOfTextAtSize(skill, baseSize - 1);
              const pillWidth = labelWidth + 10;
              if (skillX + pillWidth > pageWidth - margin) {
                yCursor -= (baseSize + 6);
                checkSpaceAndAddNewPage(baseSize + 6);
                skillX = xPos + 20;
              }
              currentPage.drawRectangle({
                x: skillX,
                y: yCursor - 2,
                width: pillWidth,
                height: baseSize + 4,
                color: accentColor,
                borderColor: borderColor,
                borderWidth: 0.5,
              });
              currentPage.drawText(skill, {
                x: skillX + 5,
                y: yCursor + 1,
                size: baseSize - 1,
                font: font,
                color: primaryColor,
              });
              skillX += pillWidth + 6;
            }
            yCursor -= (baseSize + 10);
          } else {
            const skillsList = skillCat.skills.join(', ');
            const lineText = `${skillCat.category}: ${skillsList}`;
            const wrappedSkillLines = wrapText(lineText, contentWidth, font, baseSize);
            for (const line of wrappedSkillLines) {
              checkSpaceAndAddNewPage(baseSize + lineGap);
              currentPage.drawText(line, {
                x: xPos,
                y: yCursor,
                size: baseSize,
                font: font,
                color: textColor,
              });
              yCursor -= (baseSize + lineGap + 2);
            }
          }
        }
        yCursor -= sectionGap;
      }
    };

    const drawCertificationsAndLanguages = () => {
      const hasCerts = data.certifications.length > 0;
      const hasLangs = data.languages.length > 0;
      if (hasCerts || hasLangs) {
        checkSpaceAndAddNewPage(40);
        if (hasCerts && hasLangs) {
          const colWidth = (contentWidth - 20) / 2;
          const certX = xPos;
          const langX = xPos + colWidth + 20;
          const leftY = yCursor;
          
          yCursor = leftY;
          drawSectionHeader(currentPage, 'Certifications', certX, colWidth);
          for (const cert of data.certifications) {
            checkSpaceAndAddNewPage(baseSize + 8);
            currentPage.drawText(cert.name, {
              x: certX,
              y: yCursor,
              size: baseSize,
              font: boldFont,
              color: textColor,
            });
            yCursor -= (baseSize + 2);
            currentPage.drawText(`${cert.issuer} • ${cert.date}`, {
              x: certX,
              y: yCursor,
              size: baseSize - 1.5,
              font: font,
              color: mutedColor,
            });
            yCursor -= (baseSize + 6);
          }
          const nextLeftY = yCursor;
          
          yCursor = leftY;
          drawSectionHeader(currentPage, 'Languages', langX, colWidth);
          for (const lang of data.languages) {
            checkSpaceAndAddNewPage(baseSize + 4);
            currentPage.drawText(lang.name, {
              x: langX,
              y: yCursor,
              size: baseSize,
              font: boldFont,
              color: textColor,
            });
            const profWidth = font.widthOfTextAtSize(`(${lang.proficiency})`, baseSize - 1);
            currentPage.drawText(`(${lang.proficiency})`, {
              x: langX + colWidth - profWidth,
              y: yCursor,
              size: baseSize - 1,
              font: italicFont,
              color: mutedColor,
            });
            yCursor -= (baseSize + 6);
          }
          yCursor = Math.min(nextLeftY, yCursor) - sectionGap;
        } else if (hasCerts) {
          drawSectionHeader(currentPage, 'Certifications', xPos, contentWidth);
          for (const cert of data.certifications) {
            checkSpaceAndAddNewPage(baseSize + 6);
            currentPage.drawText(cert.name, {
              x: xPos,
              y: yCursor,
              size: baseSize,
              font: boldFont,
              color: textColor,
            });
            const dateText = `${cert.issuer} | ${cert.date}`;
            const dateWidth = font.widthOfTextAtSize(dateText, baseSize - 1);
            currentPage.drawText(dateText, {
              x: pageWidth - margin - dateWidth,
              y: yCursor,
              size: baseSize - 1,
              font: font,
              color: mutedColor,
            });
            yCursor -= (baseSize + 8);
          }
        } else if (hasLangs) {
          drawSectionHeader(currentPage, 'Languages', xPos, contentWidth);
          for (const lang of data.languages) {
            checkSpaceAndAddNewPage(baseSize + 6);
            currentPage.drawText(lang.name, {
              x: xPos,
              y: yCursor,
              size: baseSize,
              font: boldFont,
              color: textColor,
            });
            const profWidth = font.widthOfTextAtSize(lang.proficiency, baseSize - 1);
            currentPage.drawText(lang.proficiency, {
              x: pageWidth - margin - profWidth,
              y: yCursor,
              size: baseSize - 1,
              font: italicFont,
              color: mutedColor,
            });
            yCursor -= (baseSize + 8);
          }
        }
      }
    };

    // Sequential Layout Order Routing
    if (style.layoutStyle === 'academic') {
      drawEducation();
      drawProfile();
      drawWork();
      drawProjects();
      drawSkills();
      drawCertificationsAndLanguages();
    } else {
      drawProfile();
      drawWork();
      drawProjects();
      drawEducation();
      drawSkills();
      drawCertificationsAndLanguages();
    }
  };

  // --- DRAW TWO COLUMN RESUME ---
  const drawTwoColumn = (isLeftSidebar: boolean) => {
    const isCreative = style.layoutStyle === 'creative';
    const isTimelineStyle = style.layoutStyle === 'timeline';
    const totalContentWidth = pageWidth - 2 * margin;
    const sidebarWidth = isCreative ? 145 : 160;
    const gap = isCreative ? 20 : 16;
    const mainWidth = totalContentWidth - sidebarWidth - gap;
    
    const sidebarX = isLeftSidebar 
      ? (isCreative ? 15 : margin) 
      : (isCreative ? pageWidth - 145 - 15 : margin + mainWidth + gap);
      
    const mainX = isLeftSidebar 
      ? (isCreative ? 190 : margin + sidebarWidth + gap) 
      : margin;
      
    const topY = yCursor;
    yCursor = topY;
    
    // 1. Profile Summary (Main Column)
    if (data.personalInfo.summary) {
      drawSectionHeader(currentPage, 'Profile Summary', mainX, mainWidth);
      const summaryLines = wrapText(data.personalInfo.summary, mainWidth, font, baseSize + 0.5);
      for (const line of summaryLines) {
        checkSpaceAndAddNewPage(baseSize + lineGap);
        currentPage.drawText(line, {
          x: mainX,
          y: yCursor,
          size: baseSize + 0.5,
          font: font,
          color: textColor,
        });
        yCursor -= (baseSize + lineGap + 2);
      }
      yCursor -= sectionGap;
    }
    
    // 2. Experience (Main Column)
    if (data.workExperience.length > 0) {
      drawSectionHeader(currentPage, 'Experience', mainX, mainWidth);
      for (const job of data.workExperience) {
        checkSpaceAndAddNewPage(baseSize * 2 + 10);
        
        if (isTimelineStyle) {
          currentPage.drawCircle({
            x: mainX - 10,
            y: yCursor + 4,
            size: 3,
            color: primaryColor,
          });
          currentPage.drawLine({
            start: { x: mainX - 10, y: yCursor },
            end: { x: mainX - 10, y: yCursor - 55 },
            thickness: 1,
            color: primaryColor,
            opacity: 0.3
          });
        }
        
        currentPage.drawText(job.company, {
          x: mainX,
          y: yCursor,
          size: baseSize + 1,
          font: boldFont,
          color: primaryColor,
        });
        
        const dateText = `${job.startDate} — ${job.current ? 'Present' : job.endDate}`;
        const dateWidth = font.widthOfTextAtSize(dateText, baseSize - 1.5);
        currentPage.drawText(dateText, {
          x: mainX + mainWidth - dateWidth,
          y: yCursor,
          size: baseSize - 1.5,
          font: font,
          color: mutedColor,
        });
        
        yCursor -= (baseSize + 2);
        currentPage.drawText(job.position, {
          x: mainX,
          y: yCursor,
          size: baseSize,
          font: italicFont,
          color: textColor,
        });
        
        yCursor -= (baseSize + lineGap + 2);
        for (const bullet of job.description) {
          const wrapped = wrapText(bullet, mainWidth - 12, font, baseSize - 0.5);
          for (let i = 0; i < wrapped.length; i++) {
            checkSpaceAndAddNewPage(baseSize + lineGap);
            if (i === 0) {
              drawBulletStyle(currentPage, mainX, yCursor, baseSize - 0.5);
            }
            currentPage.drawText(wrapped[i], {
              x: mainX + 10,
              y: yCursor,
              size: baseSize - 0.5,
              font: font,
              color: textColor,
            });
            yCursor -= (baseSize + lineGap + 1);
          }
          yCursor -= 2;
        }
        yCursor -= itemGap;
      }
      yCursor -= sectionGap;
    }
    
    // 3. Projects (Main Column)
    if (data.projects.length > 0) {
      drawSectionHeader(currentPage, 'Key Projects', mainX, mainWidth);
      for (const proj of data.projects) {
        checkSpaceAndAddNewPage(baseSize + 12);
        currentPage.drawText(proj.name, {
          x: mainX,
          y: yCursor,
          size: baseSize + 1,
          font: boldFont,
          color: textColor,
        });
        if (proj.link) {
          const cleanLink = proj.link.replace('https://', '').replace('http://', '');
          const linkWidth = font.widthOfTextAtSize(cleanLink, baseSize - 1.5);
          currentPage.drawText(cleanLink, {
            x: mainX + mainWidth - linkWidth,
            y: yCursor,
            size: baseSize - 1.5,
            font: italicFont,
            color: secondaryColor,
          });
        }
        yCursor -= (baseSize + 2);
        currentPage.drawText(proj.role, {
          x: mainX,
          y: yCursor,
          size: baseSize - 0.5,
          font: italicFont,
          color: mutedColor,
        });
        const techText = proj.technologies.join(', ');
        if (techText) {
          const techWidth = font.widthOfTextAtSize(`[${techText}]`, baseSize - 1.5);
          currentPage.drawText(`[${techText}]`, {
            x: mainX + mainWidth - techWidth,
            y: yCursor,
            size: baseSize - 1.5,
            font: font,
            color: primaryColor,
          });
        }
        yCursor -= (baseSize + lineGap + 2);
        for (const bullet of proj.description) {
          const wrapped = wrapText(bullet, mainWidth - 12, font, baseSize - 0.5);
          for (let i = 0; i < wrapped.length; i++) {
            checkSpaceAndAddNewPage(baseSize + lineGap);
            if (i === 0) {
              drawBulletStyle(currentPage, mainX, yCursor, baseSize - 0.5);
            }
            currentPage.drawText(wrapped[i], {
              x: mainX + 10,
              y: yCursor,
              size: baseSize - 0.5,
              font: font,
              color: textColor,
            });
            yCursor -= (baseSize + lineGap + 1);
          }
          yCursor -= 2;
        }
        yCursor -= itemGap;
      }
      yCursor -= sectionGap;
    }
    
    // 4. Education (Main Column)
    if (data.education.length > 0) {
      drawSectionHeader(currentPage, 'Education', mainX, mainWidth);
      for (const edu of data.education) {
        checkSpaceAndAddNewPage(baseSize * 2 + 10);
        currentPage.drawText(edu.institution, {
          x: mainX,
          y: yCursor,
          size: baseSize + 1,
          font: boldFont,
          color: textColor,
        });
        const dateText = `${edu.startDate} — ${edu.endDate}`;
        const datesWidth = font.widthOfTextAtSize(dateText, baseSize - 1.5);
        currentPage.drawText(dateText, {
          x: mainX + mainWidth - datesWidth,
          y: yCursor,
          size: baseSize - 1.5,
          font: font,
          color: mutedColor,
        });
        yCursor -= (baseSize + 2);
        currentPage.drawText(`${edu.degree} in ${edu.major}`, {
          x: mainX,
          y: yCursor,
          size: baseSize - 0.5,
          font: font,
          color: textColor,
        });
        yCursor -= itemGap;
      }
    }
    
    // --- DRAW SIDEBAR ---
    let sidebarY = topY;
    const sidebarTextColor = isCreative ? rgb(1, 1, 1) : textColor;
    const sidebarTitleColor = isCreative ? rgb(1, 1, 1) : primaryColor;
    const sidebarMutedColor = isCreative ? rgb(0.9, 0.9, 0.9) : mutedColor;
    
    if (!isCreative) {
      currentPage.drawLine({
        start: { x: isLeftSidebar ? margin + sidebarWidth + 6 : margin + mainWidth + 8, y: margin },
        end: { x: isLeftSidebar ? margin + sidebarWidth + 6 : margin + mainWidth + 8, y: topY + 10 },
        thickness: 0.5,
        color: borderColor,
      });
    } else {
      sidebarY -= 15;
      currentPage.drawText('CONTACT', {
        x: sidebarX,
        y: sidebarY,
        size: baseSize + 1,
        font: boldFont,
        color: sidebarTitleColor,
      });
      sidebarY -= 4;
      currentPage.drawLine({
        start: { x: sidebarX, y: sidebarY },
        end: { x: sidebarX + sidebarWidth, y: sidebarY },
        thickness: 0.5,
        color: sidebarTitleColor,
      });
      sidebarY -= 14;
      
      const info = data.personalInfo;
      const contacts = [info.email, info.phone, info.location, info.website?.replace('https://', '')].filter(Boolean);
      for (const item of contacts) {
        currentPage.drawText(item, {
          x: sidebarX,
          y: sidebarY,
          size: baseSize - 2.5,
          font: font,
          color: sidebarTextColor,
        });
        sidebarY -= (baseSize - 1.5);
      }
      sidebarY -= 12;
    }
    
    // 1. Sidebar Skills
    if (data.skills.length > 0) {
      sidebarY -= 6;
      currentPage.drawText('SKILLS', {
        x: sidebarX,
        y: sidebarY,
        size: baseSize + 1,
        font: boldFont,
        color: sidebarTitleColor,
      });
      sidebarY -= 4;
      currentPage.drawLine({
        start: { x: sidebarX, y: sidebarY },
        end: { x: sidebarX + sidebarWidth, y: sidebarY },
        thickness: 0.5,
        color: sidebarTitleColor,
      });
      sidebarY -= 12;
      
      for (const skillCat of data.skills) {
        currentPage.drawText(skillCat.category, {
          x: sidebarX,
          y: sidebarY,
          size: baseSize - 1.5,
          font: boldFont,
          color: sidebarTextColor,
        });
        sidebarY -= (baseSize - 0.5);
        
        if (style.skillStyle === 'pills') {
          let pillX = sidebarX;
          for (const s of skillCat.skills) {
            const sWidth = font.widthOfTextAtSize(s, baseSize - 2.5);
            const pillW = sWidth + 6;
            
            if (pillX + pillW > sidebarX + sidebarWidth) {
              sidebarY -= (baseSize + 3);
              pillX = sidebarX;
            }
            currentPage.drawRectangle({
              x: pillX,
              y: sidebarY - 1,
              width: pillW,
              height: baseSize + 1.5,
              color: isCreative ? rgb(1, 1, 1) : accentColor,
              opacity: isCreative ? 0.15 : 1.0,
              borderColor: isCreative ? rgb(1, 1, 1) : borderColor,
              borderWidth: 0.5,
            });
            currentPage.drawText(s, {
              x: pillX + 3,
              y: sidebarY + 0.5,
              size: baseSize - 2.5,
              font: font,
              color: sidebarTextColor,
            });
            pillX += pillW + 3;
          }
          sidebarY -= (baseSize + 5);
        } else {
          const skillText = skillCat.skills.join(', ');
          const wrappedSkills = wrapText(skillText, sidebarWidth, font, baseSize - 2);
          for (const s of wrappedSkills) {
            currentPage.drawText(s, {
              x: sidebarX,
              y: sidebarY,
              size: baseSize - 2,
              font: font,
              color: sidebarTextColor,
            });
            sidebarY -= (baseSize - 1.5);
          }
          sidebarY -= 4;
        }
      }
      sidebarY -= 8;
    }
    
    // 2. Languages
    if (data.languages.length > 0) {
      currentPage.drawText('LANGUAGES', {
        x: sidebarX,
        y: sidebarY,
        size: baseSize + 1,
        font: boldFont,
        color: sidebarTitleColor,
      });
      sidebarY -= 4;
      currentPage.drawLine({
        start: { x: sidebarX, y: sidebarY },
        end: { x: sidebarX + sidebarWidth, y: sidebarY },
        thickness: 0.5,
        color: sidebarTitleColor,
      });
      sidebarY -= 12;
      for (const lang of data.languages) {
        currentPage.drawText(lang.name, {
          x: sidebarX,
          y: sidebarY,
          size: baseSize - 2,
          font: boldFont,
          color: sidebarTextColor,
        });
        currentPage.drawText(lang.proficiency, {
          x: sidebarX + sidebarWidth - font.widthOfTextAtSize(lang.proficiency, baseSize - 2.5),
          y: sidebarY,
          size: baseSize - 2.5,
          font: italicFont,
          color: sidebarMutedColor,
        });
        sidebarY -= (baseSize + 2);
      }
      sidebarY -= 10;
    }
    
    // 3. Certifications
    if (data.certifications.length > 0) {
      currentPage.drawText('CERTIFICATIONS', {
        x: sidebarX,
        y: sidebarY,
        size: baseSize + 1,
        font: boldFont,
        color: sidebarTitleColor,
      });
      sidebarY -= 4;
      currentPage.drawLine({
        start: { x: sidebarX, y: sidebarY },
        end: { x: sidebarX + sidebarWidth, y: sidebarY },
        thickness: 0.5,
        color: sidebarTitleColor,
      });
      sidebarY -= 12;
      for (const cert of data.certifications) {
        const lines = wrapText(cert.name, sidebarWidth, font, baseSize - 2);
        for (const line of lines) {
          currentPage.drawText(line, {
            x: sidebarX,
            y: sidebarY,
            size: baseSize - 2,
            font: boldFont,
            color: sidebarTextColor,
          });
          sidebarY -= (baseSize - 1.5);
        }
        currentPage.drawText(`${cert.issuer} (${cert.date})`, {
          x: sidebarX,
          y: sidebarY,
          size: baseSize - 2.5,
          font: font,
          color: sidebarMutedColor,
        });
        sidebarY -= (baseSize + 4);
      }
    }
  };

  // Run the appropriate builder
  drawHeader();
  
  if (style.layoutType === 'single-column') {
    drawSingleColumn();
  } else if (style.layoutType === 'two-column-left') {
    drawTwoColumn(true);
  } else if (style.layoutType === 'two-column-right') {
    drawTwoColumn(false);
  }
  
  // Return compiled bytes
  return await pdfDoc.save();
}
