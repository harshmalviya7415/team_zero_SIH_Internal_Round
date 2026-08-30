const fs = require('fs');
const path = require('path');
const os = require('os');
const https = require('https');

let ptp;
if (process.platform === 'win32') {
    try {
        ptp = require('pdf-to-printer');
    } catch (e) {
        console.warn("pdf-to-printer package is not installed or failed to load. Silent printing will be mocked.", e.message);
    }
}

const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');

async function printCloudinaryPdf(pdfUrl, settings = {}) {
    const tempDir = os.tmpdir();
    const fileName = `print_job_${Date.now()}.pdf`;
    const tempFilePath = path.join(tempDir, fileName);

    try {
        console.log(`Downloading PDF from: ${pdfUrl}`);
        await downloadFile(pdfUrl, tempFilePath);
        console.log(`PDF temporarily saved to: ${tempFilePath}`);

        let totalPages = 0;
        if (settings.jobId) {
            try {
                console.log(`Adding new page with Job ID: ${settings.jobId} to the end of the PDF...`);
                const existingPdfBytes = fs.readFileSync(tempFilePath);
                const pdfDoc = await PDFDocument.load(existingPdfBytes);
                const pages = pdfDoc.getPages();
                
                const dimensions = pages.length > 0 ? pages[0].getSize() : { width: 600, height: 800 };
                const newPage = pdfDoc.addPage([dimensions.width, dimensions.height]);
                
                const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
                newPage.drawText(`Print Job ID: ${settings.jobId}`, {
                    x: 50,
                    y: dimensions.height - 50,
                    size: 10,
                    font: font,
                    color: rgb(0, 0, 0),
                });
                
                const pdfBytes = await pdfDoc.save();
                fs.writeFileSync(tempFilePath, pdfBytes);
                totalPages = pdfDoc.getPages().length;
                console.log(`New page with Job ID successfully added to the end. Total pages: ${totalPages}`);
            } catch (pdfError) {
                console.error("Failed to add Job ID page to PDF:", pdfError.message);
            }
        }

        const printOptions = {
            silent: true, 
            paperSize: settings.printSize || 'A4', 
            side: settings.duplex ? 'duplex' : 'simplex', 
            monochrome: settings.color === false, 
            copies: settings.copies || 1,
        };

        if (settings.pages && settings.pages.toLowerCase() !== 'all') {
            if (totalPages > 0) {
                printOptions.pages = `${settings.pages},${totalPages}`;
            } else {
                printOptions.pages = String(settings.pages);
            }
        }

        console.log(`Sending to default printer with options:`, printOptions);
        
        if (process.platform === 'win32' && ptp) {
            await ptp.print(tempFilePath, printOptions);
            console.log('✅ Print job successfully spooled to the Windows default printer.');
        } else {
            console.log(`⚠️ OS Platform is '${process.platform}'. Mocking silent print job completion (non-Windows system).`);
        }

    } catch (error) {
        console.error('❌ Error during the print process:', error);
        throw error;
    } finally {
        if (fs.existsSync(tempFilePath)) {
            try {
                fs.unlinkSync(tempFilePath);
                console.log(`Cleaned up temp file: ${tempFilePath}`);
            } catch (cleanupError) {
                console.error(`Could not delete temp file: ${tempFilePath}`, cleanupError);
            }
        }
    }
}

function downloadFile(url, destPath) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(destPath);
        
        https.get(url, (response) => {
            if (response.statusCode !== 200) {
                return reject(new Error(`Failed to download file. Status code: ${response.statusCode}`));
            }
            
            response.pipe(file);
            
            file.on('finish', () => {
                file.close();
                resolve();
            });
        }).on('error', (err) => {
            fs.unlink(destPath, () => reject(err));
        });
    });
}

module.exports = { printCloudinaryPdf };
