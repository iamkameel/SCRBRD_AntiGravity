"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Radio, 
  AlertCircle, 
  Keyboard,
  Globe
} from 'lucide-react';
import { toast } from 'sonner';

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
  const [audioFeedback, setAudioFeedback] = useState(true);

  const recognitionRef = useRef<any>(null);

  // Play audio beep tone via Web Audio API for acoustic confirmation
  const playAcousticConfirmation = useCallback((frequency: number = 880, duration: number = 0.15) => {
    if (!audioFeedback || typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      // AudioContext muted/unsupported
    }
  }, [audioFeedback]);

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

    // Keyboard Hotkey listener for hands-free gestures (Space bar toggles audio mic)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && e.ctrlKey) {
        e.preventDefault();
        toggleListening();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isListening]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast.error('Voice recognition is not supported in this browser.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      playAcousticConfirmation(440, 0.1);
      toast.info('Voice scoring paused.');
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        setTranscript('Listening for scoring commands...');
        playAcousticConfirmation(880, 0.15);
        toast.success('Voice scoring active! Speak clearly e.g. "4 runs past point"');
      } catch (err) {
        console.error('Speech recognition error:', err);
      }
    }
  };

  const parseVoiceCommand = (text: string, conf: number = 0.9) => {
    setConfidence(Math.round(conf * 100));
    setLastParsedCommand(text);

    // Shot Zone Extraction Helper
    let zoneName: string | undefined = undefined;
    if (text.includes('point')) zoneName = 'Point';
    else if (text.includes('cover')) zoneName = 'Cover';
    else if (text.includes('midwicket') || text.includes('mid-wicket') || text.includes('mid wicket')) zoneName = 'Mid Wicket';
    else if (text.includes('long on') || text.includes('long-on')) zoneName = 'Long On';
    else if (text.includes('long off') || text.includes('long-off')) zoneName = 'Long Off';
    else if (text.includes('third man') || text.includes('thirdman')) zoneName = 'Third Man';
    else if (text.includes('fine leg') || text.includes('fine-leg')) zoneName = 'Fine Leg';
    else if (text.includes('square leg') || text.includes('square-leg')) zoneName = 'Square Leg';
    else if (text.includes('gully')) zoneName = 'Gully';
    else if (text.includes('mid off') || text.includes('midoff')) zoneName = 'Mid Off';

    // Shot Type Extraction Helper
    let shotType: string | undefined = undefined;
    if (text.includes('drive')) shotType = 'Drive';
    else if (text.includes('pull')) shotType = 'Pull';
    else if (text.includes('cut')) shotType = 'Cut';
    else if (text.includes('flick')) shotType = 'Flick';
    else if (text.includes('sweep')) shotType = 'Sweep';
    else if (text.includes('hook')) shotType = 'Hook';
    else if (text.includes('glance')) shotType = 'Glance';

    // 1. Undo Command
    if (text.includes('undo') || text.includes('cancel ball') || text.includes('take back') || text.includes('kanselleer')) {
      if (onUndo) {
        onUndo();
        playAcousticConfirmation(523, 0.2);
        toast.info('Voice Command: Undid last ball');
      }
      return;
    }

    // 2. Byes & Leg Byes
    if (text.includes('leg bye') || text.includes('legbye') || text.includes('benewydte')) {
      let runs = 1;
      if (text.includes('two') || text.includes('2')) runs = 2;
      if (text.includes('three') || text.includes('3')) runs = 3;
      if (text.includes('four') || text.includes('4')) runs = 4;

      onRecordBall({ runs, extras: runs, extrasType: 'legbye', zoneName });
      playAcousticConfirmation(620, 0.15);
      toast.warning(`Voice Recorded: ${runs} Leg Bye(s) ${zoneName ? `to ${zoneName}` : ''}`);
      return;
    }

    if (text.includes('bye') && !text.includes('goodbye')) {
      let runs = 1;
      if (text.includes('two') || text.includes('2')) runs = 2;
      if (text.includes('three') || text.includes('3')) runs = 3;
      if (text.includes('four') || text.includes('4')) runs = 4;

      onRecordBall({ runs, extras: runs, extrasType: 'bye', zoneName });
      playAcousticConfirmation(610, 0.15);
      toast.warning(`Voice Recorded: ${runs} Bye(s) ${zoneName ? `to ${zoneName}` : ''}`);
      return;
    }

    // 3. Wide (with optional Run Out)
    if (text.includes('wide') || text.includes('wyd')) {
      let runs = 1;
      if (text.includes('two') || text.includes('2')) runs = 2;
      if (text.includes('three') || text.includes('3')) runs = 3;
      if (text.includes('four') || text.includes('4')) runs = 4;

      const isWicket = text.includes('run out') || text.includes('wicket');
      const wicketType = isWicket ? 'Run Out' : undefined;

      onRecordBall({ runs, extras: runs, extrasType: 'wide', isWicket, wicketType, zoneName });
      playAcousticConfirmation(600, 0.15);
      toast.warning(`Voice Recorded: Wide (${runs} runs)${isWicket ? ' + Wicket' : ''}`);
      return;
    }

    // 4. No Ball (with optional Run Out / Off Bat Runs)
    if (text.includes('no ball') || text.includes('noball')) {
      let runs = 1;
      if (text.includes('four') || text.includes('4')) runs = 5;
      if (text.includes('six') || text.includes('6')) runs = 7;

      const isWicket = text.includes('run out');
      const wicketType = isWicket ? 'Run Out' : undefined;

      onRecordBall({ runs, extras: 1, extrasType: 'noball', isWicket, wicketType, shotType, zoneName });
      playAcousticConfirmation(650, 0.15);
      toast.warning(`Voice Recorded: No Ball (${runs} runs)${isWicket ? ' + Wicket' : ''}`);
      return;
    }

    // 5. Standalone Wicket / Paaltjie
    if (text.includes('wicket') || text.includes('out') || text.includes('bowled') || text.includes('caught') || text.includes('paaltjie')) {
      let wicketType = 'Bowled';
      if (text.includes('caught') || text.includes('gevang')) wicketType = 'Caught';
      if (text.includes('lbw')) wicketType = 'LBW';
      if (text.includes('run out')) wicketType = 'Run Out';
      if (text.includes('stumped')) wicketType = 'Stumped';

      onRecordBall({ runs: 0, isWicket: true, wicketType, zoneName });
      playAcousticConfirmation(300, 0.3);
      toast.error(`Voice Recorded: Wicket (${wicketType})${zoneName ? ` at ${zoneName}` : ''}`);
      return;
    }

    // 6. Regular Runs & Shot Placement (including Afrikaans "vier", "ses", "nul")
    let runs = -1;
    if (text.includes('dot') || text.includes('zero') || text.includes('no run') || text.includes('nul')) runs = 0;
    else if (text.includes('single') || text.includes('one run') || text.includes(' 1 ') || text.includes('een')) runs = 1;
    else if (text.includes('two') || text.includes('2') || text.includes('twee')) runs = 2;
    else if (text.includes('three') || text.includes('3') || text.includes('drie')) runs = 3;
    else if (text.includes('four') || text.includes('4') || text.includes('boundary') || text.includes('vier')) runs = 4;
    else if (text.includes('six') || text.includes('6') || text.includes('maximum') || text.includes('ses')) runs = 6;

    if (runs !== -1) {
      onRecordBall({ runs, shotType, zoneName });
      playAcousticConfirmation(880, 0.15);
      toast.success(`Voice Recorded: ${runs} Runs ${shotType ? `(${shotType})` : ''} ${zoneName ? `to ${zoneName}` : ''}`);
    }
  };

  return (
    <Card className="p-6 rounded-3xl border border-white/10 bg-slate-950/80 backdrop-blur-xl shadow-2xl space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <Radio className={`w-5 h-5 ${isListening ? 'text-rose-500 animate-pulse' : 'text-zinc-500'}`} />
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Voice-Assisted Scoring Console
            </h3>
            <p className="text-[10px] text-zinc-400 font-mono flex items-center gap-2">
              <span>Hands-Free Event Dispatcher</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <Globe className="w-3 h-3" /> EN/AF Multilingual
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setAudioFeedback(!audioFeedback)}
            className="text-zinc-400 hover:text-white p-2 rounded-xl"
            title="Toggle Acoustic Tone Feedback"
          >
            {audioFeedback ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-zinc-500" />}
          </Button>

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
      </div>

      {!browserSupported && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-2 text-xs text-rose-300">
          <AlertCircle className="w-4 h-4" /> Web Speech Recognition API is not supported on this browser. Try Chrome or Edge.
        </div>
      )}

      {/* Real-time Voice Feed */}
      <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2">
        <div className="flex justify-between items-center text-[10px] font-mono text-zinc-400">
          <span className="flex items-center gap-1.5">
            <Keyboard className="w-3.5 h-3.5 text-emerald-400" /> CTRL+SPACE TO TOGGLE MIC
          </span>
          {confidence > 0 && <span className="text-emerald-400">Confidence: {confidence}%</span>}
        </div>
        <p className="text-xs font-mono text-white italic min-h-[24px]">
          {transcript || (isListening ? 'Say a command e.g. "Four runs to cover", "Paaltjie bowled", "Dot ball"...' : 'Voice input offline. Press "Start Voice Input" to activate.')}
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
          <span className="text-rose-400 font-bold block">&quot;Wicket caught / Paaltjie gevang&quot;</span>
          <span>Records Wicket (Caught)</span>
        </div>
        <div className="p-2 rounded-lg bg-white/5 border border-white/5">
          <span className="text-amber-400 font-bold block">&quot;Wide ball / Wyd&quot;</span>
          <span>Records 1 Extra Wide</span>
        </div>
      </div>
    </Card>
  );
}
