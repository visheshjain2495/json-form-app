import express from 'express';
import bodyParser from 'body-parser';
import { writeFile, readFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Express app
const app = express();
const port = 3000;

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// POST handler to save form data
app.post('/submit', async (req, res) => {
  const { name, email } = req.body;

  const newSubmission = {
    name,
    email,
    submittedAt: new Date().toISOString(),
  };

  try {
    // Path to the JSON file where submissions will be stored
    const filePath = path.join(__dirname, 'data', 'submissions.json');
    
    // Read existing submissions (if any)
    let submissions = [];
    try {
      const data = await readFile(filePath, 'utf8');
      submissions = JSON.parse(data);
    } catch (err) {
      // If file does not exist, we can safely continue with an empty array
    }

    // Add the new submission to the array
    submissions.push(newSubmission);

    // Write the updated submissions array to the JSON file
    await writeFile(filePath, JSON.stringify(submissions, null, 2));

    // Send a success message back to the user
    res.send(`<h2>Thank you, ${name}. Your submission has been received!</h2>`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Something went wrong.');
  }
});

// Handle 404 - Not Found
app.use((req, res) => {
  res.status(404).send('Page Not Found');
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
