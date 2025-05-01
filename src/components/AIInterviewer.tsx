
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface AIInterviewerProps {
  isAsking: boolean;
  currentQuestion: string;
  onQuestionComplete?: () => void;
}

const AIInterviewer: React.FC<AIInterviewerProps> = ({ 
  isAsking, 
  currentQuestion,
  onQuestionComplete 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const headModelRef = useRef<THREE.Mesh | null>(null);
  const mouthModelRef = useRef<THREE.Mesh | null>(null);
  const animationFrameId = useRef<number | null>(null);
  const [speaking, setSpeaking] = useState(false);

  // Initialize 3D scene
  useEffect(() => {
    if (!containerRef.current) return;

    // Setup Three.js scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x333366);
    sceneRef.current = scene;

    // Setup camera
    const camera = new THREE.PerspectiveCamera(
      50,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 5;
    cameraRef.current = camera;

    // Setup renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(0, 1, 1);
    scene.add(directionalLight);

    // Create a simple head model
    const headGeometry = new THREE.SphereGeometry(1.2, 32, 32);
    const headMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xf1c27d,
      roughness: 0.8,
      metalness: 0.2
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    scene.add(head);
    headModelRef.current = head;

    // Create eyes
    const eyeGeometry = new THREE.SphereGeometry(0.15, 16, 16);
    const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
    
    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.4, 0.3, 1.1);
    head.add(leftEye);
    
    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(0.4, 0.3, 1.1);
    head.add(rightEye);

    // Create eyebrows
    const eyebrowGeometry = new THREE.BoxGeometry(0.3, 0.05, 0.1);
    const eyebrowMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
    
    const leftEyebrow = new THREE.Mesh(eyebrowGeometry, eyebrowMaterial);
    leftEyebrow.position.set(-0.4, 0.5, 1.1);
    head.add(leftEyebrow);
    
    const rightEyebrow = new THREE.Mesh(eyebrowGeometry, eyebrowMaterial);
    rightEyebrow.position.set(0.4, 0.5, 1.1);
    head.add(rightEyebrow);

    // Create a mouth
    const mouthGeometry = new THREE.BoxGeometry(0.5, 0.1, 0.1);
    const mouthMaterial = new THREE.MeshStandardMaterial({ color: 0x990000 });
    const mouth = new THREE.Mesh(mouthGeometry, mouthMaterial);
    mouth.position.set(0, -0.3, 1.1);
    head.add(mouth);
    mouthModelRef.current = mouth;

    // Create a nose
    const noseGeometry = new THREE.ConeGeometry(0.1, 0.3, 32);
    const noseMaterial = new THREE.MeshStandardMaterial({ color: 0xf1c27d });
    const nose = new THREE.Mesh(noseGeometry, noseMaterial);
    nose.rotation.x = Math.PI / 2;
    nose.position.set(0, 0, 1.2);
    head.add(nose);

    const animate = () => {
      if (!sceneRef.current || !rendererRef.current || !cameraRef.current) return;
      
      // Slow subtle head movement to seem more lifelike
      if (headModelRef.current) {
        headModelRef.current.rotation.y = Math.sin(Date.now() * 0.001) * 0.1;
        headModelRef.current.rotation.x = Math.sin(Date.now() * 0.0015) * 0.05;
      }
      
      // Mouth animation when speaking
      if (mouthModelRef.current && speaking) {
        mouthModelRef.current.scale.y = 1 + Math.sin(Date.now() * 0.01) * 0.5;
      }

      rendererRef.current.render(sceneRef.current, cameraRef.current);
      animationFrameId.current = requestAnimationFrame(animate);
    };
    
    animate();
    setIsLoaded(true);

    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
      
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      
      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      
      rendererRef.current.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
    };
  }, []);

  // Simulate speech when a new question is asked
  useEffect(() => {
    if (isAsking && currentQuestion) {
      setSpeaking(true);
      
      // Simulate the duration of speech based on the length of the question
      const speakingDuration = currentQuestion.length * 50; // ~50ms per character
      
      const timer = setTimeout(() => {
        setSpeaking(false);
        if (onQuestionComplete) onQuestionComplete();
      }, speakingDuration);
      
      return () => clearTimeout(timer);
    }
  }, [isAsking, currentQuestion, onQuestionComplete]);

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full bg-gray-800 rounded-lg overflow-hidden"
      style={{ minHeight: '360px' }}
    >
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center text-white">
          Loading AI Interviewer...
        </div>
      )}
      {isAsking && currentQuestion && (
        <div className="absolute bottom-4 left-0 right-0 mx-auto w-5/6 bg-black/70 text-white p-3 rounded-lg text-center">
          <p className="text-sm">{currentQuestion}</p>
        </div>
      )}
    </div>
  );
};

export default AIInterviewer;
