import React, { useCallback, useRef } from 'react';
import { StyleSheet } from 'react-native';
import { GLView, ExpoWebGLRenderingContext } from 'expo-gl';
import { Renderer } from 'expo-three';
import * as THREE from 'three';

const defaultColor = '#FF4500';
const defaultAccent = '#FFD700';

type NeonSphereProps = {
  size?: number;
  color?: string;
  accent?: string;
};

export const NeonSphere: React.FC<NeonSphereProps> = ({ size = 50, color = defaultColor, accent = defaultAccent }) => {
  const frame = useRef<number | null>(null);

  const onContextCreate = useCallback(
    async (gl: ExpoWebGLRenderingContext) => {
      const { drawingBufferWidth: width, drawingBufferHeight: height } = gl;
      const renderer = new Renderer({ gl });
      renderer.setSize(width, height);
      renderer.setClearColor('#000000', 0);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
      camera.position.z = 2.5;

      const ambient = new THREE.AmbientLight(accent, 0.6);
      scene.add(ambient);

      const point = new THREE.PointLight(accent, 1.2);
      point.position.set(2, 3, 4);
      scene.add(point);

      const geometry = new THREE.SphereGeometry(0.9, 32, 32);
      const material = new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.4,
        metalness: 0.6,
        roughness: 0.2,
      });
      const sphere = new THREE.Mesh(geometry, material);
      scene.add(sphere);

      const ringGeometry = new THREE.TorusGeometry(1.2, 0.06, 16, 60);
      const ringMaterial = new THREE.MeshBasicMaterial({ color: accent });
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.rotation.x = Math.PI / 3;
      scene.add(ring);

      const animate = () => {
        frame.current = requestAnimationFrame(animate);
        sphere.rotation.y += 0.01;
        ring.rotation.z += 0.008;
        renderer.render(scene, camera);
        gl.endFrameEXP();
      };

      animate();
    },
    [accent, color]
  );

  const handleUnmount = useCallback(() => {
    if (frame.current) {
      cancelAnimationFrame(frame.current);
      frame.current = null;
    }
  }, []);

  return <GLView style={[styles.canvas, { width: size, height: size }]} onContextCreate={onContextCreate} onContextLost={handleUnmount} />;
};

const styles = StyleSheet.create({
  canvas: {
    borderRadius: 25,
    overflow: 'hidden',
  },
});
