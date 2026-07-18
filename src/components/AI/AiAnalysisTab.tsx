import { useEffect, useState } from 'react';
import { Alert, Box, Button, Card, CardContent, Chip, Grid, Stack, Typography } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import InsightsIcon from '@mui/icons-material/Insights';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import ShieldIcon from '@mui/icons-material/Shield';
import { getAiAnalysis } from '../../services/stockApi';
import type { AiAnalysis } from '../../types/stock';
import { AiChatPanel } from './AiChatPanel';
import { MarkdownText } from './MarkdownText';

interface AiAnalysisTabProps {
  symbol: string;
}

const CARD_DEFS: Array<{ key: keyof Omit<AiAnalysis, 'verdict'>; label: string; icon: typeof AutoAwesomeIcon }> = [
  { key: 'overallOpinion', label: 'Overall AI Opinion', icon: AutoAwesomeIcon },
  { key: 'businessQuality', label: 'Business Quality', icon: InsightsIcon },
  { key: 'risks', label: 'Risks', icon: ShieldIcon },
  { key: 'competitiveAdvantage', label: 'Competitive Advantage', icon: BusinessCenterIcon },
  { key: 'earningsSummary', label: 'Earnings Summary', icon: NewspaperIcon },
];

function verdictColor(verdict: string): 'success' | 'warning' | 'error' | 'default' {
  const normalized = verdict.toLowerCase();
  if (normalized.includes('bull')) return 'success';
  if (normalized.includes('bear')) return 'error';
  if (normalized.includes('caution')) return 'warning';
  return 'default';
}

export function AiAnalysisTab({ symbol }: AiAnalysisTabProps) {
  const [analysis, setAnalysis] = useState<AiAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setAnalysis(null);
    setIsLoading(false);
    setError(null);
  }, [symbol]);

  async function handleGenerate() {
    setIsLoading(true);
    setError(null);

    try {
      const result = await getAiAnalysis(symbol);
      setAnalysis(result);
    } catch {
      setError('Could not generate AI analysis. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Stack spacing={2.5}>
      <Stack spacing={0.5}>
        <Typography variant="h5">AI Analysis</Typography>
        <Typography color="text.secondary">
          Ask Gemini to read this stock's fundamentals and technicals and form its own opinion — independent of the
          app's own scoring.
        </Typography>
      </Stack>

      {!analysis ? (
        <Box>
          <Button variant="contained" size="large" onClick={handleGenerate} disabled={isLoading}>
            {isLoading ? 'Generating…' : 'Generate AI Analysis'}
          </Button>
        </Box>
      ) : (
        <Box>
          <Button variant="outlined" size="small" onClick={handleGenerate} disabled={isLoading}>
            {isLoading ? 'Regenerating…' : 'Regenerate'}
          </Button>
        </Box>
      )}

      {error ? <Alert severity="error">{error}</Alert> : null}

      {analysis ? (
        <>
          <Chip label={`Verdict: ${analysis.verdict}`} color={verdictColor(analysis.verdict)} sx={{ width: 'fit-content' }} />
          <Grid container spacing={2}>
            {CARD_DEFS.map(({ key, label, icon: Icon }) => (
              <Grid item xs={12} sm={6} md={4} key={key}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Stack spacing={1.5}>
                      <Icon color="primary" fontSize="large" />
                      <Typography variant="h6">{label}</Typography>
                      <Box color="text.secondary">
                        <MarkdownText>{analysis[key]}</MarkdownText>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      ) : null}

      <AiChatPanel symbol={symbol} />
    </Stack>
  );
}
