export function validateConnection(data) {
  const { host, username } = data;
  
  if (!host || !host.trim()) {
    return { valid: false, error: 'Host is required' };
  }
  
  if (!username || !username.trim()) {
    return { valid: false, error: 'Username is required' };
  }
  
  return { valid: true };
}

export function validateBackupRequest(data) {
  const { sessionId, backupPath } = data;
  
  if (!sessionId) {
    return { valid: false, error: 'Session ID is required' };
  }
  
  if (!backupPath || !backupPath.trim()) {
    return { valid: false, error: 'Backup path is required' };
  }
  
  return { valid: true };
}
