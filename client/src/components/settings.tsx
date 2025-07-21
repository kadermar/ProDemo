import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Settings as SettingsIcon, 
  Save, 
  RefreshCw, 
  Download, 
  Upload, 
  Database,
  MessageSquare,
  FileText,
  User,
  Bell,
  Palette,
  Shield,
  Globe,
  Trash2
} from "lucide-react";

interface SettingsProps {
  onClose?: () => void;
}

export function Settings({ onClose }: SettingsProps) {
  const { toast } = useToast();
  
  // UI Settings
  const [darkMode, setDarkMode] = useState(false);
  const [compactMode, setCompactMode] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [showTimestamps, setShowTimestamps] = useState(false);
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  
  // Chat Settings
  const [maxMessages, setMaxMessages] = useState("100");
  const [autoSuggestPrompts, setAutoSuggestPrompts] = useState(true);
  const [messageWordLimit, setMessageWordLimit] = useState("500");
  const [enableFileUpload, setEnableFileUpload] = useState(true);
  const [autoProcessUploads, setAutoProcessUploads] = useState(true);
  
  // Data Settings
  const [cacheDocuments, setCacheDocuments] = useState(true);
  const [enableLogging, setEnableLogging] = useState(true);
  const [logLevel, setLogLevel] = useState("info");
  const [dataRetention, setDataRetention] = useState("30");
  
  // AI Settings
  const [aiModel, setAiModel] = useState("gpt-3.5-turbo");
  const [responseLength, setResponseLength] = useState("medium");
  const [includeSourceCitations, setIncludeSourceCitations] = useState(true);
  const [prioritizeProductData, setPriorizeProductData] = useState(true);
  
  // System Settings
  const [enableNotifications, setEnableNotifications] = useState(true);
  const [autoBackup, setAutoBackup] = useState(false);
  const [enableAnalytics, setEnableAnalytics] = useState(true);

  const handleSaveSettings = async () => {
    try {
      const settings = {
        ui: {
          darkMode,
          compactMode,
          autoScroll,
          showTimestamps,
          animationsEnabled
        },
        chat: {
          maxMessages: parseInt(maxMessages),
          autoSuggestPrompts,
          messageWordLimit: parseInt(messageWordLimit),
          enableFileUpload,
          autoProcessUploads
        },
        data: {
          cacheDocuments,
          enableLogging,
          logLevel,
          dataRetention: parseInt(dataRetention)
        },
        ai: {
          aiModel,
          responseLength,
          includeSourceCitations,
          prioritizeProductData
        },
        system: {
          enableNotifications,
          autoBackup,
          enableAnalytics
        }
      };

      // Save to localStorage for now (can be extended to API call)
      localStorage.setItem('app-settings', JSON.stringify(settings));
      
      toast({
        title: "Settings Saved",
        description: "Your preferences have been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleResetSettings = () => {
    // Reset to defaults
    setDarkMode(false);
    setCompactMode(false);
    setAutoScroll(true);
    setShowTimestamps(false);
    setAnimationsEnabled(true);
    setMaxMessages("100");
    setAutoSuggestPrompts(true);
    setMessageWordLimit("500");
    setEnableFileUpload(true);
    setAutoProcessUploads(true);
    setCacheDocuments(true);
    setEnableLogging(true);
    setLogLevel("info");
    setDataRetention("30");
    setAiModel("gpt-3.5-turbo");
    setResponseLength("medium");
    setIncludeSourceCitations(true);
    setPriorizeProductData(true);
    setEnableNotifications(true);
    setAutoBackup(false);
    setEnableAnalytics(true);
    
    toast({
      title: "Settings Reset",
      description: "All settings have been reset to defaults.",
    });
  };

  const handleExportSettings = () => {
    const settings = {
      ui: { darkMode, compactMode, autoScroll, showTimestamps, animationsEnabled },
      chat: { maxMessages, autoSuggestPrompts, messageWordLimit, enableFileUpload, autoProcessUploads },
      data: { cacheDocuments, enableLogging, logLevel, dataRetention },
      ai: { aiModel, responseLength, includeSourceCitations, prioritizeProductData },
      system: { enableNotifications, autoBackup, enableAnalytics }
    };
    
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'roofing-assistant-settings.json';
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Settings Exported",
      description: "Settings exported to JSON file.",
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <SettingsIcon className="w-6 h-6 text-carlisle-primary" />
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleExportSettings}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" onClick={handleResetSettings}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button onClick={handleSaveSettings}>
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
        </div>
      </div>

      {/* UI Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Palette className="w-5 h-5" />
            <span>User Interface</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="dark-mode">Dark Mode</Label>
              <Switch
                id="dark-mode"
                checked={darkMode}
                onCheckedChange={setDarkMode}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="compact-mode">Compact Mode</Label>
              <Switch
                id="compact-mode"
                checked={compactMode}
                onCheckedChange={setCompactMode}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="auto-scroll">Auto Scroll</Label>
              <Switch
                id="auto-scroll"
                checked={autoScroll}
                onCheckedChange={setAutoScroll}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="show-timestamps">Show Timestamps</Label>
              <Switch
                id="show-timestamps"
                checked={showTimestamps}
                onCheckedChange={setShowTimestamps}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="animations">Enable Animations</Label>
              <Switch
                id="animations"
                checked={animationsEnabled}
                onCheckedChange={setAnimationsEnabled}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chat Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="w-5 h-5" />
            <span>Chat & Conversation</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="max-messages">Max Messages per Session</Label>
              <Input
                id="max-messages"
                type="number"
                value={maxMessages}
                onChange={(e) => setMaxMessages(e.target.value)}
                min="10"
                max="1000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="word-limit">Message Word Limit</Label>
              <Input
                id="word-limit"
                type="number"
                value={messageWordLimit}
                onChange={(e) => setMessageWordLimit(e.target.value)}
                min="50"
                max="2000"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="auto-suggest">Auto-suggest Prompts</Label>
              <Switch
                id="auto-suggest"
                checked={autoSuggestPrompts}
                onCheckedChange={setAutoSuggestPrompts}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="file-upload">Enable File Upload</Label>
              <Switch
                id="file-upload"
                checked={enableFileUpload}
                onCheckedChange={setEnableFileUpload}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="auto-process">Auto-process Uploads</Label>
              <Switch
                id="auto-process"
                checked={autoProcessUploads}
                onCheckedChange={setAutoProcessUploads}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="w-5 h-5" />
            <span>AI Assistant</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ai-model">AI Model</Label>
              <Select value={aiModel} onValueChange={setAiModel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                  <SelectItem value="gpt-4">GPT-4</SelectItem>
                  <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="response-length">Response Length</Label>
              <Select value={responseLength} onValueChange={setResponseLength}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="short">Short</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="long">Long</SelectItem>
                  <SelectItem value="detailed">Detailed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="source-citations">Include Source Citations</Label>
              <Switch
                id="source-citations"
                checked={includeSourceCitations}
                onCheckedChange={setIncludeSourceCitations}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="prioritize-product">Prioritize Product Data</Label>
              <Switch
                id="prioritize-product"
                checked={prioritizeProductData}
                onCheckedChange={setPriorizeProductData}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data & Storage */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="w-5 h-5" />
            <span>Data & Storage</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="log-level">Logging Level</Label>
              <Select value={logLevel} onValueChange={setLogLevel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="error">Error Only</SelectItem>
                  <SelectItem value="warn">Warning & Error</SelectItem>
                  <SelectItem value="info">Info & Above</SelectItem>
                  <SelectItem value="debug">Debug (All)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="data-retention">Data Retention (days)</Label>
              <Input
                id="data-retention"
                type="number"
                value={dataRetention}
                onChange={(e) => setDataRetention(e.target.value)}
                min="1"
                max="365"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="cache-docs">Cache Documents</Label>
              <Switch
                id="cache-docs"
                checked={cacheDocuments}
                onCheckedChange={setCacheDocuments}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="enable-logging">Enable Logging</Label>
              <Switch
                id="enable-logging"
                checked={enableLogging}
                onCheckedChange={setEnableLogging}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="w-5 h-5" />
            <span>System & Security</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="notifications">Enable Notifications</Label>
              <Switch
                id="notifications"
                checked={enableNotifications}
                onCheckedChange={setEnableNotifications}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="auto-backup">Auto Backup</Label>
              <Switch
                id="auto-backup"
                checked={autoBackup}
                onCheckedChange={setAutoBackup}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="analytics">Enable Analytics</Label>
              <Switch
                id="analytics"
                checked={enableAnalytics}
                onCheckedChange={setEnableAnalytics}
              />
            </div>
          </div>
          
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-red-600">Danger Zone</Label>
                <p className="text-sm text-gray-500">Irreversible actions</p>
              </div>
              <Button variant="destructive" size="sm">
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All Data
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* About */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Globe className="w-5 h-5" />
            <span>About</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Version:</span>
              <Badge variant="outline">v1.0.0</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Product Database:</span>
              <Badge variant="outline">205 Products</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Last Updated:</span>
              <span className="text-sm">{new Date().toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Environment:</span>
              <Badge variant="outline">Production</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}