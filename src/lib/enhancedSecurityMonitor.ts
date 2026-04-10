import {
  analyzeLoginThreat,
  formatThreatAnalysis,
  type ThreatAnalysisData,
  type AIThreatAnalysisResult,
} from './aiThreatAnalysis';
import { reportAuthAttempt, type SecurityMonitorResponse } from './securityMonitorClient';

/**
 * Enhanced security monitoring that combines traditional rules with AI threat analysis
 */
export interface EnhancedSecurityCheckOptions {
  email: string;
  ipAddress: string;
  failedAttempts: number;
  lastFailedAttempt?: string;
  locationData?: {
    country: string;
    city: string;
    timezone: string;
  };
  deviceInfo?: {
    userAgent: string;
    browser: string;
    os: string;
  };
  passwordEntropy?: number;
  previousSuccessfulLogins?: Array<{
    date: string;
    ip: string;
    location: string;
  }>;
}

export interface EnhancedSecurityResult {
  shouldBlock: boolean;
  shouldRequire2FA: boolean;
  message: string;
  aiAnalysis: AIThreatAnalysisResult;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * Performs enhanced security check combining traditional rules with AI analysis
 * Returns detailed recommendation for login attempt
 */
export async function performEnhancedSecurityCheck(
  options: EnhancedSecurityCheckOptions,
): Promise<EnhancedSecurityResult> {
  // Prepare threat analysis data
  const threatData: ThreatAnalysisData = {
    email: options.email,
    ipAddress: options.ipAddress,
    failedAttempts: options.failedAttempts,
    lastFailedAttempt: options.lastFailedAttempt,
    locationData: options.locationData,
    deviceInfo: options.deviceInfo,
    passwordEntropy: options.passwordEntropy,
    previousSuccessfulLogins: options.previousSuccessfulLogins,
  };

  // Get AI analysis
  const aiAnalysis = await analyzeLoginThreat(threatData);

  // Determine actions based on AI and traditional rules
  let shouldBlock = false;
  let shouldRequire2FA = false;
  let message = '';

  // Rule 1: Traditional 3-strike rule with AI override
  if (options.failedAttempts >= 3) {
    // Check if AI thinks this is actually a legitimate user
    if (aiAnalysis.riskScore >= 70) {
      shouldBlock = true;
      message = `Account blocked after ${options.failedAttempts} failed attempts. AI detected high-risk pattern.`;
    } else if (aiAnalysis.riskScore >= 40) {
      shouldRequire2FA = true;
      message = `Multiple failed attempts detected. Please verify with 2FA.`;
    }
  }

  // Rule 2: AI critical threat
  if (aiAnalysis.threatLevel === 'critical') {
    shouldBlock = true;
    message = `CRITICAL THREAT DETECTED: ${aiAnalysis.analysis}`;
  }

  // Rule 3: AI requires 2FA
  if (
    aiAnalysis.recommendation === 'require_2fa' &&
    options.failedAttempts < 3
  ) {
    shouldRequire2FA = true;
    message = `Additional verification required: ${aiAnalysis.analysis}`;
  }

  // Rule 4: AI allows with warning
  if (!shouldBlock && !shouldRequire2FA && aiAnalysis.riskScore >= 30) {
    message = `Login allowed with caution: ${aiAnalysis.analysis}`;
  }

  const result: EnhancedSecurityResult = {
    shouldBlock,
    shouldRequire2FA,
    message,
    aiAnalysis,
    riskLevel: aiAnalysis.threatLevel,
  };

  // Report to traditional security monitor if blocking
  if (shouldBlock) {
    await reportAuthAttempt({
      endpoint: '/auth/login',
      event: 'login',
      identifier: options.email,
      status: 'failure',
      metadata: {
        reason: 'AI threat detection',
        aiRiskScore: aiAnalysis.riskScore,
        threats: aiAnalysis.threats.map((t) => t.type),
      },
    });
  }

  return result;
}

/**
 * Get detailed threat report for admin dashboard
 */
export async function generateThreatReport(
  options: EnhancedSecurityCheckOptions,
): Promise<string> {
  const threatData: ThreatAnalysisData = {
    email: options.email,
    ipAddress: options.ipAddress,
    failedAttempts: options.failedAttempts,
    lastFailedAttempt: options.lastFailedAttempt,
    locationData: options.locationData,
    deviceInfo: options.deviceInfo,
    passwordEntropy: options.passwordEntropy,
    previousSuccessfulLogins: options.previousSuccessfulLogins,
  };

  const aiAnalysis = await analyzeLoginThreat(threatData);
  return formatThreatAnalysis(aiAnalysis);
}
