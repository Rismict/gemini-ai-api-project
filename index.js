import 'dotenv/config'; // Load environment variables from .env file
// const {GoogleGenerativeAI} = require('@google/generative-ai'); error pakai import
import {GoogleGenerativeAI} from '@google/generative-ai'; // Import the Google Generative AI client
// Initialize the Google Generative AI client with your API key
import express from 'express'; // Import express for creating a web server
import multer from 'multer'; // Import multer for handling file uploads
import path from 'path'; // Import path for handling file paths
import fs from 'fs'; // Import fs for file system operations


const app = express();
const port = 3000;



const genAI= new GoogleGenerativeAI(
    process.env.GEMINI_API_KEY
);

const model= genAI.getGenerativeModel({
    model: 'gemini-1.5-flash'
}); 

const upload= multer({dest: 'uploads' });
app.use(express.json()); // Middleware to parse JSON bodies

app.post(
  '/generate-text',
  upload.none(), // Accept form-data without files
  async (req, res) => {
    const prompt = req.body.prompt || 'Hello, Gemini!'; // Get prompt from form-data
    try {
      const result = await model.generateContent([prompt]);
      const response = result.response;
      res.json({ output: response.text()});
    } catch (error) {
      console.error('Error generating text:', error);
      res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
  }
);

// Endpoint to handle image upload and text generation
app.post(
  '/generate-from-image',
  upload.single('image'), // Use multer to handle single file upload with field name 'image'
  async (req, res) => {
    const prompt = req.body.prompt || 'Describe the image';
    function imageToGenerativePart(filePath) {
      const imageBuffer = fs.readFileSync(filePath);
      return {
        inlineData: {
          mimeType: 'image/png',
          data: imageBuffer.toString('base64')
        }
      };
    }
    const image = imageToGenerativePart(req.file.path); 
    try {
      const result = await model.generateContent([prompt, image]);
      const response = await result.response;
      res.json({ output: response.text()});
    } catch (error) {
      console.error('Error generating text:', error);
      res.status(500).json({ error: error.message || 'Internal Server Error' });
    } finally {
      // Clean up the uploaded file
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    }
  }
);

app.post(
  '/generate-from-document',
  upload.single('document'), 
  async (req, res) => {
    const prompt = req.body.prompt || 'Summarize the document';
    function documentToGenerativePart(filePath) {
      const documentBuffer = fs.readFileSync(filePath);
      return {
        inlineData: {
          mimeType: 'application/pdf',
          data: documentBuffer.toString('base64')
        }
      };
    }
    const document = documentToGenerativePart(req.file.path); 
    try {
      const result = await model.generateContent([prompt, document]);
      const response = await result.response;
      res.json({ output: response.text()});
    } catch (error) {
      console.error('Error generating text:', error);
      res.status(500).json({ error: error.message || 'Internal Server Error' });
    } finally {
      // Clean up the uploaded file
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    }
  } 
);

app.post(
  '/generate-from-audio',
  upload.single('audio'),
  async (req, res) => {
    const prompt = req.body.prompt || 'Transcribe the audio';
    function audioToGenerativePart(filePath) {
      const audioBuffer = fs.readFileSync(filePath);
      return {
        inlineData: {
          mimeType: 'audio/mpeg',
          data: audioBuffer.toString('base64')
        }
      };
    }
    const audio = audioToGenerativePart(req.file.path); 
    try {
      const result = await model.generateContent([prompt, audio]);
      const response = await result.response;
      res.json({ output: response.text()});
    } catch (error) {
      console.error('Error generating text:', error);
      res.status(500).json({ error: error.message || 'Internal Server Error' });
    } finally {
      // Clean up the uploaded file
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    }
  } 
);


app.listen(port, () => {
  console.log(`Gemini server is running at http://localhost:${port}`);
});


