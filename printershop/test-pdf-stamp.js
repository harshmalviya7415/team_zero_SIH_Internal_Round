const fs = require('fs');
const path = require('path');
const { printCloudinaryPdf } = require('./printService');

const targetUrl = "https://res.cloudinary.com/vybe-social/raw/upload/v1788089214/team_zero/SIH-PPT";
const testJobId = "ORDER_MOCK_ADD_PAGE_123456";

const runTest = async () => {
  console.log(`Downloading and testing file from: ${targetUrl}`);
  try {
    await printCloudinaryPdf(targetUrl, {
      jobId: testJobId,
      printSize: 'A4',
      duplex: true,
      color: true,
      copies: 1,
      pages: 'all'
    });
    console.log("✅ Process finished.");
  } catch (err) {
    console.error("❌ Process failed:", err);
  }
};

runTest();
