"""
AI Analyzer Module using Cursor AI API
Analyzes attacks and provides AI-powered defense recommendations
"""

import os
import httpx
from typing import Dict, Any, Optional, List
from dotenv import load_dotenv

load_dotenv()

# Cursor AI API Configuration
CURSOR_API_URL = os.getenv("CURSOR_API_URL", "https://api.cursor.sh/v1")
CURSOR_API_KEY = os.getenv("CURSOR_API_KEY", "")

# Fallback to OpenAI API if Cursor API key is not available
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
OPENAI_API_URL = os.getenv("OPENAI_API_URL", "https://api.openai.com/v1")


class AIAnalyzer:
    """AI-powered attack and defense analyzer using Cursor AI API"""
    
    def __init__(self):
        self.api_key = CURSOR_API_KEY or OPENAI_API_KEY
        self.api_url = CURSOR_API_URL if CURSOR_API_KEY else OPENAI_API_URL
        self.model = "gpt-4" if OPENAI_API_KEY else "cursor-gpt-4"
    
    async def analyze_attack_pattern(self, attack_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze attack pattern using AI"""
        if not self.api_key:
            # Fallback to rule-based analysis if no API key
            return self._rule_based_analysis(attack_data)
        
        prompt = f"""
Analyze the following attack pattern and provide:
1. Attack type classification
2. Threat level (Low/Medium/High/Critical)
3. Recommended defense mechanisms
4. Attack characteristics

Attack Data:
- Type: {attack_data.get('attack_type', 'unknown')}
- Intensity: {attack_data.get('intensity', 0)}
- Duration: {attack_data.get('duration', 0)}
- Target: {attack_data.get('target_url', 'N/A')}
- Parameters: {attack_data.get('parameters', {})}

Provide a JSON response with:
{{
    "attack_classification": "string",
    "threat_level": "Low|Medium|High|Critical",
    "recommended_defenses": ["defense1", "defense2"],
    "characteristics": {{
        "pattern": "string",
        "sophistication": "Low|Medium|High",
        "potential_damage": "string"
    }},
    "confidence": 0.0-1.0
}}
"""
        
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                headers = {
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json"
                }
                
                # Try Cursor API first, fallback to OpenAI
                if CURSOR_API_KEY:
                    response = await client.post(
                        f"{self.api_url}/chat/completions",
                        headers=headers,
                        json={
                            "model": self.model,
                            "messages": [
                                {"role": "system", "content": "You are a cybersecurity expert analyzing attack patterns."},
                                {"role": "user", "content": prompt}
                            ],
                            "temperature": 0.3,
                            "max_tokens": 500
                        }
                    )
                else:
                    # Use OpenAI API
                    response = await client.post(
                        f"{self.api_url}/chat/completions",
                        headers=headers,
                        json={
                            "model": "gpt-4-turbo-preview",
                            "messages": [
                                {"role": "system", "content": "You are a cybersecurity expert analyzing attack patterns."},
                                {"role": "user", "content": prompt}
                            ],
                            "temperature": 0.3,
                            "max_tokens": 500
                        }
                    )
                
                if response.status_code == 200:
                    result = response.json()
                    content = result.get("choices", [{}])[0].get("message", {}).get("content", "")
                    
                    # Parse JSON from response
                    import json
                    try:
                        # Extract JSON from markdown code blocks if present
                        if "```json" in content:
                            content = content.split("```json")[1].split("```")[0].strip()
                        elif "```" in content:
                            content = content.split("```")[1].split("```")[0].strip()
                        
                        analysis = json.loads(content)
                        return analysis
                    except json.JSONDecodeError:
                        # If JSON parsing fails, use rule-based analysis
                        return self._rule_based_analysis(attack_data)
                else:
                    return self._rule_based_analysis(attack_data)
        
        except Exception as e:
            print(f"AI Analysis error: {e}")
            return self._rule_based_analysis(attack_data)
    
    def _rule_based_analysis(self, attack_data: Dict[str, Any]) -> Dict[str, Any]:
        """Fallback rule-based analysis when AI is unavailable"""
        attack_type = attack_data.get('attack_type', 'unknown')
        intensity = attack_data.get('intensity', 5)
        
        threat_levels = {
            'ddos': 'High' if intensity > 7 else 'Medium' if intensity > 4 else 'Low',
            'sql_injection': 'Critical',
            'xss': 'High',
            'brute_force': 'Medium',
            'port_scan': 'Low',
            'phishing': 'Medium'
        }
        
        recommended_defenses = {
            'ddos': ['rate_limiting', 'firewall', 'ai_detection'],
            'sql_injection': ['ids', 'ai_detection', 'firewall'],
            'xss': ['ids', 'ai_detection'],
            'brute_force': ['rate_limiting', 'firewall'],
            'port_scan': ['firewall', 'ids'],
            'phishing': ['ai_detection', 'behavioral_analysis']
        }
        
        return {
            "attack_classification": attack_type,
            "threat_level": threat_levels.get(attack_type, 'Medium'),
            "recommended_defenses": recommended_defenses.get(attack_type, ['ai_detection']),
            "characteristics": {
                "pattern": f"{attack_type} attack with intensity {intensity}",
                "sophistication": "High" if intensity > 7 else "Medium" if intensity > 4 else "Low",
                "potential_damage": "High" if attack_type in ['sql_injection', 'ddos'] else "Medium"
            },
            "confidence": 0.7
        }
    
    async def should_block_attack(self, attack_data: Dict[str, Any], current_defenses: List[str]) -> Dict[str, Any]:
        """Determine if attack should be blocked based on AI analysis"""
        analysis = await self.analyze_attack_pattern(attack_data)
        
        threat_level = analysis.get('threat_level', 'Medium')
        recommended_defenses = analysis.get('recommended_defenses', [])
        
        # Check if recommended defenses are active
        active_recommended = [d for d in recommended_defenses if any(d.lower() in def_name.lower() for def_name in current_defenses)]
        
        # Decision logic
        should_block = False
        confidence = 0.5
        
        if threat_level == 'Critical':
            should_block = True
            confidence = 0.95
        elif threat_level == 'High':
            should_block = len(active_recommended) > 0
            confidence = 0.85
        elif threat_level == 'Medium':
            should_block = len(active_recommended) >= 2
            confidence = 0.70
        else:
            should_block = len(active_recommended) >= 3
            confidence = 0.60
        
        return {
            "should_block": should_block,
            "confidence": confidence,
            "reason": f"Threat level: {threat_level}, Active defenses: {len(active_recommended)}/{len(recommended_defenses)}",
            "analysis": analysis
        }
    
    async def generate_defense_recommendations(self, attack_history: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Generate defense recommendations based on attack history"""
        if not self.api_key or len(attack_history) == 0:
            return {
                "recommendations": ["Enable all defense mechanisms", "Monitor logs regularly"],
                "priority": "Medium"
            }
        
        prompt = f"""
Based on the following attack history, provide defense recommendations:

Attack History:
{attack_history[:10]}  # Last 10 attacks

Provide recommendations for:
1. Which defense mechanisms to enable/configure
2. Priority actions
3. Long-term security improvements

Format as JSON:
{{
    "recommendations": ["rec1", "rec2"],
    "priority": "Low|Medium|High",
    "mechanisms_to_enable": ["mechanism1"],
    "configuration_changes": {{"key": "value"}}
}}
"""
        
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                headers = {
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json"
                }
                
                response = await client.post(
                    f"{self.api_url}/chat/completions",
                    headers=headers,
                    json={
                        "model": self.model if CURSOR_API_KEY else "gpt-4-turbo-preview",
                        "messages": [
                            {"role": "system", "content": "You are a cybersecurity expert providing defense recommendations."},
                            {"role": "user", "content": prompt}
                        ],
                        "temperature": 0.3,
                        "max_tokens": 500
                    }
                )
                
                if response.status_code == 200:
                    result = response.json()
                    content = result.get("choices", [{}])[0].get("message", {}).get("content", "")
                    
                    import json
                    try:
                        if "```json" in content:
                            content = content.split("```json")[1].split("```")[0].strip()
                        elif "```" in content:
                            content = content.split("```")[1].split("```")[0].strip()
                        
                        return json.loads(content)
                    except json.JSONDecodeError:
                        pass
        
        except Exception as e:
            print(f"AI Recommendation error: {e}")
        
        return {
            "recommendations": ["Enable all defense mechanisms", "Monitor logs regularly"],
            "priority": "Medium"
        }


# Global instance
ai_analyzer = AIAnalyzer()

