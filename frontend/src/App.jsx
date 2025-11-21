import React, { useState, useEffect } from 'react';
import { HardDrive, Server, Clock, Database, AlertCircle, CheckCircle, PlayCircle, StopCircle, RotateCcw, Settings, Activity, ArrowLeft, LogOut } from 'lucide-react';
import LoginPage from './components/LoginPage';
import UserManagement from './components/UserManagement';

export default function RHELBackupSystem() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [connectionConfig, setConnectionConfig] = useState({
    host: '',
    port: '22',
    username: '',
    password: '',
    backupPath: '/backup',
    excludePaths: '/proc,/sys,/dev,/tmp,/run'
  });
  
  const [isConnected, setIsConnected] = useState(false);
  const [backupStatus, setBackupStatus] = useState({
    isRunning: false,
    progress: 0,
    currentFile: '',
    filesProcessed: 0,
    totalFiles: 0,
    bytesProcessed: 0,
    totalBytes: 0,
    startTime: null,
    estimatedCompletion: null,
    phase: 'idle'
  });
  
  const [systemInfo, setSystemInfo] = useState({
    hostname: '',
    osVersion: '',
    kernelVersion: '',
    totalDisk: 0,
    usedDisk: 0,
    freeDisk: 0,
    cpuUsage: 0,
    memoryUsage: 0
  });
  
  const [backupHistory, setBackupHistory] = useState([]);
  const [showConfig, setShowConfig] = useState(true);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState(null);
  const [restoreStatus, setRestoreStatus] = useState({
    isRunning: false,
    progress: 0,
    currentFile: '',
    phase: 'idle'
  });

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/auth/check', {
        credentials: 'include'
      });
      const data = await response.json();

      if (data.authenticated) {
        setIsAuthenticated(true);
        setCurrentUser(data.user);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLoginSuccess = (user) => {
    setIsAuthenticated(true);
    setCurrentUser(user);
  };

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:3001/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      setIsAuthenticated(false);
      setCurrentUser(null);
      setIsConnected(false);
      setShowConfig(true);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleConnect = async () => {
    if (!connectionConfig.host || !connectionConfig.username) {
      alert('Please fill in host and username');
      return;
    }
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsConnected(true);
    setShowConfig(false);
    
    setSystemInfo({
      hostname: connectionConfig.host,
      osVersion: 'Red Hat Enterprise Linux 9.2',
      kernelVersion: '5.14.0-284.11.1.el9_2.x86_64',
      totalDisk: 500 * 1024 * 1024 * 1024,
      usedDisk: 287 * 1024 * 1024 * 1024,
      freeDisk: 213 * 1024 * 1024 * 1024,
      cpuUsage: 23,
      memoryUsage: 45
    });
  };

  const startBackup = () => {
    setBackupStatus({
      isRunning: true,
      progress: 0,
      currentFile: 'Scanning file system...',
      filesProcessed: 0,
      totalFiles: 125000,
      bytesProcessed: 0,
      totalBytes: systemInfo.usedDisk,
      startTime: Date.now(),
      estimatedCompletion: null,
      phase: 'scanning'
    });
  };

  useEffect(() => {
    if (!backupStatus.isRunning) return;
    
    const interval = setInterval(() => {
      setBackupStatus(prev => {
        if (prev.progress >= 100) {
          clearInterval(interval);
          
          setBackupHistory(history => [{
            id: Date.now(),
            date: new Date().toISOString(),
            size: formatBytes(prev.totalBytes),
            duration: formatDuration(Date.now() - prev.startTime),
            status: 'complete'
          }, ...history.slice(0, 9)]);
          
          return {
            ...prev,
            isRunning: false,
            phase: 'complete',
            progress: 100
          };
        }
        
        const increment = Math.random() * 3;
        const newProgress = Math.min(prev.progress + increment, 100);
        const filesProcessed = Math.floor((newProgress / 100) * prev.totalFiles);
        const bytesProcessed = Math.floor((newProgress / 100) * prev.totalBytes);
        
        const elapsed = Date.now() - prev.startTime;
        const rate = bytesProcessed / (elapsed / 1000);
        const remaining = (prev.totalBytes - bytesProcessed) / rate * 1000;
        
        let phase = prev.phase;
        if (newProgress < 5) phase = 'scanning';
        else if (newProgress < 95) phase = 'backing-up';
        else if (newProgress < 100) phase = 'verifying';
        
        const sampleFiles = [
          '/etc/systemd/system/multi-user.target',
          '/var/log/messages',
          '/home/admin/.bash_history',
          '/usr/lib64/libssl.so.3',
          '/opt/application/config.yml',
          '/var/www/html/index.html'
        ];
        
        return {
          ...prev,
          progress: newProgress,
          filesProcessed,
          bytesProcessed,
          currentFile: sampleFiles[Math.floor(Math.random() * sampleFiles.length)],
          estimatedCompletion: remaining > 0 ? Date.now() + remaining : null,
          phase
        };
      });
    }, 200);
    
    return () => clearInterval(interval);
  }, [backupStatus.isRunning]);

  const stopBackup = () => {
    setBackupStatus(prev => ({
      ...prev,
      isRunning: false,
      phase: 'idle'
    }));
  };

  const startRestore = (backup = null) => {
    setSelectedBackup(backup);
    setShowRestoreModal(true);
  };

  const confirmRestore = () => {
    setShowRestoreModal(false);
    setRestoreStatus({
      isRunning: true,
      progress: 0,
      currentFile: 'Preparing restore...',
      phase: 'restoring'
    });
  };

  const cancelRestore = () => {
    setShowRestoreModal(false);
    setSelectedBackup(null);
  };

  useEffect(() => {
    if (!restoreStatus.isRunning) return;
    
    const interval = setInterval(() => {
      setRestoreStatus(prev => {
        if (prev.progress >= 100) {
          clearInterval(interval);
          alert('Restore completed successfully!');
          return {
            isRunning: false,
            progress: 0,
            currentFile: '',
            phase: 'idle'
          };
        }
        
        const increment = Math.random() * 4;
        const newProgress = Math.min(prev.progress + increment, 100);
        
        const sampleFiles = [
          'Restoring /etc/systemd/system/',
          'Restoring /var/log/',
          'Restoring /home/admin/',
          'Restoring /usr/lib64/',
          'Restoring /opt/application/',
          'Restoring /var/www/html/'
        ];
        
        return {
          ...prev,
          progress: newProgress,
          currentFile: sampleFiles[Math.floor(Math.random() * sampleFiles.length)]
        };
      });
    }, 200);
    
    return () => clearInterval(interval);
  }, [restoreStatus.isRunning]);

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDuration = (ms) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  const getPhaseColor = (phase) => {
    switch (phase) {
      case 'scanning': return 'text-blue-400';
      case 'backing-up': return 'text-green-400';
      case 'verifying': return 'text-yellow-400';
      case 'complete': return 'text-green-500';
      case 'error': return 'text-red-500';
      default: return 'text-gray-400';
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  if (!isConnected || showConfig) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 p-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Server className="w-10 h-10 text-blue-400" />
                <div>
                  <h1 className="text-3xl font-bold text-white">barBack</h1>
                  <p className="text-slate-400">RHEL Backup System</p>
                </div>
              </div>
              <div className="flex gap-2">
                {isConnected && (
                  <button
                    onClick={() => setShowConfig(false)}
                    className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </button>
                )}
                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </div>

            <p className="text-slate-400 text-sm mb-4">
              Logged in as: <span className="text-white font-medium">{currentUser?.username}</span>
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Hostname / IP Address</label>
                <input
                  type="text"
                  value={connectionConfig.host}
                  onChange={(e) => setConnectionConfig({...connectionConfig, host: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="192.168.1.100"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">SSH Port</label>
                  <input
                    type="text"
                    value={connectionConfig.port}
                    onChange={(e) => setConnectionConfig({...connectionConfig, port: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Username</label>
                  <input
                    type="text"
                    value={connectionConfig.username}
                    onChange={(e) => setConnectionConfig({...connectionConfig, username: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="root"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
                <input
                  type="password"
                  value={connectionConfig.password}
                  onChange={(e) => setConnectionConfig({...connectionConfig, password: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter password"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Backup Destination Path</label>
                <input
                  type="text"
                  value={connectionConfig.backupPath}
                  onChange={(e) => setConnectionConfig({...connectionConfig, backupPath: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Exclude Paths (comma separated)</label>
                <input
                  type="text"
                  value={connectionConfig.excludePaths}
                  onChange={(e) => setConnectionConfig({...connectionConfig, excludePaths: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <button
                onClick={handleConnect}
                className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Server className="w-5 h-5" />
                Connect to Server
              </button>
            </div>
          </div>

          <UserManagement />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Server className="w-8 h-8 text-blue-400" />
            <div>
              <h1 className="text-2xl font-bold text-white">barBack Dashboard</h1>
              <p className="text-slate-400">{systemInfo.hostname} • {currentUser?.username}</p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowConfig(true)}
              className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Settings className="w-4 h-4" />
              Configure
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-sm">OS Version</span>
              <Server className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-white font-semibold text-sm">{systemInfo.osVersion}</p>
          </div>
          
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-sm">Disk Usage</span>
              <HardDrive className="w-4 h-4 text-purple-400" />
            </div>
            <p className="text-white font-semibold">{formatBytes(systemInfo.usedDisk)} / {formatBytes(systemInfo.totalDisk)}</p>
            <div className="mt-2 bg-slate-700 rounded-full h-2">
              <div className="bg-purple-500 h-2 rounded-full" style={{width: `${(systemInfo.usedDisk / systemInfo.totalDisk) * 100}%`}}></div>
            </div>
          </div>
          
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-sm">CPU Usage</span>
              <Activity className="w-4 h-4 text-green-400" />
            </div>
            <p className="text-white font-semibold text-2xl">{systemInfo.cpuUsage}%</p>
          </div>
          
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-sm">Memory Usage</span>
              <Database className="w-4 h-4 text-yellow-400" />
            </div>
            <p className="text-white font-semibold text-2xl">{systemInfo.memoryUsage}%</p>
          </div>
        </div>

        <div className="bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Database className="w-8 h-8 text-blue-400" />
              <div>
                <h2 className="text-2xl font-bold text-white">Backup Status</h2>
                <p className={`text-sm font-medium ${getPhaseColor(backupStatus.phase)}`}>
                  {backupStatus.phase.charAt(0).toUpperCase() + backupStatus.phase.slice(1).replace('-', ' ')}
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              {!backupStatus.isRunning ? (
                <button
                  onClick={startBackup}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center gap-2"
                >
                  <PlayCircle className="w-5 h-5" />
                  Start Backup
                </button>
              ) : (
                <button
                  onClick={stopBackup}
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center gap-2"
                >
                  <StopCircle className="w-5 h-5" />
                  Stop Backup
                </button>
              )}
              
              <button
                onClick={() => startRestore()}
                disabled={restoreStatus.isRunning}
                className="bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RotateCcw className="w-5 h-5" />
                Restore
              </button>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-300 font-medium">Overall Progress</span>
              <span className="text-white font-bold text-xl">{Math.round(backupStatus.progress)}%</span>
            </div>
            <div className="bg-slate-700 rounded-full h-4 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-blue-500 to-green-500 h-4 rounded-full transition-all duration-300 ease-out"
                style={{width: `${backupStatus.progress}%`}}
              ></div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-slate-700/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-blue-400" />
                <span className="text-slate-300 text-sm">Time Elapsed</span>
              </div>
              <p className="text-white text-xl font-semibold">
                {backupStatus.startTime ? formatDuration(Date.now() - backupStatus.startTime) : '--'}
              </p>
            </div>
            
            <div className="bg-slate-700/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-green-400" />
                <span className="text-slate-300 text-sm">Est. Time Remaining</span>
              </div>
              <p className="text-white text-xl font-semibold">
                {backupStatus.estimatedCompletion ? formatDuration(backupStatus.estimatedCompletion - Date.now()) : '--'}
              </p>
            </div>
            
            <div className="bg-slate-700/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-purple-400" />
                <span className="text-slate-300 text-sm">Files Processed</span>
              </div>
              <p className="text-white text-xl font-semibold">
                {backupStatus.filesProcessed.toLocaleString()} / {backupStatus.totalFiles.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="bg-slate-700/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-blue-400" />
              <span className="text-slate-300 text-sm font-medium">Current Activity</span>
            </div>
            <p className="text-white font-mono text-sm truncate">
              {backupStatus.currentFile || 'Idle'}
            </p>
            <div className="mt-2 text-slate-400 text-sm">
              Data: {formatBytes(backupStatus.bytesProcessed)} / {formatBytes(backupStatus.totalBytes)}
            </div>
          </div>
        </div>

        {restoreStatus.isRunning && (
          <div className="bg-slate-800 rounded-2xl shadow-2xl border border-yellow-700 p-8 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <RotateCcw className="w-8 h-8 text-yellow-400 animate-spin" />
              <div>
                <h2 className="text-2xl font-bold text-white">Restore in Progress</h2>
                <p className="text-sm font-medium text-yellow-400">
                  Restoring system from backup
                </p>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-300 font-medium">Restore Progress</span>
                <span className="text-white font-bold text-xl">{Math.round(restoreStatus.progress)}%</span>
              </div>
              <div className="bg-slate-700 rounded-full h-4 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 h-4 rounded-full transition-all duration-300 ease-out"
                  style={{width: `${restoreStatus.progress}%`}}
                ></div>
              </div>
            </div>

            <div className="bg-slate-700/50 rounded-lg p-4">
              <p className="text-white font-mono text-sm truncate">
                {restoreStatus.currentFile}
              </p>
            </div>
          </div>
        )}

        <div className="bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Database className="w-6 h-6 text-blue-400" />
            Backup History
          </h3>
          
          {backupHistory.length === 0 ? (
            <p className="text-slate-400 text-center py-8">No backup history yet</p>
          ) : (
            <div className="space-y-3">
              {backupHistory.map((backup) => (
                <div key={backup.id} className="bg-slate-700/50 rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <div>
                      <p className="text-white font-medium">{new Date(backup.date).toLocaleString()}</p>
                      <p className="text-slate-400 text-sm">Size: {backup.size} • Duration: {backup.duration}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => startRestore(backup)}
                    disabled={restoreStatus.isRunning}
                    className="text-blue-400 hover:text-blue-300 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Restore
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {showRestoreModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-8 max-w-md w-full">
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="w-8 h-8 text-yellow-400" />
                <h3 className="text-2xl font-bold text-white">Confirm Restore</h3>
              </div>
              
              <p className="text-slate-300 mb-2">
                Are you sure you want to restore the system from this backup?
              </p>
              
              {selectedBackup && (
                <div className="bg-slate-700/50 rounded-lg p-4 mb-6">
                  <p className="text-white font-medium">{new Date(selectedBackup.date).toLocaleString()}</p>
                  <p className="text-slate-400 text-sm">Size: {selectedBackup.size} • Duration: {selectedBackup.duration}</p>
                </div>
              )}
              
              <div className="bg-yellow-900/30 border border-yellow-700 rounded-lg p-4 mb-6">
                <p className="text-yellow-200 text-sm">
                  <strong>Warning:</strong> This will overwrite current system files with the backup data.
                </p>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={cancelRestore}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmRestore}
                  className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  Confirm Restore
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
