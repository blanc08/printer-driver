import express, { Request, Response, Application } from 'express';
import { getPrinters, print } from 'pdf-to-printer';
import multer from 'multer';
import 'dotenv/config'

const upload = multer({ dest: 'uploads/' })

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic health check endpoint
app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({
        status: 'OK',
        message: 'Printer Driver API is running',
        timestamp: new Date().toISOString(),
    });
});

// API routes
app.get('/api/printers', async (req: Request, res: Response) => {
    try {
        const printers = await getPrinters();

        res.json({
            message: 'List of available printers',
            printers,
        });
    } catch (error) {
        console.error('Error fetching printers:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to retrieve printers',
        });
    }
});



app.post('/api/print', upload.single('document'), async (req: Request, res: Response) => {
    try {


        const document = req.file;
        const printId = process.env.PRINTER_ID;

        if (!document || !printId) {
            return res.status(400).json({
                error: 'Missing required field: document or printer ID',
            });
        }

        await print(document.path, { printer: printId });

        return res.json({
            message: 'Print job submitted successfully',
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to submit print job',
        });
    }
});

// 404 handler
app.use('*', (req: Request, res: Response) => {
    res.status(404).json({
        error: 'Endpoint not found',
        path: req.originalUrl,
    });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response) => {
    console.error('Error:', err.message);
    res.status(500).json({
        error: 'Internal server error',
        message: err.message,
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Printer Driver API server is running on port ${PORT}`);
    console.log(`📍 Health check: http://localhost:${PORT}/health`);
    console.log(`📋 API endpoints:`);
    console.log(`   GET  /api/printers - List available printers`);
    console.log(`   POST /api/print - Submit print job`);
});

export default app;