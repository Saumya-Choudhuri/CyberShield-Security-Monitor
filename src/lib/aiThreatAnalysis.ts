import { HfInference } from '@huggingface/inference';

// Initialize HuggingFace client with API key from environment
const huggingFaceToken = import.meta.env.VITE_HUGGINGFACE_API_KEY;
const hf = new HfInference(huggingFaceToken);

export interface ThreatAnalysisData {
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
  passwordEntropy?: number; // 0-100 (how random the password appears)
  previousSuccessfulLogins?: Array<{
    date: string;
    ip: string;
    location: string;
  }>;
}

export interface AIThreatAnalysisResult {
  riskScore: number; // 0-100
  threatLevel: 'low' | 'medium' | 'high' | 'critical';
  recommendation: 'allow' | 'warn' | 'require_2fa' | 'block';
  analysis: string;
  threats: Array<{
    type: string;
    confidence: number; // 0-100
    description: string;
  }>;
}

/**
 * Analyzes login attempt using HuggingFace AI to detect threats
 * Returns risk score and recommendation
 */
export async function analyzeLoginThreat(
  data: ThreatAnalysisData,
): Promise<AIThreatAnalysisResult> {
  if (!huggingFaceToken) {
    console.warn('HuggingFace API key not configured. Returning default analysis.');
    return getDefaultAnalysis(data);
  }

  try {
    const analysisPrompt = buildAnalysisPrompt(data);
    
    // Use HuggingFace text generation for threat analysis
    const response = await hf.textGeneration({
      model: 'mistralai/Mistral-7B-Instruct-v0.1',
      inputs: analysisPrompt,
      parameters: {
        max_new_tokens: 500,
        temperature: 0.3, // Lower temp for more consistent results
      },
    });

    const analysis = parseAIResponse(response.generated_text);
    return analysis;
  } catch (error) {
    console.error('AI threat analysis failed:', error);
    // Fallback to rule-based analysis
    return getRuleBasedAnalysis(data);
  }
}

/**
 * Build prompt for AI analysis based on threat data
 */
function buildAnalysisPrompt(data: ThreatAnalysisData): string {
  return `You are a cybersecurity threat analyst. Analyze the following login attempt and provide a threat assessment.

Login Attempt Details:
- Email: ${data.email}
- IP Address: ${data.ipAddress}
- Failed Attempts: ${data.failedAttempts}
- Location: ${data.locationData?.country || 'Unknown'}, ${data.locationData?.city || 'Unknown'}
- Device: ${data.deviceInfo?.browser || 'Unknown'} on ${data.deviceInfo?.os || 'Unknown'}
- Password Entropy Score: ${data.passwordEntropy || 'Unknown'}/100

Previous Successful Logins:
${data.previousSuccessfulLogins?.map((login) => `- ${login.date}: ${login.location} (${login.ip})`).join('\n') || 'None recorded'}

Provide threat assessment in this exact JSON format:
{
  "riskScore": <0-100>,
  "threatLevel": "<low|medium|high|critical>",
  "recommendation": "<allow|warn|require_2fa|block>",
  "analysis": "<brief explanation>",
  "threats": [
    {"type": "<threat_type>", "confidence": <0-100>, "description": "<details>"}
  ]
}

Focus on:
1. Anomalies compared to previous successful logins
2. Geographic impossibilities (quick travel)
3. Device fingerprint changes
4. Brute force patterns
5. Credential stuffing indicators

Respond ONLY with valid JSON.`;
}

/**
 * Parse AI response and extract threat analysis
 */
function parseAIResponse(responseText: string): AIThreatAnalysisResult {
  try {
    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const parsed = JSON.parse(jsonMatch[0]);
    
    return {
      riskScore: Math.min(100, Math.max(0, parsed.riskScore || 50)),
      threatLevel: parsed.threatLevel || 'medium',
      recommendation: parsed.recommendation || 'warn',
      analysis: parsed.analysis || 'Threat analysis completed.',
      threats: (parsed.threats || []).map((t: any) => ({
        type: t.type || 'unknown',
        confidence: Math.min(100, Math.max(0, t.confidence || 50)),
        description: t.description || '',
      })),
    };
  } catch (error) {
    console.error('Failed to parse AI response:', error);
    return getDefaultAnalysis({} as ThreatAnalysisData);
  }
}

/**
 * Rule-based analysis as fallback when AI unavailable
 */
function getRuleBasedAnalysis(data: ThreatAnalysisData): AIThreatAnalysisResult {
  let riskScore = 0;
  const threats: AIThreatAnalysisResult['threats'] = [];

  // Rule 1: Failed attempts
  if (data.failedAttempts >= 3) {
    riskScore += 40;
    threats.push({
      type: 'brute_force',
      confidence: Math.min(100, data.failedAttempts * 15),
      description: `${data.failedAttempts} failed login attempts detected`,
    });
  }

  // Rule 2: Low password entropy (looks like dictionary attack)
  if (data.passwordEntropy && data.passwordEntropy < 30) {
    riskScore += 25;
    threats.push({
      type: 'weak_password_pattern',
      confidence: 75,
      description: 'Password appears to follow common patterns (dictionary attack indicator)',
    });
  }

  // Rule 3: New device/location
  if (data.previousSuccessfulLogins && data.previousSuccessfulLogins.length > 0) {
    const lastLogin = data.previousSuccessfulLogins[0];
    if (
      data.locationData &&
      lastLogin.location !== `${data.locationData.country}, ${data.locationData.city}`
    ) {
      riskScore += 20;
      threats.push({
        type: 'new_location',
        confidence: 60,
        description: `Login from new location: ${data.locationData.country}`,
      });
    }
  }

  // Determine threat level and recommendation
  let threatLevel: AIThreatAnalysisResult['threatLevel'] = 'low';
  let recommendation: AIThreatAnalysisResult['recommendation'] = 'allow';

  if (riskScore >= 80) {
    threatLevel = 'critical';
    recommendation = 'block';
  } else if (riskScore >= 60) {
    threatLevel = 'high';
    recommendation = 'require_2fa';
  } else if (riskScore >= 40) {
    threatLevel = 'medium';
    recommendation = 'warn';
  }

  return {
    riskScore,
    threatLevel,
    recommendation,
    analysis: `Risk score: ${riskScore}/100. ${threats.length} threat(s) detected.`,
    threats,
  };
}

/**
 * Default analysis when no data provided
 */
function getDefaultAnalysis(data: ThreatAnalysisData): AIThreatAnalysisResult {
  return {
    riskScore: 50,
    threatLevel: 'medium',
    recommendation: 'warn',
    analysis: 'Unable to perform full AI analysis. Using basic threat assessment.',
    threats: [
      {
        type: 'analysis_unavailable',
        confidence: 0,
        description: 'AI threat analysis service is unavailable',
      },
    ],
  };
}

/**
 * Format threat analysis into human-readable message
 */
export function formatThreatAnalysis(result: AIThreatAnalysisResult): string {
  let message = `Threat Level: ${result.threatLevel.toUpperCase()} (Risk Score: ${result.riskScore}%)\n`;
  message += `\n${result.analysis}\n`;

  if (result.threats.length > 0) {
    message += '\nDetected Threats:\n';
    result.threats.forEach((threat) => {
      message += `- ${threat.type}: ${threat.description} (${threat.confidence}% confidence)\n`;
    });
  }

  return message;
}
