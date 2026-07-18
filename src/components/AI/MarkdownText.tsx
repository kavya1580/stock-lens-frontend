import { Box, Link, Typography } from '@mui/material';
import ReactMarkdown from 'react-markdown';

interface MarkdownTextProps {
  children: string;
  variant?: 'body1' | 'body2';
}

/** Renders Gemini's markdown-formatted text (bold, lists, etc.) with MUI-styled elements. */
export function MarkdownText({ children, variant = 'body2' }: MarkdownTextProps) {
  return (
    <Box
      sx={{
        '& p': { m: 0, mb: 1, '&:last-child': { mb: 0 } },
        '& ul, & ol': { mt: 0, mb: 1, pl: 3, '&:last-child': { mb: 0 } },
        '& li': { mb: 0.5 },
      }}
    >
      <ReactMarkdown
        components={{
          p: ({ children: c }) => (
            <Typography variant={variant} component="p" color="inherit">
              {c}
            </Typography>
          ),
          li: ({ children: c }) => (
            <Typography variant={variant} component="li" color="inherit">
              {c}
            </Typography>
          ),
          a: ({ children: c, href }) => (
            <Link href={href} target="_blank" rel="noopener noreferrer">
              {c}
            </Link>
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </Box>
  );
}
