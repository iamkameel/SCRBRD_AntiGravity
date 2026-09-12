"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { 
  Mic, 
  MicOff, 
  Zap, 
  Volume2, 
  Sparkles, 
  Check, 
  AlertCircle, 
  HelpCircle,
  Radio,
  CornerDownLeft,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { D } from '@/lib/design-system';

interface VoiceScoringConsoleProps {
  onRecordBall: (ball: {
    runs: number;
    extras?: number;
    extrasType?: 'wide' | 'noball' | 'bye' | 'legbye';
    isWicket?: boolean;
    wicketType?: string;
    shotType?: string;
    zoneName?: string;
  }) => void;
  onUndo?: () => void;
  disabled?: boolean;
}

export function VoiceScoringConsole({
  onRecordBall,
  onUndo,
  disabled = false
}: VoiceScoringConsoleProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState<string>('');
  const [lastParsedCommand, setLastParsedCommand] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number>(0);
  const [browserSupported, setBrowserSupported] = useState(true);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check SpeechRecognition support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setBrowserSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      let currentTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        currentTranscript += result[0].transcript;
        if (result.isFinal) {
          parseVoiceCommand(result[0].transcript.toLowerCase(), result[0].confidence);
        }
      }
      setTranscript(currentTranscript);
    };

    recognition.onerror = (event: any) => {
      console.warn('Voice scoring speech error:', event.error);
      if (event.error !== 'no-speech') {
        setIsListening(false);
      }
    };

    recognition.onend = () => {
      if (isListening) {
        try {
          recognition.start();
        } catch (err) {
          setIsListening(false);
        }
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast.error('Voice recognition is not supported in this browser.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      toast.info('Voice scoring paused.');
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        setTranscript('Listening for scoring commands...');
        toast.success('Voice scoring active! Speak clearly e.g. "4 runs past point"');
      } catch (err) {
        console.error('Speech recognition error:', err);
      }
    }
  };

  const parseVoiceCommand = (text: string, conf: number = 0.9) => {
    setConfidence(Math.round(conf * 100));
    setLastParsedCommand(text);

    // Command Parsing Rules
    // 1. Undo
    if (text.includes('undo') || text.includes('cancel ball') || text.includes('take back')) {
      if (onUndo) {
        onUndo();
        toast.info('Voice Command: Undid last ball');
      }
      return;
    }

    // 2. Wicket
    if (text.includes('wicket') || text.includes('out') || text.includes('bowled') || text.includes('caught')) {
      let wicketType = 'Bowled';
      if (text.includes('caught')) wicketType = 'Caught';
      if (text.includes('lbw')) wicketType = 'LBW';
      if (text.includes('run out')) wicketType = 'Run Out';
      if (text.includes('stumped')) wicketType = 'Stumped';

      onRecordBall({ runs: 0, isWicket: true, wicketType });
      toast.error(`Voice Recorded: Wicket (${wicketType})`);
      return;
    }

    // 3. Wide
    if (text.includes('wide')) {
      let runs = 1;
      if (text.includes('two') || text.includes('2')) runs = 2;
      if (text.includes('four') || text.includes('4')) runs = 4;

      onRecordBall({ runs, extras: runs, extrasType: 'wide' });
      toast.warning(`Voice Recorded: Wide (${runs} runs)`);
      return;
    }

    // 4. No Ball
    if (text.includes('no ball') || text.includes('noball')) {
      let runs = 1;
      if (text.includes('four') || text.includes('4')) runs = 5;
      if (text.includes('six') || text.includes('6')) runs = 7;

      onRecordBall({ runs, extras: 1, extrasType: 'noball' });
      toast.warning(`Voice Recorded: No Ball (${runs} runs)`);
      return;
    }

    // 5. Regular Runs & Zones
    let runs = -1;
    if (text.includes('dot') || text.includes('zero') || text.includes('no run')) runs = 0;
    else if (text.includes('single') || text.includes('one run') || text.includes(' 1 ')) runs = 1;
    else if (text.includes('two') || text.includes('2')) runs = 2;
    else if (text.includes('three') || text.includes('3')) runs = 3;
    else if (text.includes('four') || text.includes('4') || text.includes('boundary')) runs = 4;
    else if (text.includes('six') || text.includes('6') || text.includes('maximum')) runs = 6;

    if (runs !== -1) {
      let shotType = undefined;
      if (text.includes('drive')) shotType = 'Drive';
      if (text.includes('pull')) shotType = 'Pull';
      if (text.includes('cut')) shotType = 'Cut';
      if (text.includes('flick')) shotType = 'Flick';
      if (text.includes('sweep')) shotType = 'Sweep';

      onRecordBall({ runs, shotType });
      toast.success(`Voice Recorded: ${runs} Runs ${shotType ? `(${shotType})` : ''}`);
    }
  };

  return (
    <Card className="p-6 rounded-3xl border border-white/10 bg-slate-950/80 backdrop-blur-xl shadow-2xl space-y-4">
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <Radio className={`w-5 h-5 ${isListening ? 'text-rose-500 animate-pulse' : 'text-zinc-500'}`} />
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Voice-Assisted Scoring Console
            </h3>
            <p className="text-[10px] text-zinc-400 font-mono">
              Hands-Free Natural Language Event Dispatcher
            </p>
          </div>
        </div>

        <Button
          onClick={toggleListening}
          disabled={disabled || !browserSupported}
          className={`px-4 py-2 text-xs font-black uppercase font-mono rounded-xl gap-2 transition-all shadow-lg ${
            isListening 
              ? 'bg-rose-500 hover:bg-rose-400 text-white shadow-rose-500/20' 
              : 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/20'
          }`}
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          {isListening ? 'Stop Listening' : 'Start Voice Input'}
        </Button>
      </div>

      {!browserSupported && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-2 text-xs text-rose-300">
          <AlertCircle className="w-4 h-4" /> Web Speech Recognition API is not supported on this browser. Try Chrome or Edge.
        </div>
      )}

      {/* Real-time Voice Feed */}
      <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2">
        <div className="flex justify-between items-center text-[10px] font-mono text-zinc-400">
          <span>LIVE AUDIO TRANSCRIPT</span>
          {confidence > 0 && <span className="text-emerald-400">Confidence: {confidence}%</span>}
        </div>
        <p className="text-xs font-mono text-white italic min-h-[24px]">
          {transcript || (isListening ? 'Say a command e.g. "Four runs to cover", "Wicket bowled", "Dot ball"...' : 'Voice input offline. Press "Start Voice Input" to activate.')}
        </p>
      </div>

      {/* Voice Quick Commands Cheat Sheet */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[10px] font-mono text-zinc-400">
        <div className="p-2 rounded-lg bg-white/5 border border-white/5">
          <span className="text-emerald-400 font-bold block">&quot;Four runs to cover&quot;</span>
          <span>Records 4 Runs + Drive</span>
        </div>
        <div className="p-2 rounded-lg bg-white/5 border border-white/5">
          <span className="text-purple-400 font-bold block">&quot;Six over mid wicket&quot;</span>
          <span>Records 6 Runs</span>
        </div>
        <div className="p-2 rounded-lg bg-white/5 border border-white/5">
          <span className="text-rose-400 font-bold block">&quot;Wicket caught behind&quot;</span>
          <span>Records Wicket (Caught)</span>
        </div>
        <div className="p-2 rounded-lg bg-white/5 border border-white/5">
          <span className="text-amber-400 font-bold block">&quot;Wide ball&quot;</span>
          <span>Records 1 Extra Wide</span>
        </div>
      </div>
    </Card>
  );
}
