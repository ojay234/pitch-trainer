'use client';

export const usePitchDetection = () => {
  const createPitchDetector = (onNoteDetected, onError) => {
    let audioContext = null;
    let analyser = null;
    let microphone = null;
    let javascriptNode = null;
    let mediaStream = null;
    let isDetecting = false;
    let animationId = null;

    const init = async () => {
      try {
        // Check for browser support
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error('getUserMedia is not supported in this browser');
        }

        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioContext = new AudioContext();

        // Get microphone access
        mediaStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false,
            sampleRate: 44100,
            channelCount: 1
          },
          video: false
        });

        // Create audio nodes
        microphone = audioContext.createMediaStreamSource(mediaStream);
        analyser = audioContext.createAnalyser();
        
        // Configure analyser for better pitch detection
        analyser.fftSize = 4096;
        analyser.smoothingTimeConstant = 0.2;
        analyser.minDecibels = -90;
        analyser.maxDecibels = -10;
        
        // Connect nodes
        microphone.connect(analyser);

        return true;
      } catch (error) {
        console.error('Error initializing pitch detector:', error);
        if (onError) onError(error.message);
        return false;
      }
    };

    const startDetection = async () => {
      if (isDetecting) return;

      const initialized = await init();
      if (!initialized) return false;

      isDetecting = true;
      detectPitch();
      return true;
    };

    const stopDetection = () => {
      isDetecting = false;
      
      if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
      }

      // Clean up audio resources
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
        mediaStream = null;
      }

      if (microphone) {
        microphone.disconnect();
        microphone = null;
      }

      if (analyser) {
        analyser.disconnect();
        analyser = null;
      }

      if (audioContext && audioContext.state !== 'closed') {
        audioContext.close();
        audioContext = null;
      }
    };

    const detectPitch = () => {
      if (!isDetecting || !analyser) return;

      try {
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Float32Array(bufferLength);
        analyser.getFloatTimeDomainData(dataArray);

        // Use multiple methods for better accuracy
        const pitch1 = autoCorrelate(dataArray, audioContext.sampleRate);
        const pitch2 = findFundamentalFrequency(dataArray, audioContext.sampleRate);
        
        // Use the more reliable detection
        let pitch = pitch1 > 0 ? pitch1 : pitch2;

        if (pitch > 50 && pitch < 2000) { // Reasonable frequency range for voice/instruments
          const note = frequencyToNote(pitch);
          if (note && onNoteDetected) {
            onNoteDetected(note, pitch);
          }
        } else {
          if (onNoteDetected) onNoteDetected(null, 0);
        }
      } catch (error) {
        console.error('Error in pitch detection:', error);
      }

      if (isDetecting) {
        animationId = requestAnimationFrame(detectPitch);
      }
    };

    // Improved autocorrelation with better peak detection
    const autoCorrelate = (buffer, sampleRate) => {
      const RMS = Math.sqrt(buffer.reduce((sum, x) => sum + x * x, 0) / buffer.length);
      if (RMS < 0.005) return -1; // Too quiet

      // Find the best correlation
      let bestOffset = -1;
      let bestCorrelation = -1;
      
      // Look for periodicity in a reasonable range (50Hz - 1000Hz)
      const minOffset = Math.floor(sampleRate / 1000); // 1000Hz
      const maxOffset = Math.floor(sampleRate / 50);   // 50Hz

      for (let offset = minOffset; offset <= maxOffset; offset++) {
        let correlation = 0;
        
        for (let i = 0; i < buffer.length - offset; i++) {
          correlation += buffer[i] * buffer[i + offset];
        }
        
        correlation /= (buffer.length - offset);
        
        if (correlation > bestCorrelation) {
          bestCorrelation = correlation;
          bestOffset = offset;
        }
      }

      if (bestCorrelation > 0.1 && bestOffset !== -1) {
        return sampleRate / bestOffset;
      }
      
      return -1;
    };

    // Alternative method: Find fundamental frequency using spectral analysis
    const findFundamentalFrequency = (buffer, sampleRate) => {
      const data = new Float32Array(buffer.length);
      for (let i = 0; i < buffer.length; i++) {
        data[i] = buffer[i];
      }

      // Simple spectral peak detection
      const fftSize = 4096;
      const fft = new FFT(fftSize, sampleRate);
      fft.forward(data);
      
      const spectrum = fft.spectrum;
      let maxMagnitude = 0;
      let fundamentalFreq = -1;
      
      // Look for peaks in human voice range (80Hz - 1200Hz)
      const minBin = Math.floor(80 * fftSize / sampleRate);
      const maxBin = Math.floor(1200 * fftSize / sampleRate);
      
      for (let bin = minBin; bin <= maxBin; bin++) {
        if (spectrum[bin] > maxMagnitude) {
          maxMagnitude = spectrum[bin];
          fundamentalFreq = bin * sampleRate / fftSize;
        }
      }
      
      return maxMagnitude > 0.01 ? fundamentalFreq : -1;
    };

    // Simple FFT implementation for spectral analysis
    class FFT {
      constructor(size, sampleRate) {
        this.size = size;
        this.sampleRate = sampleRate;
        this.real = new Float32Array(size);
        this.imag = new Float32Array(size);
        this.spectrum = new Float32Array(size / 2);
      }

      forward(input) {
        // Copy input to real part
        for (let i = 0; i < this.size; i++) {
          this.real[i] = input[i] || 0;
          this.imag[i] = 0;
        }

        // Apply window function (Hann window)
        for (let i = 0; i < this.size; i++) {
          const window = 0.5 * (1 - Math.cos(2 * Math.PI * i / (this.size - 1)));
          this.real[i] *= window;
        }

        // Radix-2 FFT
        this._fft(this.real, this.imag);

        // Calculate magnitude spectrum
        for (let i = 0; i < this.size / 2; i++) {
          this.spectrum[i] = Math.sqrt(
            this.real[i] * this.real[i] + this.imag[i] * this.imag[i]
          );
        }
      }

      _fft(real, imag) {
        const n = real.length;
        
        if (n === 1) return;

        // Bit-reversal permutation
        let j = 0;
        for (let i = 0; i < n; i++) {
          if (i < j) {
            [real[i], real[j]] = [real[j], real[i]];
            [imag[i], imag[j]] = [imag[j], imag[i]];
          }
          
          let k = n / 2;
          while (k <= j) {
            j -= k;
            k /= 2;
          }
          j += k;
        }

        // Cooley-Tukey FFT
        for (let len = 2; len <= n; len <<= 1) {
          const angle = (2 * Math.PI) / len;
          const wlenReal = Math.cos(angle);
          const wlenImag = Math.sin(angle);
          
          for (let i = 0; i < n; i += len) {
            let wReal = 1;
            let wImag = 0;
            
            for (let j = 0; j < len / 2; j++) {
              const uReal = real[i + j];
              const uImag = imag[i + j];
              const vReal = wReal * real[i + j + len / 2] - wImag * imag[i + j + len / 2];
              const vImag = wReal * imag[i + j + len / 2] + wImag * real[i + j + len / 2];
              
              real[i + j] = uReal + vReal;
              imag[i + j] = uImag + vImag;
              real[i + j + len / 2] = uReal - vReal;
              imag[i + j + len / 2] = uImag - vImag;
              
              const wRealNew = wReal * wlenReal - wImag * wlenImag;
              const wImagNew = wReal * wlenImag + wImag * wlenReal;
              wReal = wRealNew;
              wImag = wImagNew;
            }
          }
        }
      }
    }

    const frequencyToNote = (frequency) => {
      if (frequency < 50 || frequency > 2000) return null;

      const A4 = 440;
      const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
      
      const noteNumber = 12 * Math.log2(frequency / A4);
      const noteIndex = Math.round(noteNumber) + 69;
      const octave = Math.floor(noteIndex / 12) - 1;
      const noteName = noteNames[noteIndex % 12];
      
      const cents = Math.round((noteNumber - Math.round(noteNumber)) * 100);
      
      return {
        name: noteName,
        octave: octave,
        fullName: `${noteName}${octave}`,
        frequency: frequency,
        cents: cents,
        isSharp: noteName.includes('#')
      };
    };

    return {
      startDetection,
      stopDetection,
      isDetecting: () => isDetecting
    };
  };

  return { createPitchDetector };
};

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
  const playNote = (frequency, duration = 3000) => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Create oscillator with triangle wave for richer harmonics (more piano-like)
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      // Create a filter to simulate piano string resonance
      const filter = audioContext.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 2000;
      filter.Q.value = 2;
      
      // Connect nodes: oscillator -> filter -> gain -> output
      oscillator.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = 'triangle'; // Triangle wave for more natural sound
      
      const now = audioContext.currentTime;
      
      // More natural envelope with faster attack and longer decay
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.3, now + 0.02); // Quick attack
      gainNode.gain.exponentialRampToValueAtTime(0.1, now + 0.1); // Initial decay
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration / 1000); // Long tail
      
      // Add subtle filter envelope for more natural tone evolution
      filter.frequency.setValueAtTime(4000, now);
      filter.frequency.exponentialRampToValueAtTime(1000, now + duration / 1000);
      
      oscillator.start(now);
      oscillator.stop(now + duration / 1000);

      oscillator.onended = () => {
        try {
          oscillator.disconnect();
          filter.disconnect();
          gainNode.disconnect();
          audioContext.close();
        } catch (e) {
          // Ignore cleanup errors
        }
      };
    } catch (error) {
      console.error('Error playing note:', error);
    }
  };

  return { playNote };
};