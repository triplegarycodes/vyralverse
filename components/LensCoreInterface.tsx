import React, { useCallback, useEffect, useRef, useState } from 'react';
import { CameraView, CameraViewRef, useCameraPermissions } from 'expo-camera';
import { Camera, Scan, Zap, AlertCircle, Sparkles } from 'lucide-react-native';
import { EnvironmentScan, Quest } from '@core/types';

interface LensCoreInterfaceProps {
  onQuestGenerated: (quest: Quest) => void;
}

export const LensCoreInterface: React.FC<LensCoreInterfaceProps> = ({ onQuestGenerated }) => {
  const cameraRef = useRef<CameraViewRef | null>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<EnvironmentScan | null>(null);
  const [generatedQuests, setGeneratedQuests] = useState<Quest[]>([]);
  const [error, setError] = useState<string | null>(null);

  const hasCameraAccess = permission?.granted ?? false;

  const handlePermissionRequest = useCallback(async () => {
    try {
      const response = await requestPermission();
      if (!response?.granted) {
        setError('Camera access denied. Enable permissions to activate the lens.');
        setIsCameraReady(false);
      }
      return response;
    } catch (permissionError) {
      console.error('Camera permission error:', permissionError);
      setError('Unable to request camera permissions. Please try again.');
      return null;
    }
  }, [requestPermission]);

  useEffect(() => {
    if (!permission) {
      void handlePermissionRequest();
      return;
    }

    if (!permission.granted) {
      setError('Camera access denied. Enable permissions to activate the lens.');
      setIsCameraReady(false);
    } else {
      setError(null);
    }
  }, [permission, handlePermissionRequest]);

  const handleCameraReady = useCallback(() => {
    setIsCameraReady(true);
    setError(null);
  }, []);

  useEffect(() => {
    const camera = cameraRef.current as unknown as { pausePreview?: () => void } | null;
    return () => {
      camera?.pausePreview?.();
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

  const generateQuestsFromEnvironment = (scan: EnvironmentScan): Quest[] => {
    const quests: Quest[] = [];
    const baseId = `quest_${Date.now()}`;

    if (scan.activity === 'studying') {
      quests.push({
        id: `${baseId}_study`,
        title: '📚 Study Session Quest',
        description: 'Master your current subject with focused practice.',
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
      description: 'Eliminate distractions and enter flow state.',
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
          description: 'Work without breaks for 30 minutes',
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

  const handleScan = async () => {
    if (!hasCameraAccess) {
      setError('No camera access. Please enable permissions and try again.');
      return;
    }

    setIsScanning(true);
    setError(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1800));

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

  const acceptQuest = (quest: Quest) => {
    onQuestGenerated(quest);
    setGeneratedQuests((prev) => prev.filter((q) => q.id !== quest.id));
  };

  return (
    <div className="lens-interface">
      <header className="panel-header lens-header">
        <div className="panel-title">
          <Camera size={20} />
          <h2>FLWX Lens Core</h2>
        </div>
        <p>AI-powered environment scanner for adaptive quests.</p>
      </header>

      <div className="lens-grid">
        <section className="lens-stage-card">
          <div className="lens-stage">
            {hasCameraAccess ? (
              <CameraView
                ref={cameraRef}
                style={{ flex: 1 }}
                onCameraReady={handleCameraReady}
              />
            ) : (
              <div className="camera-placeholder">
                <Camera size={36} />
                <p>Enable camera access to activate the lens.</p>
              </div>
            )}
            {isScanning && (
              <div className="scan-overlay" aria-live="polite">
                <div className="scan-ring" />
                <span className="scan-status">
                  <Scan size={18} /> Scanning environment…
                </span>
              </div>
            )}
          </div>

          <div className="lens-actions">
            <button
              type="button"
              className="neo-button neo-button--ghost"
              onClick={handlePermissionRequest}
            >
              <Camera size={16} /> Request Access
            </button>
            <button
              type="button"
              className="neo-button neo-button--cyan"
              onClick={handleScan}
              disabled={!isCameraReady || isScanning || !hasCameraAccess}
            >
              <Scan size={16} /> {isScanning ? 'Scanning…' : 'Start Scan'}
            </button>
          </div>

          {error && (
            <div className="status-note status-note--error">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          {!error && scanResult && (
            <div className="status-note status-note--success">
              <Sparkles size={16} /> Flow signature captured • {scanResult.activity}
            </div>
          )}

          {scanResult && (
            <div className="scan-matrix">
              <div>
                <span className="scan-label">Focus Level</span>
                <span className="scan-value">{Math.round(scanResult.userState.focusLevel * 100)}%</span>
              </div>
              <div>
                <span className="scan-label">Energy</span>
                <span className="scan-value">{Math.round(scanResult.userState.energyEstimate * 100)}%</span>
              </div>
              <div>
                <span className="scan-label">Stress</span>
                <span className="scan-value">{Math.round(scanResult.userState.stressIndicators * 100)}%</span>
              </div>
              <div>
                <span className="scan-label">Detected Objects</span>
                <div className="scan-tags">
                  {scanResult.objects.map((object) => (
                    <span key={object.label} className="scan-pill">
                      {object.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>

        <section className="panel lens-quests">
          <div className="panel-header">
            <div className="panel-title">
              <Zap size={18} />
              <h3>Quest Recommendations</h3>
            </div>
            <span>Adaptive mission feed</span>
          </div>

          {generatedQuests.length === 0 ? (
            <div className="highlight-card">
              <h3>No quests generated yet</h3>
              <p>Run a scan to synthesize fresh quests from your current environment.</p>
            </div>
          ) : (
            <div className="quest-grid">
              {generatedQuests.map((quest) => (
                <article key={quest.id} className="quest-preview">
                  <div className="quest-preview-header">
                    <strong>{quest.title}</strong>
                    <span className="quest-difficulty">Intensity {quest.difficulty}/5</span>
                  </div>
                  <p>{quest.description}</p>
                  <div className="quest-preview-meta">
                    <div className="reward-line">
                      <span>Rewards</span>
                      <div>
                        {quest.rewards.map((reward, index) => (
                          <span key={index} className="reward-token">
                            {reward.type === 'xp' ? '⚡' : '🪙'} {reward.value} {reward.type}
                          </span>
                        ))}
                      </div>
                    </div>
                    <button type="button" className="neo-button neo-button--violet" onClick={() => acceptQuest(quest)}>
                      Accept Quest
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
