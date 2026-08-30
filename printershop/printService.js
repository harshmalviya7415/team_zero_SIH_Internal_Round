const fs = require('fs');
const path = require('path');
const os = require('os');
const https = require('https');

let ptp;
if (process.platform === 'win32') {
    try {
        ptp = require('pdf-to-printer'); // Native Windows PDF printing library
    } catch (e) {
        console.warn("pdf-to-printer package is not installed or failed to load. Silent printing will be mocked.", e.message);
    }
}

/**
 * Downloads a PDF and prints it silently to the Windows default printer.
 * 
 * @param {string} pdfUrl - The direct Cloudinary URL of the PDF.
 * @param {object} settings - Print configuration properties.
 */
async function printCloudinaryPdf(pdfUrl, settings = {}) {
    // 1. Generate a temporary file path
    const tempDir = os.tmpdir();
    const fileName = `print_job_${Date.now()}.pdf`;
    const tempFilePath = path.join(tempDir, fileName);

    try {
        // 2. Download the PDF locally
        console.log(`Downloading PDF from: ${pdfUrl}`);
        await downloadFile(pdfUrl, tempFilePath);
        console.log(`PDF temporarily saved to: ${tempFilePath}`);

        // 3. Map your settings to print options
        const printOptions = {
            silent: true, 
            paperSize: settings.printSize || 'A4', 
            side: settings.duplex ? 'duplex' : 'simplex', 
            monochrome: settings.color === false, 
            copies: settings.copies || 1,
        };

        if (settings.pages && settings.pages.toLowerCase() !== 'all') {
            printOptions.pages = String(settings.pages);
        }

        // 4. Execute the print job on the default machine printer
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
        // 5. Always clean up the temporary file
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

/**
 * Helper function to download a file using native Node.js HTTPS.
 */
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
