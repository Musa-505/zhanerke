"""
AI Analyzer Module using Google Vertex AI (Gemini)
Analyzes attacks and provides AI-powered defense recommendations
"""

import os
import json
import httpx
from typing import Dict, Any, List
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent"


class AIAnalyzer:
    """AI-powered attack and defense analyzer using Google Gemini API"""

    def __init__(self):
        self.api_key = GEMINI_API_KEY
        self.api_url = GEMINI_API_URL

    async def _call_gemini(self, prompt: str) -> str:
        """Call Gemini API"""
        payload = {
            "contents": [
                {
                    "parts": [{"text": prompt}]
                }
            ]
        }

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{self.api_url}?key={self.api_key}",
                headers={"Content-Type": "application/json"},
                json=payload
            )
            response.raise_for_status()

            result = response.json()
            return result["candidates"][0]["content"]["parts"][0]["text"].strip()

    def _parse_json_response(self, content: str) -> dict:
        """Extract JSON from model response"""
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        elif "```" in content:
            content = content.split("```")[1].split("```")[0].strip()
        return json.loads(content)

    async def analyze_attack_pattern(self, attack_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze attack pattern using AI"""
        if not self.api_key:
            return self._rule_based_analysis(attack_data)

        prompt = f"""You are a cybersecurity expert analyzing attack patterns.
Analyze the following attack and respond with ONLY a JSON object, no extra text:

Attack Data:
- Type: {attack_data.get('attack_type', 'unknown')}
- Intensity: {attack_data.get('intensity', 0)}
- Duration: {attack_data.get('duration', 0)}
- Target: {attack_data.get('target_url', 'N/A')}
- Parameters: {attack_data.get('parameters', {})}

JSON structure:
{{
    "attack_classification": "string",
    "threat_level": "Low|Medium|High|Critical",
    "recommended_defenses": ["defense1", "defense2"],
    "characteristics": {{
        "pattern": "string",
        "sophistication": "Low|Medium|High",
        "potential_damage": "string"
    }},
    "confidence": 0.85
}}"""

        try:
            content = await self._call_gemini(prompt)
            return self._parse_json_response(content)
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

        active_recommended = [d for d in recommended_defenses if any(d.lower() in def_name.lower() for def_name in current_defenses)]

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

        prompt = f"""You are a cybersecurity expert providing defense recommendations.
Based on the following attack history, respond with ONLY a JSON object:

Attack History (last 10):
{attack_history[:10]}

JSON format:
{{
    "recommendations": ["rec1", "rec2"],
    "priority": "Low|Medium|High",
    "mechanisms_to_enable": ["mechanism1"],
    "configuration_changes": {{"key": "value"}}
}}"""

        try:
            content = await self._call_gemini(prompt)
            return self._parse_json_response(content)
        except Exception as e:
            print(f"AI Recommendation error: {e}")

        return {
            "recommendations": ["Enable all defense mechanisms", "Monitor logs regularly"],
            "priority": "Medium"
        }


# Global instance
ai_analyzer = AIAnalyzer()
