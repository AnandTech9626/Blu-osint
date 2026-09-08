import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { initDB } from './lib/database.js';
import apiRoutes from './routes/api.js';
import caseRoutes from './routes/cases.js';
import graphRoutes from './routes/graph.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Rate limit exceeded. Please slow down.' }
});
app.use('/api/', limiter);

initDB();

app.get('/api/health', (_req, res) => {
  const apis = [
    { name: 'Shodan', configured: !!process.env.SHODAN_API_KEY },
    { name: 'VirusTotal', configured: !!process.env.VIRUS_TOTAL },
    { name: 'AlienVault', configured: !!process.env.ALIENVAULT_API },
    { name: 'EXA', configured: !!process.env.EXA_API },
    { name: 'NVD', configured: !!process.env.NVD_API_KEY },
  ];
  res.json({ status: 'operational', uptime: process.uptime(), apis });
});

app.use('/api', apiRoutes);
app.use('/api/cases', caseRoutes);
app.use('/api/graph', graphRoutes);

app.use((err, _req, res, _next) => {
  console.error('[ERROR]', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`\n  ╔═══════════════════════════════════════╗`);
  console.log(`  ║   BLU OSINT  •  Intelligence Server   ║`);
  console.log(`  ║   Port: ${PORT}                            ║`);
  console.log(`  ╚═══════════════════════════════════════╝\n`);
});
