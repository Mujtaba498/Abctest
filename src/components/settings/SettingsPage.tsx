'use client';

import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Switch } from '../ui/switch';
import { Textarea } from '../ui/textarea';
import { useRouter } from 'next/navigation';
import { api } from '../../lib/api';

interface SiteSettings {
  siteName: string;
  siteDescription: string;
  siteUrl: string;
  logoUrl: string;
  faviconUrl: string;
  enableRegistration: boolean;
  defaultUserRole: string;
  postsPerPage: number;
  dateFormat: string;
  timeFormat: string;
  emailNotifications: boolean;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPassword: string;
  smtpFromEmail: string;
  smtpFromName: string;
  customCss: string;
  customJs: string;
  googleAnalyticsId: string;
  recaptchaSiteKey: string;
  recaptchaSecretKey: string;
  contactEmail: string;
  defaultMetaTitle: string;
  defaultMetaDescription: string;
  defaultMetaKeywords: string;
  facebookUrl: string;
  twitterUrl: string;
  linkedinUrl: string;
  instagramUrl: string;
  googleTagManagerId: string;
  facebookPixelId: string;
}

export function SettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('general');
  const token = localStorage.getItem('crm_token');
  
  // Load settings on component mount
  useEffect(() => {
    const loadSettings = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const data = await api.get('/settings', token || undefined);
        setSettings(data);
      } catch (err) {
        setError('Failed to load settings');
        console.error('Error loading settings:', err);
      } finally {
        setLoading(false);
      }
    };
    
    loadSettings();
  }, [token]);
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    
    setSaving(true);
    setError(null);
    
    try {
      await api.put('/settings', settings, token || undefined);
      // Show success message or notification
    } catch (err) {
      setError('Failed to save settings');
      console.error('Error saving settings:', err);
    } finally {
      setSaving(false);
    }
  };
  
  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!settings) return;
    const { name, value } = e.target;
    setSettings({
      ...settings,
      [name]: value,
    });
  };

  // Handle select changes
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!settings) return;
    const { name, value } = e.target;
    setSettings({
      ...settings,
      [name]: value,
    });
  };
  
  // Handle switch changes
  const handleSwitchChange = (name: string, checked: boolean) => {
    if (!settings) return;
    setSettings({
      ...settings,
      [name]: checked,
    });
  };
  
  // Handle number input changes
  const handleNumberChange = (name: string, value: string) => {
    if (!settings) return;
    
    setSettings({
      ...settings,
      [name]: parseInt(value, 10) || 0,
    });
  };
  
  if (loading) {
    return <div className="flex justify-center p-8">Loading settings...</div>;
  }
  
  if (!settings) {
    return <div className="p-4 text-red-500 bg-red-50 rounded-md">Failed to load settings</div>;
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Paramètres du Site</CardTitle>
          <CardDescription>
            Gérez les paramètres généraux de votre site web
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="p-3 mb-4 text-sm text-red-500 bg-red-50 rounded-md">
              {error}
            </div>
          )}
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="general">Général</TabsTrigger>
              <TabsTrigger value="seo">SEO</TabsTrigger>
              <TabsTrigger value="social">Réseaux Sociaux</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="security">Sécurité</TabsTrigger>
            </TabsList>
            
            <TabsContent value="general" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="siteName">Nom du Site</Label>
                <Input
                  id="siteName"
                  name="siteName"
                  value={settings.siteName}
                  onChange={handleChange}
                  placeholder="Nom de votre site web"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="siteDescription">Description du Site</Label>
                <Textarea
                  id="siteDescription"
                  name="siteDescription"
                  value={settings.siteDescription}
                  onChange={handleChange}
                  placeholder="Description de votre site web"
                  className="min-h-[100px]"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="siteUrl">URL du Site</Label>
                <Input
                  id="siteUrl"
                  name="siteUrl"
                  value={settings.siteUrl}
                  onChange={handleChange}
                  placeholder="https://votre-site.com"
                  type="url"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="logoUrl">Logo URL</Label>
                <Input
                  id="logoUrl"
                  name="logoUrl"
                  value={settings.logoUrl}
                  onChange={handleChange}
                  placeholder="/logo.png"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="faviconUrl">Favicon URL</Label>
                <Input
                  id="faviconUrl"
                  name="faviconUrl"
                  value={settings.faviconUrl}
                  onChange={handleChange}
                  placeholder="/favicon.ico"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="postsPerPage">Posts Per Page</Label>
                <Input
                  id="postsPerPage"
                  name="postsPerPage"
                  type="number"
                  min="1"
                  max="100"
                  value={settings.postsPerPage}
                  onChange={(e) => handleNumberChange('postsPerPage', e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="dateFormat">Date Format</Label>
                <Input
                  id="dateFormat"
                  name="dateFormat"
                  value={settings.dateFormat}
                  onChange={handleChange}
                  placeholder="MMMM d, yyyy"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="timeFormat">Time Format</Label>
                <Input
                  id="timeFormat"
                  name="timeFormat"
                  value={settings.timeFormat}
                  onChange={handleChange}
                  placeholder="h:mm a"
                  required
                />
              </div>
            </TabsContent>
            
            <TabsContent value="seo" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="defaultMetaTitle">Titre Meta par Défaut</Label>
                <Input
                  id="defaultMetaTitle"
                  name="defaultMetaTitle"
                  value={settings.defaultMetaTitle}
                  onChange={handleChange}
                  placeholder="Titre meta par défaut pour votre site"
                  maxLength={60}
                />
                <p className="text-xs text-gray-500">{settings.defaultMetaTitle.length}/60 caractères</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="defaultMetaDescription">Description Meta par Défaut</Label>
                <Textarea
                  id="defaultMetaDescription"
                  name="defaultMetaDescription"
                  value={settings.defaultMetaDescription}
                  onChange={handleChange}
                  placeholder="Description meta par défaut pour votre site"
                  maxLength={160}
                  className="min-h-[100px]"
                />
                <p className="text-xs text-gray-500">{settings.defaultMetaDescription.length}/160 caractères</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="defaultMetaKeywords">Mots-clés Meta par Défaut</Label>
                <Input
                  id="defaultMetaKeywords"
                  name="defaultMetaKeywords"
                  value={settings.defaultMetaKeywords}
                  onChange={handleChange}
                  placeholder="mots-clés, séparés, par, des, virgules"
                />
              </div>
            </TabsContent>
            
            <TabsContent value="social" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="facebookUrl">URL Facebook</Label>
                <Input
                  id="facebookUrl"
                  name="facebookUrl"
                  value={settings.facebookUrl}
                  onChange={handleChange}
                  placeholder="https://facebook.com/votre-page"
                  type="url"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="twitterUrl">URL Twitter</Label>
                <Input
                  id="twitterUrl"
                  name="twitterUrl"
                  value={settings.twitterUrl}
                  onChange={handleChange}
                  placeholder="https://twitter.com/votre-compte"
                  type="url"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="linkedinUrl">URL LinkedIn</Label>
                <Input
                  id="linkedinUrl"
                  name="linkedinUrl"
                  value={settings.linkedinUrl}
                  onChange={handleChange}
                  placeholder="https://linkedin.com/company/votre-entreprise"
                  type="url"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="instagramUrl">URL Instagram</Label>
                <Input
                  id="instagramUrl"
                  name="instagramUrl"
                  value={settings.instagramUrl}
                  onChange={handleChange}
                  placeholder="https://instagram.com/votre-compte"
                  type="url"
                />
              </div>
            </TabsContent>
            
            <TabsContent value="analytics" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="googleAnalyticsId">ID Google Analytics</Label>
                <Input
                  id="googleAnalyticsId"
                  name="googleAnalyticsId"
                  value={settings.googleAnalyticsId}
                  onChange={handleChange}
                  placeholder="G-XXXXXXXXXX"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="googleTagManagerId">ID Google Tag Manager</Label>
                <Input
                  id="googleTagManagerId"
                  name="googleTagManagerId"
                  value={settings.googleTagManagerId}
                  onChange={handleChange}
                  placeholder="GTM-XXXXXXX"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="facebookPixelId">ID Facebook Pixel</Label>
                <Input
                  id="facebookPixelId"
                  name="facebookPixelId"
                  value={settings.facebookPixelId}
                  onChange={handleChange}
                  placeholder="123456789012345"
                />
              </div>
            </TabsContent>
            
            <TabsContent value="security" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="recaptchaSiteKey">Clé de Site reCAPTCHA</Label>
                <Input
                  id="recaptchaSiteKey"
                  name="recaptchaSiteKey"
                  value={settings.recaptchaSiteKey}
                  onChange={handleChange}
                  placeholder="6LdXXXXXXXXXXXXXXXXXXXX"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="recaptchaSecretKey">Clé Secrète reCAPTCHA</Label>
                <Input
                  id="recaptchaSecretKey"
                  name="recaptchaSecretKey"
                  value={settings.recaptchaSecretKey}
                  onChange={handleChange}
                  placeholder="6LdXXXXXXXXXXXXXXXXXXXX"
                />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => router.push('/dashboard')}
          >
            Annuler
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? 'Sauvegarde...' : 'Sauvegarder les Paramètres'}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
