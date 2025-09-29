import React, { useCallback, useRef } from 'react';
import { StyleProp, StyleSheet, ViewStyle } from 'react-native';
import { GLView, ExpoWebGLRenderingContext } from 'expo-gl';
import { Renderer } from 'expo-three';
import * as THREE from 'three';
import { VersePalette } from '../../theme';

type NeonThreeCanvasProps = {
  variant: 'tree' | 'starmap' | 'board' | 'forest' | 'echo';
  palette: VersePalette;
  style?: StyleProp<ViewStyle>;
};

export const NeonThreeCanvas: React.FC<NeonThreeCanvasProps> = ({ variant, palette, style }) => {
  const frame = useRef<number | null>(null);

  const onContextCreate = useCallback(
    async (gl: ExpoWebGLRenderingContext) => {
      const { drawingBufferWidth: width, drawingBufferHeight: height } = gl;
      const renderer = new Renderer({ gl, antialias: true });
      renderer.setSize(width, height);
      renderer.setClearColor(palette.background, 1);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(60, width / height, 0.01, 1000);
      camera.position.z = variant === 'tree' ? 7 : 5;

      const ambient = new THREE.AmbientLight(palette.accent, 0.8);
      scene.add(ambient);

      const point = new THREE.PointLight(palette.primary, 1.2);
      point.position.set(4, 6, 8);
      scene.add(point);

      if (variant === 'tree') {
        const group = new THREE.Group();
        const material = new THREE.LineBasicMaterial({ color: palette.text });
        const root = new THREE.Vector3(0, -2.5, 0);

        const buildBranch = (start: THREE.Vector3, depth: number) => {
          if (depth <= 0) return;
          const branches = 3;
          for (let i = 0; i < branches; i += 1) {
            const direction = new THREE.Vector3(
              (Math.random() - 0.5) * 1.4,
              Math.random() * 1.4 + 0.9,
              (Math.random() - 0.5) * 1.2
            );
            const end = start.clone().add(direction.multiplyScalar(1.4));
            const geometry = new THREE.BufferGeometry().setFromPoints([start, end]);
            const line = new THREE.Line(geometry, material);
            group.add(line);
            buildBranch(end, depth - 1);
          }
        };

        buildBranch(root, 4);
        scene.add(group);
      }

      if (variant === 'starmap' || variant === 'board') {
        const starGeometry = new THREE.BufferGeometry();
        const starCount = 500;
        const positions = new Float32Array(starCount * 3);
        for (let i = 0; i < starCount; i += 1) {
          positions[i * 3] = (Math.random() - 0.5) * 20;
          positions[i * 3 + 1] = (Math.random() - 0.5) * 12;
          positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
        }
        starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const starMaterial = new THREE.PointsMaterial({ color: palette.text, size: 0.12 });
        const stars = new THREE.Points(starGeometry, starMaterial);
        scene.add(stars);
      }

      if (variant === 'forest') {
        const group = new THREE.Group();
        for (let i = 0; i < 10; i += 1) {
          const radiusTop = 0.1 + Math.random() * 0.1;
          const radiusBottom = 0.25 + Math.random() * 0.12;
          const heightCylinder = 1.8 + Math.random() * 1.2;
          const geometry = new THREE.CylinderGeometry(radiusTop, radiusBottom, heightCylinder, 16);
          const material = new THREE.MeshStandardMaterial({ color: palette.accent, emissive: palette.accent, emissiveIntensity: 0.3 });
          const cylinder = new THREE.Mesh(geometry, material);
          cylinder.position.set((Math.random() - 0.5) * 4, heightCylinder / 2 - 2, (Math.random() - 0.5) * 4);
          group.add(cylinder);
        }
        scene.add(group);
      }

      if (variant === 'echo') {
        const notebookGeometry = new THREE.SphereGeometry(0.8, 24, 24);
        const notebookMaterial = new THREE.MeshStandardMaterial({ color: palette.text, emissive: palette.primary, emissiveIntensity: 0.2 });
        const notebook = new THREE.Mesh(notebookGeometry, notebookMaterial);
        scene.add(notebook);

        const verseGeometry = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(-1.4, -0.2, 0),
          new THREE.Vector3(1.4, 0.2, 0),
        ]);
        const verseMaterial = new THREE.LineBasicMaterial({ color: palette.primary });
        const verse = new THREE.Line(verseGeometry, verseMaterial);
        scene.add(verse);
      }

      const animate = () => {
        frame.current = requestAnimationFrame(animate);
        scene.rotation.y += 0.003;
        renderer.render(scene, camera);
        gl.endFrameEXP();
      };

      animate();
    },
    [palette, variant]
  );

  const handleLost = useCallback(() => {
    if (frame.current) {
      cancelAnimationFrame(frame.current);
      frame.current = null;
    }
  }, []);

  return <GLView style={[styles.canvas, style]} onContextCreate={onContextCreate} onContextLost={handleLost} />;
};

const styles = StyleSheet.create({
  canvas: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    height: 220,
  },
});
