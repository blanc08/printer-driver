import express, { Request, Response, Application } from 'express';
import { getDefaultPrinter, getPrinters, print } from 'pdf-to-printer';
import 'dotenv/config'
import { unlinkSync, writeFileSync } from 'fs';

const app: Application = express();
const PORT = process.env.PORT || 3000;

// If ./uploads directory does not exist, create it
import { existsSync, mkdirSync } from 'fs';
if (!existsSync('./uploads')) {
    mkdirSync('./uploads');
}

// Middleware
app.use(express.json({ limit: '10mb' }));
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



app.post('/api/print', async (req: Request, res: Response) => {
    try {
        // Document is base64 encoded string
        const document = req.body.document;
        // Save the document to a temporary file
        const tempFilePath = `uploads/${Date.now()}.pdf`;
        writeFileSync(tempFilePath, Buffer.from(document, 'base64'));

        const printerId = process.env.PRINTER_ID;

        if (!document || !printerId) {
            return res.status(400).json({
                error: 'Missing required field: document or printer ID',
            });
        }

        let orientation: 'portrait' | 'landscape' = 'portrait';
        if (process.env.PRINTER_ORIENTATION === 'landscape') {
            orientation = 'landscape';
        }

        const paperSize = process.env.PRINTER_PAPER_SIZE;
        if (!paperSize) {
            return res.status(400).json({
                error: 'Missing required configuration field: paper size',
            });
        }

        await print(tempFilePath, {
            printer: printerId,
            orientation: orientation,
            paperSize: paperSize,
            scale: 'noscale',
        });

        // Delete the temporary file after printing
        unlinkSync(tempFilePath);

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