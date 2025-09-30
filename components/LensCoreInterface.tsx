import React, { useRef, useEffect, useState } from 'react';
import { Camera, Scan, Zap, AlertCircle } from 'lucide-react';
import { EnvironmentScan, Quest } from '@core/types';

interface LensCoreInterfaceProps {
  onQuestGenerated: (quest: Quest) => void;
}

export const LensCoreInterface: React.FC<LensCoreInterfaceProps> = ({ onQuestGenerated }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [hasCameraAccess, setHasCameraAccess] = useState(false);
  const [scanResult, setScanResult] = useState<EnvironmentScan | null>(null);
  const [generatedQuests, setGeneratedQuests] = useState<Quest[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initCamera = async () => {
      try {
        if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
          throw new Error('Camera access not supported in this environment.');
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480 },
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setHasCameraAccess(true);
        }
      } catch (err) {
        setError('Camera access denied. Please enable camera permissions.');
        console.error('Camera error:', err);
      }
    };

    initCamera();

    return () => {
      const tracks = (videoRef.current?.srcObject as MediaStream | null)?.getTracks?.();
      tracks?.forEach((track) => track.stop());
    };
  }, []);

  const simulateObjectDetection = (): EnvironmentScan => {
    const objects = [
      { label: 'book', confidence: 0.92, bounds: { x: 100, y: 100, width: 200, height: 300 }, context: 'study_tool' as const },
      { label: 'laptop', confidence: 0.88, bounds: { x: 350, y: 150, width: 400, height: 250 }, context: 'study_tool' as const },
      { label: 'cell phone', confidence: 0.78, bounds: { x: 500, y: 50, width: 100, height: 150 }, context: 'distraction' as const },
    ];

    return {
      objects,
      people: 1,
      activity: 'studying',
      mood: 'focused',
      location: 'study_room',
      timeOfDay: new Date().getHours() < 12 ? 'morning' : 'afternoon',
      userState: {
        likelyIntent: 'academic_work',
        focusLevel: 0.8,
        energyEstimate: 0.7,
        stressIndicators: 0.3,
      },
    };
  };

  const handleScan = async () => {
    if (!hasCameraAccess) {
      setError('No camera access. Please enable permissions and try again.');
      return;
    }

    setIsScanning(true);
    setError(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const result = simulateObjectDetection();
      setScanResult(result);

      const quests = generateQuestsFromEnvironment(result);
      setGeneratedQuests(quests);
    } catch (err) {
      setError('Scan failed. Please try again.');
      console.error(err);
    } finally {
      setIsScanning(false);
    }
  };

  const generateQuestsFromEnvironment = (scan: EnvironmentScan): Quest[] => {
    const quests: Quest[] = [];
    const baseId = `quest_${Date.now()}`;

    if (scan.activity === 'studying') {
      quests.push({
        id: `${baseId}_study`,
        title: '📚 Study Session Quest',
        description: 'Master your current subject with focused practice',
        type: 'learning',
        difficulty: 3,
        objectives: [
          {
            id: 'obj_1',
            description: '25 minutes of focused study time',
            type: 'action',
            quantity: 1,
            completed: false,
          },
          {
            id: 'obj_2',
            description: 'Summarize 3 key concepts',
            type: 'create',
            quantity: 3,
            completed: false,
          },
        ],
        rewards: [
          { type: 'xp', value: 200 },
          { type: 'vTokens', value: 75 },
        ],
        timeLimit: 45,
        environmentRequirements: scan,
        generatedFrom: 'camera',
      });
    }

    quests.push({
      id: `${baseId}_focus`,
      title: '🎯 Deep Focus Challenge',
      description: 'Eliminate distractions and enter flow state',
      type: 'focus',
      difficulty: 2,
      objectives: [
        {
          id: 'obj_1',
          description: 'Put phone on silent mode',
          type: 'action',
          quantity: 1,
          completed: false,
        },
        {
          id: 'obj_2',
          description: 'Work without breaks for 30min',
          type: 'action',
          quantity: 1,
          completed: false,
        },
      ],
      rewards: [
        { type: 'xp', value: 150 },
        { type: 'vTokens', value: 50 },
      ],
      timeLimit: 30,
      environmentRequirements: scan,
      generatedFrom: 'camera',
    });

    return quests;
  };

  const acceptQuest = (quest: Quest) => {
    onQuestGenerated(quest);
    setGeneratedQuests((prev) => prev.filter((q) => q.id !== quest.id));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center space-x-3 mb-6">
        <Camera className="text-verse-cyan" size={32} />
        <div>
          <h1 className="text-3xl font-bold text-verse-cyan">FLWX Lens Core</h1>
          <p className="text-verse-cyan/70">AI-Powered Environment Scanner</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left Column - Camera & Controls */}
        <div className="space-y-6">
          <div className="bg-gray-900/50 border border-verse-cyan/20 rounded-xl p-6">
            <h2 className="text-xl font-bold text-verse-cyan mb-4">Environment Scanner</h2>

            <div className="relative bg-black rounded-lg overflow-hidden border-2 border-verse-cyan/30">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-64 object-cover"
              />
              {isScanning && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-verse-cyan mx-auto mb-4"></div>
                    <p className="text-verse-cyan font-bold">Analyzing Environment...</p>
                  </div>
                </div>
              )}

              {!hasCameraAccess && !error && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <div className="text-center">
                    <AlertCircle className="text-verse-orange mx-auto mb-2" size={32} />
                    <p className="text-verse-orange">Camera access required</p>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleScan}
              disabled={isScanning || !hasCameraAccess}
              className="w-full mt-4 bg-verse-cyan text-verse-black py-3 rounded-lg font-bold hover:bg-verse-cyan/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition-all"
            >
              <Scan size={20} />
              <span>{isScanning ? 'Scanning...' : 'Scan Environment'}</span>
            </button>

            {error && (
              <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <div className="flex items-center space-x-2 text-red-400">
                  <AlertCircle size={20} />
                  <span>{error}</span>
                </div>
              </div>
            )}
          </div>

          {/* Scan Results */}
          {scanResult && (
            <div className="bg-gray-900/50 border border-verse-purple/20 rounded-xl p-6">
              <h3 className="text-lg font-bold text-verse-purple mb-4">Environment Analysis</h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-gray-400">Activity</label>
                    <div className="text-verse-cyan font-medium capitalize">{scanResult.activity}</div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Mood</label>
                    <div className="text-verse-cyan font-medium capitalize">{scanResult.mood}</div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Focus Level</label>
                    <div className="text-verse-cyan font-medium">
                      {(scanResult.userState.focusLevel * 100).toFixed(0)}%
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-gray-400">Location</label>
                    <div className="text-verse-cyan font-medium capitalize">{scanResult.location}</div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">People</label>
                    <div className="text-verse-cyan font-medium">{scanResult.people}</div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Energy</label>
                    <div className="text-verse-cyan font-medium">
                      {(scanResult.userState.energyEstimate * 100).toFixed(0)}%
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="font-bold text-verse-green mb-3">Detected Objects</h4>
                <div className="flex flex-wrap gap-2">
                  {scanResult.objects.map((obj, index) => (
                    <div
                      key={index}
                      className="px-3 py-1 bg-verse-green/10 border border-verse-green/20 rounded-full text-sm"
                    >
                      {obj.label} ({(obj.confidence * 100).toFixed(0)}%)
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Generated Quests */}
        <div className="space-y-6">
          <div className="flex items-center space-x-2 mb-4">
            <Zap className="text-verse-orange" size={24} />
            <h2 className="text-2xl font-bold text-verse-orange">Generated Quests</h2>
          </div>

          {generatedQuests.length === 0 ? (
            <div className="bg-gray-900/50 border border-verse-orange/20 rounded-xl p-8 text-center">
              <Zap className="text-verse-orange/50 mx-auto mb-4" size={48} />
              <h3 className="text-lg font-bold text-verse-orange/70 mb-2">No Quests Yet</h3>
              <p className="text-gray-400">Scan your environment to generate personalized quests!</p>
              <p className="text-gray-500 text-sm mt-2">The AI will analyze what it sees and create perfect challenges.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {generatedQuests.map((quest) => (
                <div
                  key={quest.id}
                  className="bg-gray-900/50 border border-verse-orange/20 rounded-xl p-5 hover:border-verse-orange/40 transition-all"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-verse-orange mb-1">{quest.title}</h3>
                      <p className="text-gray-400 text-sm">{quest.description}</p>
                    </div>
                    <div className="text-right ml-4">
                      {quest.timeLimit && (
                        <div className="text-verse-cyan font-bold text-lg">{quest.timeLimit}min</div>
                      )}
                      <div className="text-verse-green text-sm">
                        +{quest.rewards.find((r) => r.type === 'xp')?.value} XP
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    {quest.objectives.map((objective) => (
                      <div key={objective.id} className="flex items-center space-x-3">
                        <div
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                            objective.completed
                              ? 'bg-verse-green border-verse-green'
                              : 'border-verse-cyan/50'
                          }`}
                        >
                          {objective.completed && '✓'}
                        </div>
                        <span
                          className={`text-sm ${
                            objective.completed ? 'text-gray-400 line-through' : 'text-gray-200'
                          }`}
                        >
                          {objective.description}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-gray-700">
                    <div className="flex space-x-2">
                      {quest.rewards.map((reward, index) => (
                        <div key={index} className="text-xs px-2 py-1 bg-verse-cyan/10 rounded">
                          {reward.type === 'xp' && '⚡'}
                          {reward.type === 'vTokens' && '🪙'}
                          {reward.value} {reward.type}
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => acceptQuest(quest)}
                      className="bg-verse-orange text-verse-black px-4 py-2 rounded-lg font-bold hover:bg-verse-orange/90 transition-colors"
                    >
                      Accept Quest
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
