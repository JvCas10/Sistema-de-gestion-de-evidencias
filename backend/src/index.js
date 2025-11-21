const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectWithRetry } = require('./config/database');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const authRoutes = require('./routes/authRoutes');
const expedienteRoutes = require('./routes/expedienteRoutes');
const indicioRoutes = require('./routes/indicioRoutes');
const reporteRoutes = require('./routes/reporteRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/expedientes', expedienteRoutes);
app.use('/api/indicios', indicioRoutes);
app.use('/api/reportes', reporteRoutes);

const PORT = process.env.PORT || 3000;

const startServer = async () => {
    try {
        console.log('🚀 Iniciando servidor...');
        await connectWithRetry();
        
        app.listen(PORT, () => {
            console.log(`Servidor corriendo en puerto ${PORT}`);
            console.log(`Health check: http://localhost:${PORT}/health`);
        });
    } catch (error) {
        console.error('Error al iniciar el servidor:', error);
        process.exit(1);
    }
};

startServer();