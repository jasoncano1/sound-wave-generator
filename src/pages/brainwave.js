import React, { useState, useEffect } from 'react';
import * as Tone from 'tone';

const BrainwaveBinauralGenerator = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [frequency, setFrequency] = useState(200);
  const [useCustomFrequency, setUseCustomFrequency] = useState(false);
  const [binauralBeat, setBinauralBeat] = useState(6);
  const [volume, setVolume] = useState(-20);
  const [waveType, setWaveType] = useState('theta');
  const [oscillators, setOscillators] = useState(null);

  // Brainwave frequency ranges
  const brainwaveRanges = {
    delta: { min: 0.5, max: 4, description: "Deep sleep, healing, dreamless sleep", color: "indigo" },
    theta: { min: 4, max: 8, description: "Deep meditation, REM sleep, creativity", color: "blue" },
    alpha: { min: 8, max: 12, description: "Relaxed alertness, calm focus, flow state", color: "green" },
    lowBeta: { min: 12, max: 15, description: "Relaxed focus, calm thinking", color: "yellow" },
    midBeta: { min: 15, max: 20, description: "Active engagement, learning", color: "orange" },
    highBeta: { min: 20, max: 30, description: "Alertness, problem solving", color: "red" },
    gamma: { min: 30, max: 50, description: "Higher cognitive processing, peak concentration", color: "purple" }
  };

  // Initialize oscillators
  const setupOscillators = () => {
    // Create separate channels for left and right
    const leftChannel = new Tone.Channel({ volume: volume }).toDestination();
    const rightChannel = new Tone.Channel({ volume: volume }).toDestination();
    
    // Create the panners
    const leftPanner = new Tone.Panner(-1).connect(leftChannel);
    const rightPanner = new Tone.Panner(1).connect(rightChannel);
    
    // Create two oscillators with slightly different frequencies to create binaural beat
    const leftOsc = new Tone.Oscillator({
      frequency: frequency,
      type: "sine",
      volume: 0 // Volume handled by channel
    }).connect(leftPanner);
    
    // Right oscillator frequency = base frequency + beat frequency
    const rightOsc = new Tone.Oscillator({
      frequency: frequency + binauralBeat,
      type: "sine", 
      volume: 0 // Volume handled by channel
    }).connect(rightPanner);
    
    // Add a test tone that should be clearly audible
    const testTone = new Tone.Oscillator({
      frequency: 440, // A4 note - easily audible
      type: "triangle",
      volume: -20
    }).toDestination();
    
    // Start the test tone for 1 second then stop
    testTone.start();
    setTimeout(() => testTone.stop(), 1000);
    
    return { leftOsc, rightOsc, leftChannel, rightChannel };
  };

  // Toggle play/pause
  const togglePlay = async () => {
    try {
      // Start audio context if needed
      if (Tone.context.state !== 'running') {
        await Tone.start();
        console.log("Tone.js audio context started");
      }
      
      if (!isPlaying) {
        console.log("Setting up oscillators");
        const newOscillators = setupOscillators();
        console.log(`Starting oscillators: Left=${frequency}Hz, Right=${frequency + binauralBeat}Hz`);
        newOscillators.leftOsc.start();
        newOscillators.rightOsc.start();
        setOscillators(newOscillators);
        console.log("Oscillators started successfully");
      } else {
        if (oscillators) {
          console.log("Stopping oscillators");
          oscillators.leftOsc.stop();
          oscillators.rightOsc.stop();
          oscillators.leftOsc.dispose();
          oscillators.rightOsc.dispose();
          console.log("Oscillators stopped and disposed");
        }
      }
      
      setIsPlaying(!isPlaying);
    } catch (error) {
      console.error("Audio playback error:", error);
      alert("Audio playback error. Please check console for details.");
    }
  };

  // Change wave type
  const changeWaveType = (type) => {
    setWaveType(type);
    
    // Set binauralBeat to middle of selected range
    const range = brainwaveRanges[type];
    const middleValue = (range.min + range.max) / 2;
    setBinauralBeat(parseFloat(middleValue.toFixed(1)));
  };

  // Update oscillator parameters when settings change
  useEffect(() => {
    if (isPlaying && oscillators) {
      oscillators.leftOsc.frequency.value = frequency;
      oscillators.rightOsc.frequency.value = frequency + binauralBeat;
      oscillators.leftOsc.volume.value = volume;
      oscillators.rightOsc.volume.value = volume;
    }
  }, [frequency, binauralBeat, volume, isPlaying]);

  // Clean up oscillators when component unmounts
  useEffect(() => {
    return () => {
      if (oscillators) {
        oscillators.leftOsc.stop();
        oscillators.rightOsc.stop();
        oscillators.leftOsc.dispose();
        oscillators.rightOsc.dispose();
      }
    };
  }, [oscillators]);

  // Get background color for current wave type button
  const getButtonClass = (type) => {
    const baseClass = "px-2 py-1 text-sm font-medium rounded-md text-white";
    const selectedClass = type === waveType ? "ring-2 ring-white" : "";
    const colorClass = `bg-${brainwaveRanges[type].color}-500`;
    return `${baseClass} ${colorClass} ${selectedClass}`;
  };

  return (
    <div className="p-6 max-w-lg mx-auto bg-white rounded-xl shadow-md space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800">Brainwave Binaural Generator</h1>
        <button 
          onClick={togglePlay}
          className={`px-4 py-2 rounded-md text-white font-medium ${isPlaying ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
        >
          {isPlaying ? 'Stop' : 'Start'}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        <button onClick={() => changeWaveType('delta')} className="px-2 py-1 text-sm font-medium rounded-md text-white bg-indigo-500 hover:bg-indigo-600">
          Delta
        </button>
        <button onClick={() => changeWaveType('theta')} className="px-2 py-1 text-sm font-medium rounded-md text-white bg-blue-500 hover:bg-blue-600">
          Theta
        </button>
        <button onClick={() => changeWaveType('alpha')} className="px-2 py-1 text-sm font-medium rounded-md text-white bg-green-500 hover:bg-green-600">
          Alpha
        </button>
        <button onClick={() => changeWaveType('lowBeta')} className="px-2 py-1 text-sm font-medium rounded-md text-white bg-yellow-500 hover:bg-yellow-600">
          Low Beta
        </button>
        <button onClick={() => changeWaveType('midBeta')} className="px-2 py-1 text-sm font-medium rounded-md text-white bg-orange-500 hover:bg-orange-600">
          Mid Beta
        </button>
        <button onClick={() => changeWaveType('highBeta')} className="px-2 py-1 text-sm font-medium rounded-md text-white bg-red-500 hover:bg-red-600">
          High Beta
        </button>
        <button onClick={() => changeWaveType('gamma')} className="px-2 py-1 text-sm font-medium rounded-md text-white bg-purple-500 hover:bg-purple-600">
          Gamma
        </button>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Carrier Frequency: {frequency} Hz
          </label>
          <div className="flex space-x-2 mb-2">
            <button 
              onClick={() => {setFrequency(200); setUseCustomFrequency(false)}} 
              className={`px-2 py-1 text-xs font-medium rounded-md ${!useCustomFrequency && frequency === 200 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}
              disabled={isPlaying}
            >
              200 Hz
            </button>
            <button 
              onClick={() => {setFrequency(1000); setUseCustomFrequency(false)}} 
              className={`px-2 py-1 text-xs font-medium rounded-md ${!useCustomFrequency && frequency === 1000 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}
              disabled={isPlaying}
            >
              1000 Hz
            </button>
            <button 
              onClick={() => setUseCustomFrequency(true)} 
              className={`px-2 py-1 text-xs font-medium rounded-md ${useCustomFrequency ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}
              disabled={isPlaying}
            >
              Custom
            </button>
          </div>
          {useCustomFrequency && (
            <div>
              <input
                type="range"
                min="100"
                max="2000"
                step="10"
                value={frequency}
                onChange={(e) => setFrequency(parseInt(e.target.value))}
                disabled={isPlaying}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>100 Hz</span>
                <span>2000 Hz</span>
              </div>
            </div>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Binaural Beat ({waveType.charAt(0).toUpperCase() + waveType.slice(1)}): {binauralBeat} Hz
          </label>
          <input
            type="range"
            min={brainwaveRanges[waveType].min}
            max={brainwaveRanges[waveType].max}
            step="0.1"
            value={binauralBeat}
            onChange={(e) => setBinauralBeat(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{brainwaveRanges[waveType].min} Hz</span>
            <span>{brainwaveRanges[waveType].max} Hz</span>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Volume: {volume} dB
          </label>
          <input
            type="range"
            min="-40"
            max="0"
            step="1"
            value={volume}
            onChange={(e) => setVolume(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Quiet</span>
            <span>Loud</span>
          </div>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
          <h3 className="text-sm font-semibold text-yellow-800 flex items-center">
            <span className="mr-2">⚠️</span> Audio Troubleshooting
          </h3>
          <ol className="text-sm text-yellow-700 list-decimal pl-5 mt-2 space-y-1">
            <li>Make sure your device's volume is turned up</li>
            <li>Use headphones (required for binaural effects)</li>
            <li>Click the Start button and allow any audio permissions</li>
            <li>You should hear a brief test tone when starting</li>
            <li>Increase the volume slider above if needed</li>
          </ol>
          <div className="mt-2 pt-2 border-t border-yellow-200">
            <p className="text-sm text-yellow-800 font-medium">About Carrier Frequencies:</p>
            <ul className="text-xs text-yellow-700 mt-1 space-y-1">
              <li>• 200 Hz: Traditional carrier, works well for most people</li>
              <li>• 1000 Hz: Higher carrier, may be more perceptible to some</li>
              <li>• Custom: Choose your preferred carrier frequency</li>
              <li>• Note: The binaural effect occurs from the frequency difference between ears</li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="bg-blue-50 p-4 rounded-lg">
        <h2 className="text-md font-semibold text-blue-800 mb-2">Current Wave: {waveType.charAt(0).toUpperCase() + waveType.slice(1)}</h2>
        <p className="text-sm text-blue-700 mb-3">{brainwaveRanges[waveType].description}</p>
        
        <h3 className="text-sm font-semibold text-blue-800 mb-1">How to Use</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• <strong>HEADPHONES REQUIRED</strong> - binaural beats only work with stereo headphones</li>
          <li>• Click the "Start" button and allow audio permissions if prompted</li>
          <li>• If no sound, check your volume settings and make sure headphones are connected</li>
          <li>• Try increasing the volume slider and your device volume</li>
          <li>• Find a quiet, comfortable space</li>
          <li>• Start with 10-30 minute sessions</li>
          <li>• Different brainwaves support different mental states</li>
        </ul>
      </div>
      
      {isPlaying && (
        <div className="animate-pulse bg-green-100 border border-green-400 p-3 rounded-lg text-center">
          <p className="text-green-800 font-medium">
            Audio playing: {frequency}Hz carrier with {binauralBeat}Hz binaural beat
          </p>
          <p className="text-sm text-green-700">
            Left ear: {frequency}Hz | Right ear: {frequency + binauralBeat}Hz
          </p>
          <p className="text-sm text-green-700">
            Remember: You must use headphones to hear binaural beats properly
          </p>
        </div>
      )}
    </div>
  );
};

export default BrainwaveBinauralGenerator;