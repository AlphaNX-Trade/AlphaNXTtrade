import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Upload,
  Camera,
  Trash2,
  Sparkles,
  Check,
  RotateCcw,
  Loader2,
  Image as ImageIcon,
  ShieldAlert,
  Lock,
} from 'lucide-react';
import { AvatarFrameType } from '@/types/avatar';
import { AVATAR_FRAMES, PRESET_AVATARS, compressAndCropImage } from '@/lib/avatarFrames';
import { calculateTraderLevel } from '@/lib/traderLevelSystem';
import { UserAvatar } from '@/components/common/UserAvatar';

interface AvatarUploaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAvatarUrl?: string;
  currentFrame?: AvatarFrameType;
  userName?: string;
  totalProfitLoss?: number;
  virtualBalance?: number;
  portfolioValue?: number;
  onSaveAvatar: (newAvatarUrl: string | null, newFrame: AvatarFrameType) => Promise<void>;
}

export const AvatarUploaderModal: React.FC<AvatarUploaderModalProps> = ({
  isOpen,
  onClose,
  currentAvatarUrl,
  currentFrame = 'none',
  userName = 'Trader',
  totalProfitLoss = 0,
  virtualBalance = 1000000,
  portfolioValue = 0,
  onSaveAvatar,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'camera' | 'presets' | 'frames'>('upload');
  const [selectedAvatarUrl, setSelectedAvatarUrl] = useState<string | null>(currentAvatarUrl || null);
  const [selectedFrame, setSelectedFrame] = useState<AvatarFrameType>(currentFrame);

  const levelData = calculateTraderLevel(totalProfitLoss, virtualBalance, portfolioValue);
  const unlockedFrames = levelData.unlockedFrames;

  const [saving, setSaving] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSelectedAvatarUrl(currentAvatarUrl || null);
      setSelectedFrame(currentFrame);
      setCameraError(null);
    } else {
      stopCamera();
    }
  }, [isOpen, currentAvatarUrl, currentFrame]);

  // Handle webcam stream start/stop
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported by your browser.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 640, facingMode: 'user' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err) {
      setCameraError(err instanceof Error ? err.message : 'Unable to access camera.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const takeCameraSnapshot = async () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = Math.min(video.videoWidth, video.videoHeight);
    const startX = (video.videoWidth - size) / 2;
    const startY = (video.videoHeight - size) / 2;

    ctx.drawImage(video, startX, startY, size, size, 0, 0, 400, 400);

    const dataUrl = canvas.toDataURL('image/webp', 0.85);
    setSelectedAvatarUrl(dataUrl);
    stopCamera();
    setActiveTab('upload');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      alert('Invalid file format. Please select a JPG, PNG, or WebP image.');
      return;
    }

    try {
      const compressedDataUrl = await compressAndCropImage(file, 350, 0.85);
      setSelectedAvatarUrl(compressedDataUrl);
    } catch (err) {
      alert('Failed to process image. Please try another file.');
    }
  };

  const handleRemoveAvatar = () => {
    setSelectedAvatarUrl(null);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSaveAvatar(selectedAvatarUrl, selectedFrame);
      stopCamera();
      onClose();
    } catch (err) {
      console.error('Failed to save avatar:', err);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-card border border-border/80 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="px-5 py-4 border-b border-border/80 flex items-center justify-between bg-card/90">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <h2 className="font-bold text-base text-foreground">Avatar & Profile Frame</h2>
            </div>
            <button
              onClick={() => {
                stopCamera();
                onClose();
              }}
              className="p-1.5 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-5 overflow-y-auto space-y-5 flex-1">
            {/* Live Preview Stage */}
            <div className="bg-secondary/20 border border-border/60 rounded-2xl p-6 flex flex-col items-center justify-center space-y-3 relative overflow-hidden">
              <UserAvatar
                src={selectedAvatarUrl}
                name={userName}
                frame={selectedFrame}
                size="2xl"
                showBadge
              />

              <div className="text-center space-y-1">
                <p className="font-bold text-sm text-foreground">{userName}</p>
                <p className="text-xs font-mono text-muted-foreground">
                  Frame: <span className="text-primary font-bold">{AVATAR_FRAMES.find((f) => f.id === selectedFrame)?.name}</span>
                </p>
              </div>

              {selectedAvatarUrl && (
                <button
                  onClick={handleRemoveAvatar}
                  className="absolute top-3 right-3 text-xs font-mono text-destructive hover:bg-destructive/10 px-2.5 py-1 rounded-lg border border-destructive/20 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove Avatar</span>
                </button>
              )}
            </div>

            {/* Sub-tabs Navigation */}
            <div className="grid grid-cols-4 gap-1 p-1 bg-secondary/40 border border-border/60 rounded-2xl font-mono text-xs">
              {[
                { id: 'upload', label: 'Upload', icon: Upload },
                { id: 'camera', label: 'Camera', icon: Camera },
                { id: 'presets', label: 'Presets', icon: ImageIcon },
                { id: 'frames', label: 'Frames', icon: Sparkles },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      if (tab.id === 'camera') startCamera();
                      else stopCamera();
                      setActiveTab(tab.id as any);
                    }}
                    className={`py-2 px-2 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      isActive
                        ? 'bg-primary text-primary-foreground shadow'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Tab 1: Upload */}
            {activeTab === 'upload' && (
              <div className="space-y-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-border hover:border-primary/60 bg-card hover:bg-secondary/30 rounded-2xl p-8 text-center cursor-pointer transition-all space-y-2 group"
                >
                  <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-foreground">Click to upload photo</p>
                    <p className="text-xs text-muted-foreground">JPG, PNG, or WebP up to 10MB</p>
                  </div>
                  <p className="text-[10px] font-mono text-primary/80">Auto-cropped & compressed for performance</p>
                </div>
              </div>
            )}

            {/* Tab 2: Camera */}
            {activeTab === 'camera' && (
              <div className="space-y-3 text-center">
                {cameraError ? (
                  <div className="bg-destructive/10 border border-destructive/30 p-4 rounded-2xl text-xs text-destructive flex items-center gap-2 justify-center">
                    <ShieldAlert className="w-4 h-4 shrink-0" />
                    <span>{cameraError}</span>
                  </div>
                ) : (
                  <div className="relative rounded-2xl overflow-hidden bg-black aspect-square max-w-[280px] mx-auto border border-border">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full h-full object-cover transform -scale-x-100"
                    />
                    {!cameraActive && (
                      <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-center gap-2">
                  <button
                    type="button"
                    onClick={takeCameraSnapshot}
                    disabled={!cameraActive}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 px-5 py-2.5 rounded-xl font-mono text-xs font-bold transition-all shadow flex items-center gap-2 cursor-pointer disabled:opacity-40"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Snap Photo</span>
                  </button>
                  <button
                    type="button"
                    onClick={startCamera}
                    className="p-2.5 rounded-xl border border-border text-muted-foreground hover:text-foreground cursor-pointer"
                    title="Restart Camera"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Tab 3: Presets */}
            {activeTab === 'presets' && (
              <div className="space-y-2">
                <p className="text-xs font-mono text-muted-foreground">Select a futuristic trader avatar preset:</p>
                <div className="grid grid-cols-3 gap-3">
                  {PRESET_AVATARS.map((preset) => {
                    const isSelected = selectedAvatarUrl === preset.dataUrl;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => setSelectedAvatarUrl(preset.dataUrl)}
                        className={`p-2 rounded-2xl border transition-all flex flex-col items-center gap-2 cursor-pointer ${
                          isSelected
                            ? 'border-primary bg-primary/10 ring-2 ring-primary/40'
                            : 'border-border/80 bg-card hover:bg-secondary/40'
                        }`}
                      >
                        <img src={preset.dataUrl} alt={preset.name} className="w-14 h-14 rounded-full object-cover" />
                        <span className="text-[11px] font-mono text-foreground font-semibold truncate w-full text-center">
                          {preset.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tab 4: Animated Frames */}
            {activeTab === 'frames' && (
              <div className="space-y-3">
                <p className="text-xs font-mono text-muted-foreground flex items-center justify-between">
                  <span>Pick a profile frame unlocked via Trader Level:</span>
                  <span className="text-primary font-bold">{levelData.currentTier.title} (L{levelData.currentTier.level})</span>
                </p>
                <div className="grid grid-cols-2 gap-3 max-h-[220px] overflow-y-auto pr-1">
                  {AVATAR_FRAMES.map((f) => {
                    const isSelected = selectedFrame === f.id;
                    const isUnlocked = f.unlockedByDefault || unlockedFrames.includes(f.id);

                    return (
                      <button
                        key={f.id}
                        type="button"
                        disabled={!isUnlocked}
                        onClick={() => isUnlocked && setSelectedFrame(f.id)}
                        className={`p-3 rounded-2xl border transition-all flex items-center gap-3 text-left relative ${
                          !isUnlocked
                            ? 'opacity-50 border-border bg-secondary/20 cursor-not-allowed'
                            : isSelected
                            ? 'border-primary bg-primary/10 ring-2 ring-primary/40 cursor-pointer'
                            : 'border-border/80 bg-card hover:bg-secondary/40 cursor-pointer'
                        }`}
                      >
                        <UserAvatar src={selectedAvatarUrl} name={userName} frame={f.id} size="sm" />
                        <div className="space-y-0.5 overflow-hidden flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <p className="font-bold text-xs text-foreground truncate">{f.name}</p>
                            {!isUnlocked && <Lock className="w-3 h-3 text-amber-400 shrink-0" />}
                          </div>
                          <p className="text-[10px] text-muted-foreground truncate">
                            {isUnlocked ? f.description : 'Locked — Earn P&L to level up'}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t border-border/80 bg-card/90 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                stopCamera();
                onClose();
              }}
              className="px-4 py-2.5 rounded-xl border border-border text-xs font-mono text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-2.5 rounded-xl text-xs font-mono font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              <span>Save Avatar</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
