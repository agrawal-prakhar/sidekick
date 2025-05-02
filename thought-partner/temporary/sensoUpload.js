require('dotenv').config();
const axios = require('axios');
const { randomUUID } = require('crypto');


async function uploadToSenso(source, content) {
  try {
    fileId = `${source}-${randomUUID()}`;
    const response = await axios.post(
      'https://api.senso.ai/api/v1/content/update-file-content',
      { fileId, content },
      {
        headers: {
          Authorization: `Bearer ${process.env.SENSO_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );
    console.log('✅ Uploaded to Senso:', response.data);
    return response.data;
  } catch (err) {
    console.error('❌ Upload failed:', err.response?.data || err.message);
    return null;
  }
}

// Example usage
// uploadToSenso("your_file_id", "Sample content");

module.exports = uploadToSenso;
