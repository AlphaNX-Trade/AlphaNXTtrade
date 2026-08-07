import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import {
  ChevronLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  Globe,
  Briefcase,
  TrendingUp,
  PieChart,
  Camera,
  Shield,
  Layers,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import { updateUserFullName, updateUsername, updateUserSocialProfile } from '@/lib/userService';
import { UserAvatar } from '@/components/common/UserAvatar';
import { AvatarUploaderModal } from '@/components/profile/AvatarUploaderModal';
import { TraderLevelCard } from '@/components/profile/TraderLevelCard';
import { AvatarFrameType } from '@/types/avatar';
import { AVATAR_FRAMES } from '@/lib/avatarFrames';

export default function EditProfilePage() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { profile, profileLoading } = useUserProfile();

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarFrame, setAvatarFrame] = useState<AvatarFrameType>('none');
  const [bio, setBio] = useState('');
  const [country, setCountry] = useState('India');
  const [city, setCity] = useState('');
  const [tradingExperience, setTradingExperience] = useState('Intermediate');
  const [favouriteMarket, setFavouriteMarket] = useState('Indian Equities');
  const [favouriteSector, setFavouriteSector] = useState('AI & Tech');
  const [avatarVisibility, setAvatarVisibility] = useState<'public' | 'followers' | 'private'>('public');
  const [isPortfolioPublic, setIsPortfolioPublic] = useState(true);

  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      if (profile.fullName) setFullName(profile.fullName);
      setUsername(profile.username ?? '');
      setAvatarUrl(profile.avatarUrl ?? null);
      setAvatarFrame((profile.avatarFrame as AvatarFrameType) ?? 'none');
      setBio(profile.bio ?? '');
      setCountry(profile.country ?? 'India');
      setCity(profile.city ?? '');
      setTradingExperience(profile.tradingExperience ?? 'Intermediate');
      setFavouriteMarket(profile.favouriteMarket ?? 'Indian Equities');
      setFavouriteSector(profile.favouriteSector ?? 'AI & Tech');
      setAvatarVisibility(profile.avatarVisibility ?? 'public');
      setIsPortfolioPublic(profile.isPortfolioPublic ?? true);
    }
  }, [profile]);

  const nameChanged = profile ? fullName.trim() !== profile.fullName && fullName.trim().length > 0 : false;
  const usernameChanged = profile ? username.trim() !== (profile.username ?? '') : false;
  const avatarChanged = profile ? avatarUrl !== (profile.avatarUrl ?? null) : false;
  const frameChanged = profile ? avatarFrame !== (profile.avatarFrame ?? 'none') : false;
  const bioChanged = profile ? bio.trim() !== (profile.bio ?? '') : false;
  const countryChanged = profile ? country.trim() !== (profile.country ?? 'India') : false;
  const cityChanged = profile ? city.trim() !== (profile.city ?? '') : false;
  const expChanged = profile ? tradingExperience !== (profile.tradingExperience ?? 'Intermediate') : false;
  const mktChanged = profile ? favouriteMarket !== (profile.favouriteMarket ?? 'Indian Equities') : false;
  const secChanged = profile ? favouriteSector !== (profile.favouriteSector ?? 'AI & Tech') : false;
  const visChanged = profile ? avatarVisibility !== (profile.avatarVisibility ?? 'public') : false;
  const privacyChanged = profile ? isPortfolioPublic !== (profile.isPortfolioPublic ?? true) : false;

  const hasChanges =
    nameChanged ||
    usernameChanged ||
    avatarChanged ||
    frameChanged ||
    bioChanged ||
    countryChanged ||
    cityChanged ||
    expChanged ||
    mktChanged ||
    secChanged ||
    visChanged ||
    privacyChanged;

  const handleSaveModalAvatar = async (newUrl: string | null, newFrame: AvatarFrameType) => {
    setAvatarUrl(newUrl);
    setAvatarFrame(newFrame);
  };

  const handleSaveAll = async () => {
    if (!user || !hasChanges) return;
    setSaving(true);
    setError(null);
    try {
      if (nameChanged) await updateUserFullName(user.uid, fullName);
      if (usernameChanged) await updateUsername(user.uid, username);

      await updateUserSocialProfile(user.uid, {
        avatarUrl: avatarUrl,
        avatarFrame: avatarFrame,
        bio: bio.trim(),
        country: country.trim(),
        city: city.trim(),
        tradingExperience: tradingExperience,
        favouriteMarket: favouriteMarket,
        favouriteSector: favouriteSector,
        avatarVisibility: avatarVisibility,
        isPortfolioPublic: isPortfolioPublic,
      });

      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile changes.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col max-w-2xl mx-auto pb-12 font-sans">
      {/* Header */}
      <header className="sticky top-0 bg-background/95 backdrop-blur-xl border-b border-border h-16 flex items-center justify-between px-4 z-40">
        <button
          onClick={() => setLocation('/profile')}
          className="text-muted-foreground hover:text-foreground transition-colors p-2 rounded-xl hover:bg-secondary/50 cursor-pointer"
          aria-label="Back to profile"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="font-bold text-base text-foreground">Edit Profile & Customization</span>
        <div className="w-8" aria-hidden />
      </header>

      <main className="flex-1 px-4 py-6 space-y-6">
        {profileLoading ? (
          <div className="space-y-4">
            <div className="h-32 bg-card border border-border rounded-3xl animate-pulse" />
            <div className="h-20 bg-card border border-border rounded-3xl animate-pulse" />
          </div>
        ) : (
          <>
            {/* Top Avatar Customization Card */}
            <div className="bg-card border border-border/80 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
              <div className="flex items-center gap-5">
                <div className="relative group cursor-pointer" onClick={() => setShowAvatarModal(true)}>
                  <UserAvatar
                    src={avatarUrl}
                    name={fullName || profile?.fullName}
                    frame={avatarFrame}
                    size="xl"
                    showBadge
                  />
                  <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                    <Camera className="w-6 h-6" />
                  </div>
                </div>

                <div className="space-y-1 text-center sm:text-left">
                  <h3 className="font-bold text-lg text-foreground">{fullName || 'Trader'}</h3>
                  <p className="text-xs font-mono text-muted-foreground">
                    Frame: <span className="text-primary font-bold">{AVATAR_FRAMES.find((f) => f.id === avatarFrame)?.name}</span>
                  </p>
                  <p className="text-[11px] text-muted-foreground">Tap avatar to upload photo, snap picture, or change frame</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowAvatarModal(true)}
                className="bg-primary text-primary-foreground hover:bg-primary/90 px-5 py-2.5 rounded-2xl text-xs font-mono font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer shrink-0"
              >
                <Sparkles className="w-4 h-4" />
                <span>Customize Avatar & Frame</span>
              </button>
            </div>

            {/* Trader Level Card */}
            <TraderLevelCard
              totalProfitLoss={profile?.totalProfitLoss || 0}
              virtualBalance={profile?.virtualBalance || 1000000}
              portfolioValue={profile?.portfolioValue || 0}
              compact
            />

            {/* Basic Info Section */}
            <div className="bg-card border border-border/80 rounded-3xl p-5 space-y-4">
              <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                <span>Public Identity</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-muted-foreground">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your name"
                    className="w-full bg-secondary/40 border border-border rounded-2xl px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-muted-foreground">Username (@handle)</label>
                  <div className="flex items-center bg-secondary/40 border border-border rounded-2xl px-3.5">
                    <span className="text-muted-foreground font-mono text-sm pr-1">@</span>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.replace(/\s/g, ''))}
                      placeholder="handle"
                      className="w-full bg-transparent py-2.5 text-sm text-foreground focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-muted-foreground">Trading Bio / Market Philosophy</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  placeholder="Day trader specializing in options momentum & macro tech setups..."
                  className="w-full bg-secondary/40 border border-border rounded-2xl p-3.5 text-xs text-foreground focus:outline-none focus:border-primary resize-none"
                />
              </div>
            </div>

            {/* Location & Trading Preferences */}
            <div className="bg-card border border-border/80 rounded-3xl p-5 space-y-4">
              <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Globe className="w-4 h-4 text-cyan-400" />
                <span>Location & Trading Profile</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-muted-foreground">Country</label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="e.g. India, USA, Singapore"
                    className="w-full bg-secondary/40 border border-border rounded-2xl px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-muted-foreground">City (Optional)</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Mumbai, Bengaluru, New York"
                    className="w-full bg-secondary/40 border border-border rounded-2xl px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-muted-foreground flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5 text-primary" />
                    <span>Trading Experience</span>
                  </label>
                  <select
                    value={tradingExperience}
                    onChange={(e) => setTradingExperience(e.target.value)}
                    className="w-full bg-secondary/40 border border-border rounded-2xl px-3.5 py-2.5 text-xs font-mono text-foreground focus:outline-none focus:border-primary cursor-pointer"
                  >
                    <option value="Novice">Novice (&lt; 1 Year)</option>
                    <option value="Intermediate">Intermediate (1-3 Years)</option>
                    <option value="3-5 Years">3-5 Years Trader</option>
                    <option value="5+ Years Veteran">5+ Years Veteran</option>
                    <option value="Market Wizard">Market Wizard Pro</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-muted-foreground flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Favourite Market</span>
                  </label>
                  <select
                    value={favouriteMarket}
                    onChange={(e) => setFavouriteMarket(e.target.value)}
                    className="w-full bg-secondary/40 border border-border rounded-2xl px-3.5 py-2.5 text-xs font-mono text-foreground focus:outline-none focus:border-primary cursor-pointer"
                  >
                    <option value="Indian Equities">Indian Equities (NSE/BSE)</option>
                    <option value="Crypto">Crypto & Web3</option>
                    <option value="US Stocks">US Stocks & Tech</option>
                    <option value="Forex">Forex Markets</option>
                    <option value="Options & Futures">Options & Derivatives</option>
                  </select>
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-mono text-muted-foreground flex items-center gap-1">
                    <PieChart className="w-3.5 h-3.5 text-purple-400" />
                    <span>Favourite Sector</span>
                  </label>
                  <select
                    value={favouriteSector}
                    onChange={(e) => setFavouriteSector(e.target.value)}
                    className="w-full bg-secondary/40 border border-border rounded-2xl px-3.5 py-2.5 text-xs font-mono text-foreground focus:outline-none focus:border-primary cursor-pointer"
                  >
                    <option value="AI & Tech">AI & Semiconductors</option>
                    <option value="Banking & Finance">Banking & Financial Services</option>
                    <option value="DeFi & Web3">DeFi & Crypto Infrastructure</option>
                    <option value="Clean Energy">Clean Energy & EV Technology</option>
                    <option value="Biotech">Pharma & Biotech</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Privacy Controls */}
            <div className="bg-card border border-border/80 rounded-3xl p-5 space-y-4">
              <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-400" />
                <span>Privacy & Display Settings</span>
              </h4>

              <div className="flex items-center justify-between p-3.5 bg-secondary/30 rounded-2xl border border-border/60">
                <div className="space-y-0.5 max-w-[280px]">
                  <div className="flex items-center gap-1.5 font-bold text-sm text-foreground">
                    {isPortfolioPublic ? <Eye className="w-4 h-4 text-emerald-400" /> : <EyeOff className="w-4 h-4 text-amber-400" />}
                    <span>Public Portfolio Metrics</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Allow community members to view your portfolio return % on leaderboards & public profile.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsPortfolioPublic(!isPortfolioPublic)}
                  className={`w-12 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                    isPortfolioPublic ? 'bg-primary' : 'bg-secondary'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      isPortfolioPublic ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2.5 bg-destructive/10 border border-destructive/30 text-destructive rounded-2xl px-4 py-3 text-xs">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            {saved && (
              <div className="flex items-center gap-2.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-2xl px-4 py-3 text-xs font-mono">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <p>Profile customized successfully!</p>
              </div>
            )}

            <button
              onClick={handleSaveAll}
              disabled={!hasChanges || saving}
              className="w-full h-12 rounded-2xl font-mono font-bold text-sm bg-primary text-primary-foreground flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/90 transition-all shadow-lg cursor-pointer"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Profile Changes'}
            </button>
          </>
        )}
      </main>

      {/* Avatar Customization Modal */}
      <AvatarUploaderModal
        isOpen={showAvatarModal}
        onClose={() => setShowAvatarModal(false)}
        currentAvatarUrl={avatarUrl || undefined}
        currentFrame={avatarFrame}
        userName={fullName || profile?.fullName}
        totalProfitLoss={profile?.totalProfitLoss || 0}
        virtualBalance={profile?.virtualBalance || 1000000}
        portfolioValue={profile?.portfolioValue || 0}
        onSaveAvatar={handleSaveModalAvatar}
      />
    </div>
  );
}
