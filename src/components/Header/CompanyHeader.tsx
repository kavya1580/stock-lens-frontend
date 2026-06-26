import {
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import type { CompanyFundamentals, StockScore } from "../../types/stock";
import { currency, percent } from "../../utils/format";
import { CircularScore } from "../ScoreCard/CircularScore";

interface CompanyHeaderProps {
  fundamentals: CompanyFundamentals;
  score: StockScore;
  isDemo: boolean;
}

export function CompanyHeader({
  fundamentals,
  score,
  isDemo,
}: CompanyHeaderProps) {
  const positive = (fundamentals.dailyChangePercent ?? 0) >= 0;

  return (
    <Card sx={{ overflow: "hidden" }}>
      <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={8}>
            <Stack spacing={2}>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Chip label={fundamentals.symbol} color="primary" />
                <Chip label={fundamentals.sector} variant="outlined" />
                {isDemo ? (
                  <Chip
                    label="Demo data fallback"
                    color="warning"
                    variant="outlined"
                  />
                ) : null}
              </Stack>
              <Box>
                <Typography
                  variant="h3"
                  sx={{ fontSize: { xs: "2rem", md: "3rem" } }}
                >
                  {fundamentals.companyName}
                </Typography>
                <Typography color="text.secondary">
                  {fundamentals.industry}
                </Typography>
              </Box>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2.5}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Current Price
                  </Typography>
                  <Typography variant="h4">
                    {currency(fundamentals.currentPrice)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Daily Change
                  </Typography>
                  <Chip
                    icon={<TrendingUpIcon />}
                    label={percent(fundamentals.dailyChangePercent)}
                    color={positive ? "success" : "error"}
                    variant="outlined"
                    sx={{ mt: 0.5 }}
                  />
                </Box>
              </Stack>
            </Stack>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box
              sx={{
                display: "flex",
                justifyContent: { xs: "center", md: "flex-end" },
              }}
            >
              <CircularScore score={score.finalScore} rating={score.rating} />
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
