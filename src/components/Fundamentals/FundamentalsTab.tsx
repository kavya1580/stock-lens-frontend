import {
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import type {
  CompanyFundamentals,
  Metric,
  StockScore,
} from "../../types/stock";
import { MetricCard } from "../Common/MetricCard";
import { Section } from "../Common/Section";
import { ChartCard } from "../Charts/ChartCard";
import { MetricLineChart } from "../Charts/MetricLineChart";
import { ShareholdingBar } from "../Charts/ShareholdingBar";
import { ShareholdingTrend } from "../Charts/ShareholdingTrend";
import { CircularScore } from "../ScoreCard/CircularScore";

interface FundamentalsTabProps {
  fundamentals: CompanyFundamentals;
  score: StockScore;
}

function MetricGrid({
  metrics,
  dense = false,
}: {
  metrics: Metric[];
  dense?: boolean;
}) {
  return (
    <Grid container spacing={2}>
      {metrics.map((metric) => (
        <Grid item xs={12} sm={6} md={dense ? 3 : 2.4} key={metric.label}>
          <MetricCard metric={metric} dense={dense} />
        </Grid>
      ))}
    </Grid>
  );
}

function GrowthBlock({ title, metrics }: { title: string; metrics: Metric[] }) {
  return (
    <Card variant="outlined" sx={{ height: "100%" }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>
          {title}
        </Typography>
        <Stack spacing={1.5}>
          {metrics.map((metric) => (
            <Box key={metric.label}>
              <Stack
                direction="row"
                justifyContent="space-between"
                sx={{ mb: 0.75 }}
              >
                <Typography variant="body2" color="text.secondary">
                  {metric.label}
                </Typography>
                <Typography variant="body2" fontWeight={800}>
                  {metric.value}
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={
                  Math.min(Number(String(metric.value).replace("%", "")), 25) *
                  4
                }
                sx={{ height: 8, borderRadius: 5 }}
              />
            </Box>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}

export function FundamentalsTab({ fundamentals, score }: FundamentalsTabProps) {
  // Build metrics from flat structure
  const valuationMetrics: Metric[] = [
    { label: "Stock P/E", value: fundamentals.stockPE },
    { label: "Industry P/E", value: fundamentals.industryPE },
    { label: "Relative P/E", value: fundamentals.relativePE },
    { label: "P/B Ratio", value: fundamentals.pbRatio },
    { label: "EV/EBITDA", value: fundamentals.evEbitda },
    { label: "Dividend Yield", value: fundamentals.dividendYield },
  ];

  const qualityMetrics: Metric[] = [
    { label: "ROCE", value: fundamentals.roce },
    { label: "ROE", value: fundamentals.roe },
    { label: "ROA", value: fundamentals.roa },
  ];

  const growthMetrics: Metric[] = [
    { label: "3Y Sales Growth", value: fundamentals.salesGrowth3Y },
    { label: "5Y Sales Growth", value: fundamentals.salesGrowth5Y },
    { label: "3Y Profit Growth", value: fundamentals.profitGrowth3Y },
    { label: "5Y Profit Growth", value: fundamentals.profitGrowth5Y },
  ];

  const profitabilityMetrics: Metric[] = [
    { label: "Operating Margin", value: fundamentals.operatingProfitMargin },
    { label: "Net Margin", value: fundamentals.netProfitMargin },
    { label: "EPS", value: fundamentals.eps },
  ];

  const financialHealthMetrics: Metric[] = [
    { label: "Debt-to-Equity", value: fundamentals.debtToEquity },
    { label: "Current Ratio", value: fundamentals.currentRatio },
    { label: "Interest Coverage", value: fundamentals.interestCoverage },
    { label: "Borrowings", value: fundamentals.borrowings },
    { label: "Reserves", value: fundamentals.reserves },
  ];

  const cashFlowMetrics: Metric[] = [
    { label: "Operating Cash Flow", value: fundamentals.operatingCashFlow },
    { label: "Free Cash Flow", value: fundamentals.freeCashFlow },
    { label: "Net Cash Flow", value: fundamentals.netCashFlow },
  ];

  const shareholdingData = fundamentals.shareholding || {
    current: {
      promoters: 0,
      fiis: 0,
      diis: 0,
      public: 0,
    },
    promoterHoldingQuarterly: [],
    fiiHoldingQuarterly: [],
    diiHoldingQuarterly: [],
    publicHoldingQuarterly: [],
  };

  const operatingCashFlowSeries = Object.entries(
    fundamentals.operatingCashFlowSeries || {},
  ).map(([period, value]) => ({
    period,
    value: typeof value === "string" ? parseFloat(value) || 0 : value,
  }));

  const freeCashFlowSeries = Object.entries(
    fundamentals.freeCashFlowSeries || {},
  ).map(([period, value]) => ({
    period,
    value: typeof value === "string" ? parseFloat(value) || 0 : value,
  }));

  const epsQuarterlySeries = Object.entries(
    fundamentals.epsQuarterly || {},
  ).map(([period, value]) => ({
    period,
    value: typeof value === "string" ? parseFloat(value) || 0 : value,
  }));

  const opmQuarterlySeries = Object.entries(
    fundamentals.opmQuarterly || {},
  ).map(([period, value]) => ({
    period,
    value: typeof value === "string" ? parseFloat(value) || 0 : value,
  }));

  return (
    <Stack spacing={3}>
      <Section
        title="Valuation Metrics"
        subtitle="Price multiples and valuation ratios."
      >
        <MetricGrid
          metrics={Array.isArray(valuationMetrics) ? valuationMetrics : []}
        />
      </Section>

      <Section
        title="Quality & Returns"
        subtitle="Return metrics and profitability ratios."
      >
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <GrowthBlock title="Quality Metrics" metrics={qualityMetrics} />
          </Grid>
          <Grid item xs={12} md={8}>
            <GrowthBlock title="Profitability" metrics={profitabilityMetrics} />
          </Grid>
        </Grid>
      </Section>

      <Section
        title="Growth"
        subtitle="Sales, profit growth across different time windows."
      >
        <GrowthBlock title="Growth Metrics" metrics={growthMetrics} />
      </Section>

      <Section
        title="Financial Health"
        subtitle="Debt management and liquidity ratios."
      >
        <MetricGrid metrics={financialHealthMetrics} dense />
      </Section>

      <Section
        title="Cash Flow"
        subtitle="Operating cash flow, free cash flow, and quarterly trends."
      >
        <MetricGrid metrics={cashFlowMetrics} dense />
        <Grid container spacing={2} sx={{ mt: 0 }}>
          {operatingCashFlowSeries.length > 0 && (
            <Grid item xs={12} md={4}>
              <ChartCard title="Operating Cash Flow">
                <MetricLineChart
                  data={operatingCashFlowSeries}
                  color="#2563eb"
                />
              </ChartCard>
            </Grid>
          )}
          {freeCashFlowSeries.length > 0 && (
            <Grid item xs={12} md={4}>
              <ChartCard title="Free Cash Flow">
                <MetricLineChart data={freeCashFlowSeries} color="#16a34a" />
              </ChartCard>
            </Grid>
          )}
          {epsQuarterlySeries.length > 0 && (
            <Grid item xs={12} md={4}>
              <ChartCard title="EPS Quarterly">
                <MetricLineChart data={epsQuarterlySeries} color="#d97706" />
              </ChartCard>
            </Grid>
          )}
        </Grid>
      </Section>

      <Section
        title="Shareholding"
        subtitle="Current ownership mix and quarterly institutional trends."
      >
        <Grid container spacing={2}>
          <Grid item xs={12} md={5}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Current Shareholding
                </Typography>
                <ShareholdingBar data={shareholdingData.current} />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={7}>
            <ChartCard title="Quarterly Holding Trend">
              <ShareholdingTrend shareholding={shareholdingData} />
            </ChartCard>
          </Grid>
        </Grid>
      </Section>

      {(fundamentals.pros?.length || fundamentals.cons?.length) && (
        <Section title="Pros & Cons">
          <Grid container spacing={2}>
            {fundamentals.pros && fundamentals.pros.length > 0 && (
              <Grid item xs={12} md={6}>
                <Card
                  variant="outlined"
                  sx={{ height: "100%", borderColor: "success.light" }}
                >
                  <CardContent>
                    <Stack spacing={1.25}>
                      <Typography variant="h6">Pros</Typography>
                      {fundamentals.pros &&
                        Array.isArray(fundamentals.pros) &&
                        fundamentals.pros.map((item, idx) => {
                          const label =
                            typeof item === "string"
                              ? item
                              : (item as any)?.title || String(item);
                          return (
                            <Chip
                              key={idx}
                              icon={<CheckCircleIcon />}
                              label={label}
                              color="success"
                              variant="outlined"
                              sx={{ justifyContent: "flex-start" }}
                            />
                          );
                        })}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            )}
            {fundamentals.cons && fundamentals.cons.length > 0 && (
              <Grid item xs={12} md={6}>
                <Card
                  variant="outlined"
                  sx={{ height: "100%", borderColor: "warning.light" }}
                >
                  <CardContent>
                    <Stack spacing={1.25}>
                      <Typography variant="h6">Cons</Typography>
                      {fundamentals.cons &&
                        Array.isArray(fundamentals.cons) &&
                        fundamentals.cons.map((item, idx) => {
                          const label =
                            typeof item === "string"
                              ? item
                              : (item as any)?.detail ||
                                (item as any)?.title ||
                                String(item);
                          return (
                            <Chip
                              key={idx}
                              icon={<ReportProblemIcon />}
                              label={label}
                              color="warning"
                              variant="outlined"
                              sx={{ justifyContent: "flex-start" }}
                            />
                          );
                        })}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            )}
          </Grid>
        </Section>
      )}

      <Section
        title="Score Insights"
        subtitle="Final score, weighted category scores, green flags, and red flags."
      >
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Card variant="outlined" sx={{ height: "100%" }}>
              <CardContent>
                <CircularScore
                  score={score.finalScore}
                  rating={score.rating}
                  size={180}
                />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={8}>
            <Grid container spacing={2}>
              {score.scoreBreakdown.map((item) => (
                <Grid item xs={12} sm={6} key={item.category}>
                  <Card variant="outlined" sx={{ height: "100%" }}>
                    <CardContent>
                      <Stack spacing={1}>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="subtitle1">
                            {item.category}
                          </Typography>
                          <Typography fontWeight={900}>
                            {item.score}/100
                          </Typography>
                        </Stack>
                        <LinearProgress
                          variant="determinate"
                          value={item.score}
                          sx={{ height: 8, borderRadius: 5 }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          Weight {item.weight}%
                        </Typography>
                        <Typography variant="body2">
                          {item.explanation}
                        </Typography>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
        <Grid container spacing={2} sx={{ mt: 0 }}>
          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ height: "100%" }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 1.5 }}>
                  Green Flags
                </Typography>
                <Stack spacing={1}>
                  {Array.isArray(score?.greenFlags) &&
                    score.greenFlags.map((flag, idx) => {
                      const label =
                        typeof flag === "string"
                          ? flag
                          : (flag as any)?.title || String(flag);
                      return (
                        <Chip
                          key={idx}
                          color="success"
                          variant="outlined"
                          icon={<CheckCircleIcon />}
                          label={label}
                          sx={{ justifyContent: "flex-start" }}
                        />
                      );
                    })}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ height: "100%" }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 1.5 }}>
                  Red Flags
                </Typography>
                <Stack spacing={1}>
                  {Array.isArray(score?.redFlags) && score.redFlags.length ? (
                    score.redFlags.map((flag, idx) => {
                      const label =
                        typeof flag === "string"
                          ? flag
                          : (flag as any)?.title ||
                            (flag as any)?.detail ||
                            String(flag);
                      return (
                        <Chip
                          key={idx}
                          color="error"
                          variant="outlined"
                          icon={<ReportProblemIcon />}
                          label={label}
                          sx={{ justifyContent: "flex-start" }}
                        />
                      );
                    })
                  ) : (
                    <Typography color="text.secondary">
                      No major red flags detected.
                    </Typography>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        <Box sx={{ mt: 2 }}>
          <MetricGrid metrics={score.derivedMetrics} dense />
        </Box>
      </Section>
    </Stack>
  );
}
