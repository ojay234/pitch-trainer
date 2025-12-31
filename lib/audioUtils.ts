'use client';

export const usePitchDetection = () => {
  const createPitchDetector = (onNoteDetected: any, onError: any) => {
    let audioContext: AudioContext | null = null;
    let analyser: AnalyserNode | null = null;
    let microphone: MediaStreamAudioSourceNode | null = null;
    let mediaStream: MediaStream | null = null;
    let isDetecting = false;
    let animationId: number | null = null;

    const startDetection = async () => {
      if (isDetecting) return;

      try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        audioContext = new AudioContext();

        // Get microphone access
        mediaStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: false,
            autoGainControl: false, // Important for pitch accuracy
            noiseSuppression: false,
          },
        });

        microphone = audioContext.createMediaStreamSource(mediaStream);
        analyser = audioContext.createAnalyser();

        // --- FIX FOR LOW NOTES ---
        // Increase FFT size to capture longer wavelengths (bass notes)
        // 2048 is standard, but 8192 is needed for accurate notes below C3
        analyser.fftSize = 8192;

        analyser.minDecibels = -90;
        analyser.maxDecibels = -10;
        microphone.connect(analyser);

        isDetecting = true;
        detectPitch();
      } catch (err: any) {
        if (onError) onError(err.message);
      }
    };

    const detectPitch = () => {
      if (!isDetecting || !analyser || !audioContext) return;

      const bufferLength = analyser.fftSize;
      const buffer = new Float32Array(bufferLength);
      analyser.getFloatTimeDomainData(buffer);

      // Calculate pitch using auto-correlation
      const pitch = autoCorrelate(buffer, audioContext.sampleRate);

      // Filter out noise / silence / invalid ranges
      if (pitch > 50 && pitch < 1500) {
        const note = getNoteFromPitch(pitch);
        if (onNoteDetected) onNoteDetected(note, pitch);
      }

      animationId = requestAnimationFrame(detectPitch);
    };

    const stopDetection = () => {
      isDetecting = false;
      if (animationId) cancelAnimationFrame(animationId);
      if (microphone) microphone.disconnect();
      if (analyser) analyser.disconnect();
      if (mediaStream) mediaStream.getTracks().forEach(t => t.stop());
      if (audioContext && audioContext.state !== 'closed') audioContext.close();
    };

    return { startDetection, stopDetection };
  };

  return { createPitchDetector };
};

// --- HELPER FUNCTIONS ---

// Improved Auto-correlation algorithm
function autoCorrelate(buffer: Float32Array, sampleRate: number) {
  // 1. Check for silence (Root Mean Square)
  let sumOfSquares = 0;
  for (let i = 0; i < buffer.length; i++) {
    sumOfSquares += buffer[i] * buffer[i];
  }
  const rootMeanSquare = Math.sqrt(sumOfSquares / buffer.length);

  // If too quiet, return -1
  if (rootMeanSquare < 0.01) return -1;

  // 2. Trim the buffer to the actual signal start (improves accuracy)
  let r1 = 0;
  let r2 = buffer.length - 1;
  const threshold = 0.2;

  for (let i = 0; i < buffer.length / 2; i++) {
    if (Math.abs(buffer[i]) < threshold) {
      r1 = i;
      break;
    }
  }

  for (let i = 1; i < buffer.length / 2; i++) {
    if (Math.abs(buffer[buffer.length - i]) < threshold) {
      r2 = buffer.length - i;
      break;
    }
  }

  const buf = buffer.slice(r1, r2);
  const c = new Array(buf.length).fill(0);

  // 3. Perform correlation
  for (let i = 0; i < buf.length; i++) {
    for (let j = 0; j < buf.length - i; j++) {
      c[i] = c[i] + buf[j] * buf[j + i];
    }
  }

  // 4. Find the first peak
  let d = 0;
  while (c[d] > c[d + 1]) d++;

  let maxval = -1;
  let maxpos = -1;

  for (let i = d; i < buf.length; i++) {
    if (c[i] > maxval) {
      maxval = c[i];
      maxpos = i;
    }
  }

  let T0 = maxpos;

  // Parabolic interpolation for higher precision
  const x1 = c[T0 - 1];
  const x2 = c[T0];
  const x3 = c[T0 + 1];
  const a = (x1 + x3 - 2 * x2) / 2;
  const b = (x3 - x1) / 2;

  if (a) T0 = T0 - b / (2 * a);

  return sampleRate / T0;
}

function getNoteFromPitch(frequency: number) {
  const noteNum = 12 * (Math.log(frequency / 440) / Math.log(2));
  const roundedNoteNum = Math.round(noteNum) + 69;

  const notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

  return {
    name: notes[roundedNoteNum % 12],
    octave: Math.floor(roundedNoteNum / 12) - 1,
    frequency: frequency
  };
}

// Note frequencies for quiz
export const NOTES = [
  { name: 'C', frequency: 261.63, octave: 4 },
  { name: 'C#', frequency: 277.18, octave: 4 },
  { name: 'D', frequency: 293.66, octave: 4 },
  { name: 'D#', frequency: 311.13, octave: 4 },
  { name: 'E', frequency: 329.63, octave: 4 },
  { name: 'F', frequency: 349.23, octave: 4 },
  { name: 'F#', frequency: 369.99, octave: 4 },
  { name: 'G', frequency: 392.00, octave: 4 },
  { name: 'G#', frequency: 415.30, octave: 4 },
  { name: 'A', frequency: 440.00, octave: 4 },
  { name: 'A#', frequency: 466.16, octave: 4 },
  { name: 'B', frequency: 493.88, octave: 4 },
];


export const useAudioPlayer = () => {
  const playNote = (frequency: number, duration = 2000) => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContext();
      
      const now = audioContext.currentTime;
      
      // 1. Create Oscillator (Source)
      const oscillator = audioContext.createOscillator();
      // 'sawtooth' has rich harmonics, good for "brass/piano" simulation
      oscillator.type = 'sawtooth'; 
      oscillator.frequency.value = frequency;

      // 2. Create Filter (Tone control)
      const filter = audioContext.createBiquadFilter();
      filter.type = 'lowpass';
      filter.Q.value = 1; // Slight resonance

      // 3. Create Gain (Volume envelope)
      const gainNode = audioContext.createGain();

      // Connect: Oscillator -> Filter -> Gain -> Speakers
      oscillator.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // --- ENVELOPE SHAPING (The "Natural" Feel) ---

      // Volume Envelope (ADSR)
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.4, now + 0.02); // Fast Attack
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration / 1000); // Long Decay

      // Filter Envelope (Dynamic Timbre)
      // Opens the filter bright at the start, then closes it.
      // This mimics a physical object losing high-frequency energy.
      filter.frequency.setValueAtTime(100, now);
      filter.frequency.exponentialRampToValueAtTime(3000, now + 0.02); // "Wah" opening
      filter.frequency.exponentialRampToValueAtTime(100, now + duration / 1000); // Closing

      // Start and Stop
      oscillator.start(now);
      oscillator.stop(now + duration / 1000 + 0.1);

      // Cleanup
      setTimeout(() => {
        if(audioContext.state !== 'closed') audioContext.close();
      }, duration + 100);

    } catch (error) {
      console.error('Error playing note:', error);
    }
  };

  return { playNote };
};
