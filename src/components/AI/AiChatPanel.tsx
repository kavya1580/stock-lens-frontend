import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { sendAiChatMessage } from '../../services/stockApi';
import type { AiChatMessage } from '../../types/stock';
import { MarkdownText } from './MarkdownText';

interface AiChatPanelProps {
  symbol: string;
}

export function AiChatPanel({ symbol }: AiChatPanelProps) {
  const [messages, setMessages] = useState<AiChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([]);
    setInput('');
    setIsSending(false);
    setError(null);
  }, [symbol]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, isSending]);

  async function handleSend() {
    const trimmed = input.trim();
    if (!trimmed || isSending) {
      return;
    }

    const history = messages;
    const userMessage: AiChatMessage = { role: 'user', content: trimmed };
    setMessages([...history, userMessage]);
    setInput('');
    setIsSending(true);
    setError(null);

    try {
      const reply = await sendAiChatMessage(symbol, history, trimmed);
      setMessages((prev) => [...prev, { role: 'model', content: reply }]);
    } catch {
      setError('Could not reach the AI assistant. Please try again.');
    } finally {
      setIsSending(false);
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  }

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Stack spacing={1.5}>
        <Typography variant="h6">AI Chat</Typography>
        <Box
          ref={scrollRef}
          sx={{
            maxHeight: 360,
            minHeight: 120,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
          }}
        >
          {messages.length === 0 ? (
            <Typography color="text.secondary" variant="body2">
              Ask a follow-up question about this stock — the assistant already has its fundamentals and technicals.
            </Typography>
          ) : (
            messages.map((message, index) => (
              <Box
                key={index}
                sx={{
                  alignSelf: message.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                }}
              >
                <Paper
                  variant="outlined"
                  sx={{
                    px: 1.5,
                    py: 1,
                    bgcolor: message.role === 'user' ? 'primary.main' : 'background.default',
                    color: message.role === 'user' ? 'primary.contrastText' : 'text.primary',
                  }}
                >
                  {message.role === 'user' ? (
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                      {message.content}
                    </Typography>
                  ) : (
                    <MarkdownText>{message.content}</MarkdownText>
                  )}
                </Paper>
              </Box>
            ))
          )}
          {isSending ? (
            <Box sx={{ alignSelf: 'flex-start', maxWidth: '85%' }}>
              <Paper variant="outlined" sx={{ px: 1.5, py: 1, bgcolor: 'background.default' }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <CircularProgress size={14} />
                  <Typography variant="body2" color="text.secondary">
                    Thinking…
                  </Typography>
                </Stack>
              </Paper>
            </Box>
          ) : null}
        </Box>
        {error ? <Alert severity="error">{error}</Alert> : null}
        <Stack direction="row" spacing={1}>
          <TextField
            fullWidth
            multiline
            maxRows={4}
            size="small"
            placeholder="Ask about risks, growth, valuation..."
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isSending}
          />
          <Button
            variant="contained"
            endIcon={<SendIcon />}
            onClick={handleSend}
            disabled={isSending || !input.trim()}
          >
            Send
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
}
