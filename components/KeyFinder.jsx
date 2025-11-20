// 'use client';
// import { useState, useEffect, useRef, useCallback } from 'react';
// import { usePitchDetection, NOTES } from '../lib/audioUtils';

// export default function KeyFinder() {
//   const [currentNote, setCurrentNote] = useState(null);
//   const [isRecording, setIsRecording] = useState(false);
//   const [error, setError] = useState(null);
//   const [isInitializing, setIsInitializing] = useState(false);
//   const [volumeLevel, setVolumeLevel] = useState(0);
//   const [detectedNotes, setDetectedNotes] = useState([]);
//   const [detectedKey, setDetectedKey] = useState(null);
//   const [confidence, setConfidence] = useState(0);
//   const [isAnalyzing, setIsAnalyzing] = useState(false);
//   const [qualityNotes, setQualityNotes] = useState(0);
  
//   const pitchDetectorRef = useRef(null);
//   const { createPitchDetector } = usePitchDetection();

//   // Volume threshold - only analyze notes above this level
//   const VOLUME_THRESHOLD = 20; // 20% minimum volume
//   const MIN_QUALITY_NOTES = 12; // Need at least 12 good quality notes

//   // Comprehensive music theory database
//   const MAJOR_SCALES = {
//     'C': ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
//     'G': ['G', 'A', 'B', 'C', 'D', 'E', 'F#'],
//     'D': ['D', 'E', 'F#', 'G', 'A', 'B', 'C#'],
//     'A': ['A', 'B', 'C#', 'D', 'E', 'F#', 'G#'],
//     'E': ['E', 'F#', 'G#', 'A', 'B', 'C#', 'D#'],
//     'B': ['B', 'C#', 'D#', 'E', 'F#', 'G#', 'A#'],
//     'F#': ['F#', 'G#', 'A#', 'B', 'C#', 'D#', 'F'],
//     'C#': ['C#', 'D#', 'F', 'F#', 'G#', 'A#', 'C'],
//     'F': ['F', 'G', 'A', 'A#', 'C', 'D', 'E'],
//     'Bb': ['A#', 'C', 'D', 'D#', 'F', 'G', 'A'],
//     'Eb': ['D#', 'F', 'G', 'G#', 'A#', 'C', 'D'],
//     'Ab': ['G#', 'A#', 'C', 'C#', 'D#', 'F', 'G']
//   };

//   const MINOR_SCALES = {
//     'Am': ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
//     'Em': ['E', 'F#', 'G', 'A', 'B', 'C', 'D'],
//     'Bm': ['B', 'C#', 'D', 'E', 'F#', 'G', 'A'],
//     'F#m': ['F#', 'G#', 'A', 'B', 'C#', 'D', 'E'],
//     'C#m': ['C#', 'D#', 'E', 'F#', 'G#', 'A', 'B'],
//     'G#m': ['G#', 'A#', 'B', 'C#', 'D#', 'E', 'F#'],
//     'D#m': ['D#', 'F', 'F#', 'G#', 'A#', 'B', 'C#'],
//     'A#m': ['A#', 'C', 'C#', 'D#', 'F', 'F#', 'G#'],
//     'Dm': ['D', 'E', 'F', 'G', 'A', 'A#', 'C'],
//     'Gm': ['G', 'A', 'A#', 'C', 'D', 'D#', 'F'],
//     'Cm': ['C', 'D', 'D#', 'F', 'G', 'G#', 'A#'],
//     'Fm': ['F', 'G', 'G#', 'A#', 'C', 'C#', 'D#']
//   };

//   const ALL_KEYS = [
//     ...Object.entries(MAJOR_SCALES).map(([name, notes]) => ({ 
//       name, 
//       type: 'major', 
//       notes,
//       relativeMinor: getRelativeMinor(name)
//     })),
//     ...Object.entries(MINOR_SCALES).map(([name, notes]) => ({ 
//       name, 
//       type: 'minor', 
//       notes,
//       relativeMajor: getRelativeMajor(name)
//     }))
//   ];

//   function getRelativeMinor(majorKey) {
//     const relatives = {
//       'C': 'Am', 'G': 'Em', 'D': 'Bm', 'A': 'F#m', 
//       'E': 'C#m', 'B': 'G#m', 'F#': 'D#m', 'C#': 'A#m',
//       'F': 'Dm', 'Bb': 'Gm', 'Eb': 'Cm', 'Ab': 'Fm'
//     };
//     return relatives[majorKey];
//   }

//   function getRelativeMajor(minorKey) {
//     const relatives = {
//       'Am': 'C', 'Em': 'G', 'Bm': 'D', 'F#m': 'A',
//       'C#m': 'E', 'G#m': 'B', 'D#m': 'F#', 'A#m': 'C#',
//       'Dm': 'F', 'Gm': 'Bb', 'Cm': 'Eb', 'Fm': 'Ab'
//     };
//     return relatives[minorKey];
//   }

//   const handleNoteDetected = useCallback((note, frequency) => {
//     if (note) {
//       setCurrentNote(note);
      
//       // Calculate volume level for visualization
//       const level = Math.min(100, Math.max(0, (frequency - 50) / 10));
//       setVolumeLevel(level);

//       // Only add note if volume is above threshold (good quality singing)
//       if (level >= VOLUME_THRESHOLD) {
//         setDetectedNotes(prev => {
//           const newNote = {
//             name: note.name,
//             frequency: note.frequency,
//             timestamp: Date.now(),
//             volume: level
//           };
          
//           // Only add if it's different from the last note (avoid duplicates)
//           const lastNote = prev[prev.length - 1];
//           if (!lastNote || lastNote.name !== newNote.name) {
//             const newNotes = [...prev, newNote];
//             // Update quality notes count
//             setQualityNotes(newNotes.length);
//             // Keep reasonable history
//             return newNotes.slice(-100);
//           }
//           return prev;
//         });
//       } else {
//         // Note detected but too quiet - don't add to analysis
//         console.log(`Note ${note.name} detected but volume (${level.toFixed(0)}%) below threshold`);
//       }
//     } else {
//       setCurrentNote(null);
//       setVolumeLevel(0);
//     }
//   }, []);

//   const handleError = useCallback((errorMessage) => {
//     setError(errorMessage);
//     setIsInitializing(false);
//     setIsRecording(false);
//   }, []);

//   // Advanced key analysis based on musical content
//   const analyzeMusicalKey = useCallback((notes) => {
//     if (notes.length < MIN_QUALITY_NOTES) {
//       console.log(`Need ${MIN_QUALITY_NOTES} quality notes, have ${notes.length}`);
//       return null;
//     }

//     console.log(`🎵 Analyzing ${notes.length} quality notes for key detection...`);

//     // Count note occurrences
//     const noteCounts = {};
//     notes.forEach(note => {
//       noteCounts[note.name] = (noteCounts[note.name] || 0) + 1;
//     });

//     // Get unique notes sorted by frequency
//     const uniqueNotes = Object.entries(noteCounts)
//       .sort(([,a], [,b]) => b - a)
//       .map(([note]) => note);

//     console.log('📊 Note distribution:', noteCounts);
//     console.log('🎶 Most common notes:', uniqueNotes.slice(0, 7));

//     let bestKey = null;
//     let bestScore = 0;

//     // Test each possible key
//     ALL_KEYS.forEach(key => {
//       const keyNotes = key.notes;
//       let score = 0;

//       const tonic = keyNotes[0];
//       const dominant = keyNotes[4]; // Fifth scale degree
//       const subdominant = keyNotes[3]; // Fourth scale degree
//       const leadingTone = keyNotes[6]; // Seventh scale degree

//       // 1. Scale note matching (40 points max)
//       let scaleNoteMatches = 0;
//       uniqueNotes.forEach(note => {
//         if (keyNotes.includes(note)) {
//           scaleNoteMatches++;
//           // Weight by frequency in the song
//           score += (noteCounts[note] / notes.length) * 10;
//         }
//       });

//       // 2. Tonic emphasis (25 points)
//       if (noteCounts[tonic]) {
//         const tonicStrength = (noteCounts[tonic] / notes.length) * 25;
//         score += tonicStrength;
//       }

//       // 3. Dominant emphasis (15 points)
//       if (noteCounts[dominant]) {
//         const dominantStrength = (noteCounts[dominant] / notes.length) * 15;
//         score += dominantStrength;
//       }

//       // 4. Leading tone emphasis (10 points for major keys)
//       if (key.type === 'major' && noteCounts[leadingTone]) {
//         const leadingStrength = (noteCounts[leadingTone] / notes.length) * 10;
//         score += leadingStrength;
//       }

//       // 5. Scale completeness bonus (10 points)
//       const scaleNotesPresent = new Set(uniqueNotes.filter(note => keyNotes.includes(note)));
//       const completeness = (scaleNotesPresent.size / 7) * 10;
//       score += completeness;

//       // 6. Cadence detection (5 points)
//       // Look for V-I or IV-I progressions in the last few notes
//       const recentNotes = notes.slice(-8).map(n => n.name);
//       if ((recentNotes.includes(dominant) && recentNotes.includes(tonic)) ||
//           (recentNotes.includes(subdominant) && recentNotes.includes(tonic))) {
//         score += 5;
//       }

//       // 7. Penalty for out-of-scale notes
//       const outOfScaleNotes = uniqueNotes.filter(note => !keyNotes.includes(note)).length;
//       score -= outOfScaleNotes * 3;

//       console.log(`🔑 Key ${key.name}: ${score.toFixed(1)} points`);

//       if (score > bestScore) {
//         bestScore = score;
//         bestKey = key;
//       }
//     });

//     // Calculate confidence
//     let confidencePercent = 0;
//     if (bestScore > 0) {
//       // Base confidence on score quality
//       confidencePercent = Math.min(95, Math.round((bestScore / 80) * 100));
      
//       // Boost confidence with more quality data
//       if (notes.length > 20) confidencePercent = Math.min(100, confidencePercent + 8);
//       if (notes.length > 30) confidencePercent = Math.min(100, confidencePercent + 7);
//       if (notes.length > 40) confidencePercent = Math.min(100, confidencePercent + 5);
//     }

//     console.log(`🎯 Detected key: ${bestKey?.name} (${confidencePercent}% confidence)`);

//     return {
//       key: bestKey,
//       confidence: confidencePercent
//     };
//   }, []);

//   // Analyze when we have sufficient quality musical data
//   useEffect(() => {
//     if (isRecording && qualityNotes >= MIN_QUALITY_NOTES && !isAnalyzing) {
//       setIsAnalyzing(true);
      
//       // Use setTimeout to avoid blocking the UI
//       setTimeout(() => {
//         const result = analyzeMusicalKey(detectedNotes);
//         if (result && result.key && result.confidence >= 45) {
//           setDetectedKey(result.key);
//           setConfidence(result.confidence);
//         } else {
//           console.log('Analysis completed but no confident key found');
//         }
//         setIsAnalyzing(false);
//       }, 100);
//     }
//   }, [detectedNotes, qualityNotes, isRecording, isAnalyzing, analyzeMusicalKey]);

//   const startDetection = useCallback(async () => {
//     if (isRecording) return;

//     setIsInitializing(true);
//     setError(null);
//     setCurrentNote(null);
//     setVolumeLevel(0);
//     setDetectedNotes([]);
//     setDetectedKey(null);
//     setConfidence(0);
//     setQualityNotes(0);

//     try {
//       pitchDetectorRef.current = createPitchDetector(handleNoteDetected, handleError);
//       const started = await pitchDetectorRef.current.startDetection();
      
//       if (started) {
//         setIsRecording(true);
//         setIsInitializing(false);
//       } else {
//         setError('Failed to start key detection. Please check microphone permissions.');
//         setIsInitializing(false);
//       }
//     } catch (err) {
//       setError(err.message || 'Failed to start detection');
//       setIsInitializing(false);
//     }
//   }, [isRecording, createPitchDetector, handleNoteDetected, handleError]);

//   const stopDetection = useCallback(() => {
//     if (pitchDetectorRef.current) {
//       pitchDetectorRef.current.stopDetection();
//       pitchDetectorRef.current = null;
//     }
    
//     setIsRecording(false);
//     setCurrentNote(null);
//     setVolumeLevel(0);
//     setError(null);
//   }, []);

//   // Cleanup on unmount
//   useEffect(() => {
//     return () => {
//       if (pitchDetectorRef.current) {
//         pitchDetectorRef.current.stopDetection();
//       }
//     };
//   }, []);

//   // Demo mode with proper musical analysis
//   const startDemoMode = useCallback(() => {
//     setError(null);
//     setIsRecording(true);
    
//     // Simulate a proper musical phrase in C major with good volume
//     const musicalPhrase = [
//       'C', 'C', 'G', 'G', 'A', 'A', 'G', 
//       'F', 'F', 'E', 'E', 'D', 'D', 'C',
//       'G', 'G', 'F', 'F', 'E', 'E', 'D',
//       'C', 'G', 'G', 'F', 'F', 'E', 'E', 'D',
//       'C', 'C', 'G', 'G', 'A', 'A', 'G',
//       'F', 'F', 'E', 'E', 'D', 'D', 'C'
//     ];
    
//     let noteIndex = 0;
    
//     const demoInterval = setInterval(() => {
//       if (!isRecording) {
//         clearInterval(demoInterval);
//         return;
//       }
      
//       const noteName = musicalPhrase[noteIndex % musicalPhrase.length];
//       const note = NOTES.find(n => n.name === noteName) || NOTES[0];
      
//       setCurrentNote({
//         ...note,
//         fullName: `${note.name}${note.octave}`,
//         cents: 0
//       });
      
//       // Simulate good singing volume (above threshold)
//       setVolumeLevel(65 + Math.random() * 25);
      
//       // Add to detected notes (always above threshold in demo)
//       setDetectedNotes(prev => {
//         const newNote = {
//           name: note.name,
//           frequency: note.frequency,
//           timestamp: Date.now(),
//           volume: 70
//         };
        
//         const newNotes = [...prev, newNote];
//         setQualityNotes(newNotes.length);
        
//         // Auto-detect C major after enough quality notes
//         if (newNotes.length === 18 && !detectedKey) {
//           setDetectedKey(ALL_KEYS[0]); // C major
//           setConfidence(92);
//         }
        
//         return newNotes.slice(-50);
//       });
      
//       noteIndex++;
//     }, 600);
    
//     return () => clearInterval(demoInterval);
//   }, [isRecording, detectedKey]);

//   useEffect(() => {
//     let demoCleanup;
//     if (isRecording && error) {
//       demoCleanup = startDemoMode();
//     }
//     return () => {
//       if (demoCleanup) demoCleanup();
//     };
//   }, [isRecording, error, startDemoMode]);

//   const getConfidenceColor = (conf) => {
//     if (conf >= 80) return 'text-green-600';
//     if (conf >= 60) return 'text-yellow-600';
//     if (conf >= 45) return 'text-orange-600';
//     return 'text-red-600';
//   };

//   const getConfidenceBgColor = (conf) => {
//     if (conf >= 80) return 'bg-green-500';
//     if (conf >= 60) return 'bg-yellow-500';
//     if (conf >= 45) return 'bg-orange-500';
//     return 'bg-red-500';
//   };

//   const getVolumeStatus = () => {
//     if (volumeLevel < VOLUME_THRESHOLD) {
//       return `🔈 Too quiet - sing louder! (${volumeLevel.toFixed(0)}% < ${VOLUME_THRESHOLD}%)`;
//     }
//     return `🎤 Good volume (${volumeLevel.toFixed(0)}%)`;
//   };

//   const getAnalysisStatus = () => {
//     if (!isRecording) return "Ready to analyze";
//     if (volumeLevel < VOLUME_THRESHOLD) return "Waiting for louder singing...";
//     if (qualityNotes < MIN_QUALITY_NOTES) return `Collecting quality notes... (${qualityNotes}/${MIN_QUALITY_NOTES})`;
//     if (isAnalyzing) return "Analyzing musical content...";
//     if (detectedKey) return "Key detected!";
//     return "Processing musical patterns...";
//   };

//   if (error) {
//     return (
//       <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
//         <h2 className="text-3xl font-bold mb-4 text-gray-800">Song Key Finder</h2>
//         <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
//           <div className="text-4xl mb-4">🎵</div>
//           <p className="text-yellow-700 text-lg mb-4">
//             {error}
//           </p>
//           <p className="text-gray-600 mb-4">
//             Running in demo mode. For real key detection, allow microphone access.
//           </p>
//           <div className="space-y-3">
//             <button
//               onClick={startDetection}
//               className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors block w-full"
//             >
//               Try Real Detection Again
//             </button>
//             <button
//               onClick={stopDetection}
//               className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors block w-full"
//             >
//               Stop Demo
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="bg-white rounded-2xl shadow-xl p-8">
//       <div className="text-center mb-8">
//         <h2 className="text-3xl font-bold text-gray-800 mb-2">Song Key Finder</h2>
//         <p className="text-gray-600">Sing clearly above 20% volume for accurate key detection</p>
//       </div>
      
//       {/* Volume Status */}
//       {isRecording && (
//         <div className="mb-4 p-4 rounded-lg bg-blue-50 border border-blue-200">
//           <div className="text-center">
//             <p className={`text-sm font-medium ${
//               volumeLevel >= VOLUME_THRESHOLD ? 'text-green-600' : 'text-orange-600'
//             }`}>
//               {getVolumeStatus()}
//             </p>
//           </div>
//         </div>
//       )}
      
//       {/* Analysis Status */}
//       {isRecording && (
//         <div className="mb-6">
//           <div className="flex items-center justify-between mb-2">
//             <span className="text-sm text-gray-600">Status</span>
//             <span className="text-sm text-gray-600">{getAnalysisStatus()}</span>
//           </div>
//           <div className="flex items-center justify-between mb-2">
//             <span className="text-sm text-gray-600">Quality Notes</span>
//             <span className="text-sm text-gray-600">{qualityNotes}/{MIN_QUALITY_NOTES}</span>
//           </div>
//         </div>
//       )}
      
//       {/* Volume Indicator */}
//       {isRecording && (
//         <div className="mb-6">
//           <div className="flex items-center justify-between mb-2">
//             <span className="text-sm text-gray-600">Input Level</span>
//             <span className={`text-sm font-medium ${
//               volumeLevel >= VOLUME_THRESHOLD ? 'text-green-600' : 'text-orange-600'
//             }`}>
//               {volumeLevel.toFixed(0)}%
//             </span>
//           </div>
//           <div className="w-full bg-gray-200 rounded-full h-3">
//             <div 
//               className={`h-3 rounded-full transition-all duration-100 ${
//                 volumeLevel >= VOLUME_THRESHOLD ? 'bg-green-500' : 'bg-orange-400'
//               }`}
//               style={{ width: `${volumeLevel}%` }}
//             ></div>
//           </div>
//           <div className="text-xs text-gray-500 mt-1 text-center">
//             Threshold: {VOLUME_THRESHOLD}% (only notes above this level are analyzed)
//           </div>
//         </div>
//       )}
      
//       <div className="text-center mb-8">
//         <button
//           onClick={isRecording ? stopDetection : startDetection}
//           disabled={isInitializing}
//           className={`
//             ${isRecording 
//               ? 'bg-red-500 hover:bg-red-600' 
//               : 'bg-green-500 hover:bg-green-600'
//             } 
//             ${isInitializing ? 'opacity-50 cursor-not-allowed' : ''} 
//             text-white font-bold py-4 px-12 rounded-full text-lg shadow-lg transition-all duration-200 transform hover:scale-105 disabled:scale-100
//           `}
//         >
//           {isInitializing ? (
//             <div className="flex items-center justify-center space-x-3 min-w-[200px]">
//               <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
//               <span>Starting...</span>
//             </div>
//           ) : isRecording ? (
//             <div className="flex items-center justify-center space-x-3 min-w-[200px]">
//               <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
//               <span>Stop Analysis</span>
//             </div>
//           ) : (
//             <div className="flex items-center justify-center space-x-3 min-w-[200px]">
//               <span className="text-xl">🎵</span>
//               <span>Start Key Detection</span>
//             </div>
//           )}
//         </button>
        
//         <p className="text-gray-500 mt-3 text-sm">
//           {isRecording 
//             ? detectedKey 
//               ? 'Key detected! Continue singing to refine.'
//               : `Sing clearly above ${VOLUME_THRESHOLD}% volume...`
//             : 'Click start and sing clearly into your microphone'}
//         </p>
//       </div>

//       {/* Current Note Display */}
//       {currentNote && isRecording && volumeLevel >= VOLUME_THRESHOLD && (
//         <div className="text-center mb-6">
//           <div className="bg-green-50 rounded-xl p-4 border-2 border-green-300">
//             <p className="text-green-700 mb-2">✓ Good Quality Note:</p>
//             <div className="text-3xl font-bold text-gray-800">
//               {currentNote.name}
//               <span className="text-xl text-gray-600 ml-2">{currentNote.octave}</span>
//             </div>
//             <div className="text-sm text-green-600">
//               Volume: {volumeLevel.toFixed(0)}% ✓
//             </div>
//           </div>
//         </div>
//       )}

//       {currentNote && isRecording && volumeLevel < VOLUME_THRESHOLD && (
//         <div className="text-center mb-6">
//           <div className="bg-orange-50 rounded-xl p-4 border-2 border-orange-300">
//             <p className="text-orange-700 mb-2">🔈 Low Volume Note:</p>
//             <div className="text-3xl font-bold text-gray-800">
//               {currentNote.name}
//               <span className="text-xl text-gray-600 ml-2">{currentNote.octave}</span>
//             </div>
//             <div className="text-sm text-orange-600">
//               Volume: {volumeLevel.toFixed(0)}% - sing louder!
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Detected Key Display */}
//       {detectedKey && (
//         <div className="text-center mb-6 animate-in fade-in duration-500">
//           <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-8 text-white text-center shadow-lg">
//             <div className="text-4xl mb-4">🎼</div>
//             <div className="text-5xl font-bold mb-2">{detectedKey.name}</div>
//             <div className="text-xl opacity-90 mb-2">
//               {detectedKey.type === 'major' ? 'Major Key' : 'Minor Key'}
//             </div>
//             {detectedKey.relativeMinor || detectedKey.relativeMajor ? (
//               <div className="text-sm opacity-80 mb-4">
//                 Relative {detectedKey.relativeMinor ? 'Minor' : 'Major'}: {detectedKey.relativeMinor || detectedKey.relativeMajor}
//               </div>
//             ) : null}
            
//             {/* Confidence Meter */}
//             <div className="mb-4">
//               <div className="flex items-center justify-between mb-2">
//                 <span className="text-sm opacity-90">Confidence</span>
//                 <span className={`text-sm font-semibold ${getConfidenceColor(confidence)}`}>
//                   {confidence}%
//                 </span>
//               </div>
//               <div className="w-full bg-white bg-opacity-30 rounded-full h-3">
//                 <div 
//                   className={`h-3 rounded-full transition-all duration-500 ${getConfidenceBgColor(confidence)}`}
//                   style={{ width: `${confidence}%` }}
//                 ></div>
//               </div>
//             </div>

//             {/* Scale Notes */}
//             <div className="mt-4">
//               <p className="text-sm opacity-90 mb-2">Scale Notes:</p>
//               <div className="flex flex-wrap justify-center gap-2">
//                 {detectedKey.notes.map((note, index) => (
//                   <div
//                     key={index}
//                     className="bg-white bg-opacity-20 text-white px-3 py-1 rounded-full text-sm font-semibold"
//                   >
//                     {note}
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {isRecording && !detectedKey && (
//         <div className="text-center py-6">
//           <div className="text-gray-500">
//             <div className="flex justify-center space-x-1 mb-4">
//               {[0, 1, 2].map(i => (
//                 <div 
//                   key={i}
//                   className="w-2 h-6 bg-gray-400 rounded-full animate-bounce"
//                   style={{ animationDelay: `${i * 0.2}s` }}
//                 ></div>
//               ))}
//             </div>
//             <p className="text-lg mb-2">{getAnalysisStatus()}</p>
//             <p className="text-sm text-gray-400">
//               {volumeLevel < VOLUME_THRESHOLD 
//                 ? 'Sing louder to reach the volume threshold'
//                 : qualityNotes < MIN_QUALITY_NOTES
//                 ? `Need ${MIN_QUALITY_NOTES - qualityNotes} more quality notes`
//                 : 'Analyzing musical patterns...'}
//             </p>
//           </div>
//         </div>
//       )}

//       {/* Tips */}
//       <div className="mt-6 bg-blue-50 rounded-xl p-6 border border-blue-200">
//         <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
//           <span className="text-lg mr-2">💡</span>
//           For Best Key Detection
//         </h4>
//         <ul className="text-blue-700 text-sm space-y-2">
//           <li className="flex items-start">
//             <span className="text-blue-500 mr-2">•</span>
//             <span><strong>Sing clearly above {VOLUME_THRESHOLD}% volume</strong> - background noise is filtered out</span>
//           </li>
//           <li className="flex items-start">
//             <span className="text-blue-500 mr-2">•</span>
//             <span><strong>Only quality notes are analyzed</strong> - ensures accurate results</span>
//           </li>
//           <li className="flex items-start">
//             <span className="text-blue-500 mr-2">•</span>
//             <span><strong>Sing complete musical phrases</strong> for better pattern recognition</span>
//           </li>
//           <li className="flex items-start">
//             <span className="text-blue-500 mr-2">•</span>
//             <span><strong>Watch the volume indicator</strong> - green means good quality</span>
//           </li>
//         </ul>
//       </div>

//       {/* Debug info */}
//       {process.env.NODE_ENV === 'development' && (
//         <div className="mt-4 p-3 bg-gray-100 rounded-lg">
//           <details className="text-xs">
//             <summary className="cursor-pointer font-semibold">Debug Info</summary>
//             <div className="mt-2 space-y-1">
//               <div>Quality Notes: {qualityNotes}/{MIN_QUALITY_NOTES}</div>
//               <div>Volume: {volumeLevel.toFixed(0)}% (Threshold: {VOLUME_THRESHOLD}%)</div>
//               <div>Analyzing: {isAnalyzing ? 'Yes' : 'No'}</div>
//               <div>Detected Key: {detectedKey ? detectedKey.name : 'None'}</div>
//               <div>Confidence: {confidence}%</div>
//               <div>Recent Quality Notes: {detectedNotes.slice(-5).map(n => n.name).join(' → ')}</div>
//             </div>
//           </details>
//         </div>
//       )}
//     </div>
//   );
// }



'use client';

export default function KeyFinder() {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
      <h2 className="text-3xl font-bold mb-4 text-gray-800">Song Key Finder</h2>
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-12 border-2 border-dashed border-gray-300">
        <div className="text-6xl mb-6">🎵</div>
        <h3 className="text-2xl font-bold text-gray-700 mb-4">Coming Soon</h3>
        <p className="text-gray-600 text-lg max-w-md mx-auto">
          We're working on an advanced key detection algorithm that will accurately identify the musical key of your singing. Check back soon for this feature!
        </p>
      </div>
    </div>
  );
}