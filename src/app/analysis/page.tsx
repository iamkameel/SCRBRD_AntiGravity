"use client";

import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { processQuery, AnalysisResponse } from "@/lib/analysisEngine";
import { Send, Sparkles, BarChart2, Table as TableIcon, MessageSquare } from "lucide-react";

export default function AnalysisPage() {
  const [query, setQuery] = useState("");
  const [history, setHistory] = useState<{ query: string; response: AnalysisResponse }[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, isTyping]);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim()) return;

    const currentQuery = query;
    setQuery("");
    setIsTyping(true);

    // Call the async processQuery
    try {
      const response = await processQuery(currentQuery);
      setHistory(prev => [...prev, { query: currentQuery, response }]);
    } catch (error) {
      console.error("Analysis error:", error);
      setHistory(prev => [...prev, { 
        query: currentQuery, 
        response: { 
          type: 'text', 
          title: 'Error', 
          data: null, 
          message: 'Sorry, I encountered an error processing your request.' 
        } 
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSuggestion = (suggestion: string) => {
    setQuery(suggestion);
    // Optional: auto-submit
    // handleSearch(); 
  };

  const renderResponseContent = (response: AnalysisResponse) => {
    switch (response.type) {
      case 'table':
        return (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  {response.data.headers.map((h: string, i: number) => (
                    <th key={i} style={{ padding: '0.75rem', textAlign: 'left', color: 'var(--color-text-muted)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {response.data.rows.map((row: any[], i: number) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    {row.map((cell: any, j: number) => (
                      <td key={j} style={{ padding: '0.75rem' }}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      case 'text':
      default:
        return null;
    }
  };

  return (
    <div style={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Sparkles size={32} color="var(--color-primary)" />
          Analysis Hub
        </h1>
        <p className="text-secondary">Ask questions about your cricket data in plain English.</p>
      </div>

      <Card style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden', background: 'rgba(0,0,0,0.2)' }}>
        {/* Chat History */}
        <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {history.length === 0 && (
            <div style={{ textAlign: 'center', marginTop: '4rem', opacity: 0.5 }}>
              <Sparkles size={48} style={{ marginBottom: '1rem' }} />
              <h3>How can I help you today?</h3>
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginTop: '1rem', flexWrap: 'wrap' }}>
                {['Top run scorers', 'League standings', 'Show me all teams', 'Who has the most wickets?'].map(s => (
                  <button 
                    key={s}
                    onClick={() => handleSuggestion(s)}
                    style={{ 
                      background: 'rgba(255,255,255,0.05)', 
                      border: '1px solid rgba(255,255,255,0.1)', 
                      padding: '0.5rem 1rem', 
                      borderRadius: '20px', 
                      color: 'var(--color-text)',
                      cursor: 'pointer',
                      fontSize: '0.875rem'
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {history.map((item, idx) => (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* User Query */}
              <div style={{ alignSelf: 'flex-end', maxWidth: '80%' }}>
                <div style={{ 
                  background: 'var(--color-primary)', 
                  color: 'white', 
                  padding: '0.75rem 1.25rem', 
                  borderRadius: '12px 12px 0 12px',
                  fontSize: '1rem'
                }}>
                  {item.query}
                </div>
              </div>

              {/* AI Response */}
              <div style={{ alignSelf: 'flex-start', maxWidth: '90%', width: '100%' }}>
                <div style={{ 
                  background: 'var(--color-bg-card)', 
                  border: '1px solid rgba(255,255,255,0.1)',
                  padding: '1.5rem', 
                  borderRadius: '12px 12px 12px 0',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--color-primary)' }}>
                    <Sparkles size={16} />
                    <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>SCRBRD AI</span>
                  </div>
                  
                  {item.response.message && (
                    <p style={{ marginBottom: item.response.data ? '1rem' : 0, lineHeight: 1.6 }}>
                      {item.response.message}
                    </p>
                  )}

                  {item.response.data && (
                    <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '8px', overflow: 'hidden' }}>
                      <div style={{ padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', fontWeight: 600, fontSize: '0.9rem' }}>
                        {item.response.title}
                      </div>
                      {renderResponseContent(item.response)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div style={{ alignSelf: 'flex-start' }}>
              <div style={{ 
                background: 'var(--color-bg-card)', 
                padding: '1rem', 
                borderRadius: '12px 12px 12px 0',
                display: 'flex',
                gap: '0.25rem'
              }}>
                <div className="typing-dot" style={{ width: '8px', height: '8px', background: 'var(--color-text-muted)', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out both' }}></div>
                <div className="typing-dot" style={{ width: '8px', height: '8px', background: 'var(--color-text-muted)', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out both 0.16s' }}></div>
                <div className="typing-dot" style={{ width: '8px', height: '8px', background: 'var(--color-text-muted)', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out both 0.32s' }}></div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div style={{ padding: '1.5rem', background: 'var(--color-bg-card)', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <form onSubmit={handleSearch} style={{ position: 'relative' }}>
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask a question about stats, players, or teams..." 
              style={{ 
                width: '100%', 
                padding: '1rem 3rem 1rem 1.5rem', 
                borderRadius: '12px', 
                border: '1px solid rgba(255,255,255,0.1)', 
                background: 'rgba(0,0,0,0.2)',
                color: 'var(--color-text)',
                fontSize: '1rem'
              }}
            />
            <button 
              type="submit" 
              disabled={!query.trim() || isTyping}
              style={{ 
                position: 'absolute', 
                right: '0.75rem', 
                top: '50%', 
                transform: 'translateY(-50%)',
                background: 'var(--color-primary)',
                border: 'none',
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: query.trim() ? 'pointer' : 'default',
                opacity: query.trim() ? 1 : 0.5,
                color: 'white'
              }}
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </Card>

      <style jsx global>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
