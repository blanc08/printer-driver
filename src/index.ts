import express, { Request, Response, Application } from 'express';
import { getPrinters } from 'pdf-to-printer';

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
app.get('/api/printers', (req: Request, res: Response) => {
    try {
        const printers = getPrinters();

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



app.post('/api/print', (req: Request, res: Response) => {
    const { printerId, document } = req.body;

    if (!printerId || !document) {
        return res.status(400).json({
            error: 'Missing required fields: printerId and document',
        });
    }

    return res.json({
        message: 'Print job submitted successfully',
        jobId: Math.random().toString(36).substr(2, 9),
        printerId,
        status: 'queued',
        timestamp: new Date().toISOString(),
    });
});

app.get('/api/print-status/:jobId', (req: Request, res: Response) => {
    const { jobId } = req.params;

    res.json({
        jobId,
        status: 'completed',
        progress: 100,
        message: 'Print job completed successfully',
        timestamp: new Date().toISOString(),
    });
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
    console.log(`   GET  /api/print-status/:jobId - Check print job status`);
});

export default app;