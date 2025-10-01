import '@tensorflow/tfjs-react-native';
import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import * as blazeface from '@tensorflow-models/blazeface';
import type { Tensor3D } from '@tensorflow/tfjs';
import type { CameraCapturedPicture } from 'expo-camera';
import { Platform } from 'react-native';
import type {
  EnvironmentObject,
  EnvironmentScan,
  AIAnalysis,
  Quest,
} from '../core/types';

export type LensCoreActivity =
  | 'studying'
  | 'socializing'
  | 'creating'
  | 'resting'
  | 'commuting'
  | 'unknown';

export interface LensCoreContext {
  location: string;
  timeOfDay: EnvironmentScan['timeOfDay'];
  scheduleFocus?: string;
  ambientNoiseDb?: number;
  heartRate?: number;
  recentStressEvents?: number;
}

export interface LensCoreIntervention {
  trigger: string;
  priority: 'low' | 'medium' | 'high';
  suggestedQuest?: Quest;
  notificationCopy: string;
}

export interface LensCoreAnalysisResult {
  scan: EnvironmentScan;
  ai: AIAnalysis;
  interventions: LensCoreIntervention[];
}

const FOCUS_OBJECTS = new Set([
  'book',
  'laptop',
  'cell phone',
  'tablet',
  'pen',
  'notebook',
  'keyboard',
]);

const DISTRACTION_OBJECTS = new Set([
  'television',
  'game controller',
  'remote',
  'sports ball',
  'cup',
]);

const WELLNESS_OBJECTS = new Set(['water bottle', 'yoga mat', 'chair', 'sofa']);

const MIN_FOCUS_FACE_SCORE = 0.75;

const DEFAULT_ANALYSIS: AIAnalysis = {
  objectDetection: 'Books, devices, people, materials',
  activityClassification: 'Studying, socializing, creating, resting',
  moodAssessment: 'Focus, frustration, engagement, stress',
  intentPrediction: 'What student is trying to accomplish',
  interventionTriggers: 'When and how to offer help',
};

export class LensCoreEnvironmentAnalyzer {
  private objectModel?: cocoSsd.ObjectDetection;
  private faceModel?: blazeface.BlazeFaceModel;
  private readyPromise?: Promise<void>;

  async ready() {
    if (!this.readyPromise) {
      this.readyPromise = this.bootstrapModels();
    }
    await this.readyPromise;
  }

  private async bootstrapModels() {
    await tf.ready();
    if (Platform.OS !== 'web' && tf.getBackend() !== 'rn-webgl') {
      try {
        await tf.setBackend('rn-webgl');
      } catch (error) {
        console.warn('LensCore: failed to set rn-webgl backend, falling back to', tf.getBackend(), error);
      }
    }
    const [objectModel, faceModel] = await Promise.all([
      cocoSsd.load({ base: 'lite_mobilenet_v2' }),
      blazeface.load(),
    ]);
    this.objectModel = objectModel;
    this.faceModel = faceModel;
  }

  async analyzeCameraTensor(tensor: Tensor3D, context: LensCoreContext): Promise<LensCoreAnalysisResult> {
    await this.ready();
    const [objectPredictions, facePredictions] = await Promise.all([
      this.objectModel?.detect(tensor) ?? [],
      this.faceModel?.estimateFaces(tensor, false) ?? [],
    ]);

    const objects: EnvironmentObject[] = objectPredictions.map((prediction) => ({
      label: prediction.class,
      confidence: prediction.score ?? 0,
      bounds: {
        x: prediction.bbox[0],
        y: prediction.bbox[1],
        width: prediction.bbox[2],
        height: prediction.bbox[3],
      },
      context: this.resolveObjectContext(prediction.class),
    }));

    const peopleCount = facePredictions.length;
    const focusLevel = this.computeFocusLevel(facePredictions, context);
    const stress = this.computeStressEstimate(context, focusLevel);

    const scan: EnvironmentScan = {
      objects,
      people: peopleCount,
      activity: this.classifyActivity(objects, peopleCount, context),
      mood: this.estimateMood(stress, focusLevel),
      location: context.location,
      timeOfDay: context.timeOfDay,
      userState: {
        likelyIntent: this.predictIntent(objects, context),
        focusLevel,
        energyEstimate: this.estimateEnergy(context),
        stressIndicators: stress,
      },
    };

    const interventions = this.generateInterventions(scan);

    return {
      scan,
      ai: DEFAULT_ANALYSIS,
      interventions,
    };
  }

  createSyntheticTensor(context: LensCoreContext): Tensor3D {
    const width = 64;
    const height = 64;
    const baseValue = context.timeOfDay === 'morning' ? 220 : context.timeOfDay === 'evening' ? 120 : 180;
    const buffer = new Uint8Array(width * height * 3).fill(baseValue);
    return tf.tensor3d(buffer, [height, width, 3], 'int32');
  }

  async analyzeCapturedImage(image: CameraCapturedPicture, context: LensCoreContext): Promise<LensCoreAnalysisResult> {
    await this.ready();
    const imageTensor = tf.tidy(() => {
      const values = new Uint8Array(image.data?.length ?? 0);
      if (image.data) {
        values.set(image.data);
      }
      const tensor = tf.tensor3d(values, [image.height, image.width, 3], 'int32');
      return tensor as Tensor3D;
    });
    try {
      return await this.analyzeCameraTensor(imageTensor, context);
    } finally {
      imageTensor.dispose();
    }
  }

  private resolveObjectContext(label: string): EnvironmentObject['context'] {
    if (FOCUS_OBJECTS.has(label)) {
      return 'study_tool';
    }
    if (DISTRACTION_OBJECTS.has(label)) {
      return 'distraction';
    }
    if (WELLNESS_OBJECTS.has(label)) {
      return 'wellness_support';
    }
    return 'focus_anchor';
  }

  private classifyActivity(objects: EnvironmentObject[], people: number, context: LensCoreContext): LensCoreActivity {
    if (context.location.includes('bus') || context.location.includes('train')) {
      return 'commuting';
    }
    if (people > 1 && objects.some((object) => object.context === 'distraction')) {
      return 'socializing';
    }
    if (objects.some((object) => object.context === 'study_tool')) {
      return 'studying';
    }
    if (context.ambientNoiseDb && context.ambientNoiseDb > 65) {
      return 'socializing';
    }
    return 'unknown';
  }

  private computeFocusLevel(faces: blazeface.NormalizedFace[], context: LensCoreContext) {
    if (!faces.length) {
      return Math.max(0.2, 1 - (context.ambientNoiseDb ?? 40) / 100);
    }
    const avgConfidence =
      faces.reduce((acc, face) => acc + (face.probability ?? MIN_FOCUS_FACE_SCORE), 0) / faces.length;
    const baseline = avgConfidence / 1.2;
    const heartRatePenalty = context.heartRate && context.heartRate > 110 ? 0.15 : 0;
    return Number(Math.max(0, Math.min(1, baseline - heartRatePenalty)).toFixed(2));
  }

  private computeStressEstimate(context: LensCoreContext, focusLevel: number) {
    const stressFromHeart = context.heartRate ? Math.max(0, (context.heartRate - 70) / 60) : 0.2;
    const stressFromNoise = context.ambientNoiseDb ? Math.min(1, context.ambientNoiseDb / 100) : 0.2;
    const stressFromEvents = context.recentStressEvents ? Math.min(1, context.recentStressEvents / 3) : 0;
    const focusOffset = 1 - focusLevel;
    return Number(Math.max(0, Math.min(1, 0.25 + stressFromHeart * 0.35 + stressFromNoise * 0.25 + stressFromEvents * 0.15 + focusOffset * 0.2)).toFixed(2));
  }

  private estimateMood(stress: number, focus: number) {
    if (stress > 0.7) {
      return 'stressed';
    }
    if (focus > 0.7) {
      return 'focused';
    }
    if (stress > 0.5) {
      return 'frustrated';
    }
    if (focus < 0.4) {
      return 'distracted';
    }
    return 'balanced';
  }

  private estimateEnergy(context: LensCoreContext) {
    const base = context.heartRate ? Math.min(1, context.heartRate / 120) : 0.6;
    const timeBonus = context.timeOfDay === 'morning' ? 0.1 : context.timeOfDay === 'evening' ? -0.1 : 0;
    return Number(Math.max(0, Math.min(1, base + timeBonus)).toFixed(2));
  }

  private predictIntent(objects: EnvironmentObject[], context: LensCoreContext) {
    if (objects.some((object) => object.context === 'study_tool')) {
      return context.scheduleFocus ?? 'complete coursework';
    }
    if (context.location.includes('cafeteria')) {
      return 'social recharge';
    }
    if (context.timeOfDay === 'night') {
      return 'rest and recovery';
    }
    return 'explore interests';
  }

  private generateInterventions(scan: EnvironmentScan): LensCoreIntervention[] {
    const interventions: LensCoreIntervention[] = [];
    if (scan.userState.focusLevel < 0.5) {
      interventions.push({
        trigger: 'low_focus',
        priority: 'medium',
        notificationCopy: 'Focus slip detected—activate a 10-minute Deep Focus burst?',
      });
    }
    if (scan.userState.stressIndicators > 0.65) {
      interventions.push({
        trigger: 'high_stress',
        priority: 'high',
        notificationCopy: 'Stress spikes detected. Launch a 3-minute breathing quest now.',
      });
    }
    if (scan.activity === 'commuting') {
      interventions.push({
        trigger: 'commute_window',
        priority: 'low',
        notificationCopy: 'Commute unlocked—queue today’s micro-lesson playlist?',
      });
    }
    return interventions;
  }
}

export const lensCoreEnvironmentAnalyzer = new LensCoreEnvironmentAnalyzer();
