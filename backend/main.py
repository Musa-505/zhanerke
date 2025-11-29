"""
FastAPI Backend for AI Attack & Defense System
Research and Demonstration Platform with Real Attacks
"""

from fastapi import FastAPI, HTTPException, Depends, Header, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
import uuid
import time
import random
import asyncio
from enum import Enum
import os
import socket
from dotenv import load_dotenv

# Import attack executor and AI analyzer
from attack_executor import attack_executor, set_log_function
from ai_analyzer import ai_analyzer

load_dotenv()

app = FastAPI(
    title="AI Attack & Defense API",
    description="API for simulating attacks and monitoring defense mechanisms",
    version="1.0.0"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()

# In-memory storage (use database in production)
attacks_db: Dict[str, Dict] = {}
defense_status: Dict[str, Any] = {
    "defense_id": "def-001",
    "status": "active",
    "blocked_attacks": 0,
    "total_attacks": 0,
    "success_rate": 100.0,
    "active_defenses": ["Firewall", "IDS", "Rate Limiting", "AI Detection"],
    "timestamp": datetime.now().isoformat()
}
logs_db: List[Dict] = []
statistics_db: Dict[str, Any] = {
    "total_attacks": 0,
    "blocked_attacks": 0,
    "success_rate": 100.0,
    "average_latency": 0,
    "attack_types": {},
    "defense_mechanisms": {},
    "time_series": []
}

# Defense mechanisms storage
defense_mechanisms_db: Dict[str, Dict] = {
    "firewall": {
        "id": "firewall",
        "name": "AI Firewall",
        "description": "Intelligent firewall with AI-powered threat detection and automatic rule generation",
        "enabled": True,
        "settings": {
            "block_threshold": 0.8,
            "auto_learn": True,
            "strict_mode": False,
            "max_connections": 1000
        },
        "stats": {
            "blocked": 0,
            "success_rate": 100.0,
            "response_time": 15
        }
    },
    "ids": {
        "id": "ids",
        "name": "Intrusion Detection System",
        "description": "AI-based intrusion detection system that analyzes network patterns and behaviors",
        "enabled": True,
        "settings": {
            "sensitivity": 0.7,
            "real_time_analysis": True,
            "alert_threshold": 5,
            "learning_enabled": True
        },
        "stats": {
            "blocked": 0,
            "success_rate": 95.0,
            "response_time": 25
        }
    },
    "rate_limiting": {
        "id": "rate_limiting",
        "name": "AI Rate Limiting",
        "description": "Intelligent rate limiting that adapts based on traffic patterns and attack signatures",
        "enabled": True,
        "settings": {
            "requests_per_minute": 100,
            "adaptive_threshold": True,
            "ip_whitelist": [],
            "strict_enforcement": False
        },
        "stats": {
            "blocked": 0,
            "success_rate": 98.0,
            "response_time": 5
        }
    },
    "ai_detection": {
        "id": "ai_detection",
        "name": "AI Threat Detection",
        "description": "Advanced AI model for detecting and classifying various attack patterns in real-time",
        "enabled": True,
        "settings": {
            "model_version": "v2.1",
            "confidence_threshold": 0.85,
            "auto_update": True,
            "deep_analysis": True
        },
        "stats": {
            "blocked": 0,
            "success_rate": 92.0,
            "response_time": 50
        }
    },
    "behavioral_analysis": {
        "id": "behavioral_analysis",
        "name": "Behavioral Analysis Engine",
        "description": "Analyzes user and system behaviors to detect anomalies and potential threats",
        "enabled": False,
        "settings": {
            "baseline_period": 7,
            "anomaly_threshold": 0.75,
            "track_user_patterns": True,
            "alert_on_deviation": True
        },
        "stats": {
            "blocked": 0,
            "success_rate": 88.0,
            "response_time": 100
        }
    }
}

# Models
class AttackRequest(BaseModel):
    attack_type: str
    target_url: Optional[str] = None
    intensity: int = 5
    duration: int = 60
    parameters: Optional[Dict[str, Any]] = None

class AttackResponse(BaseModel):
    attack_id: str
    status: str
    message: str
    timestamp: str
    estimated_duration: Optional[int] = None

class DefenseStatus(BaseModel):
    defense_id: str
    status: str
    blocked_attacks: int
    total_attacks: int
    success_rate: float
    active_defenses: List[str]
    timestamp: str

class LogEntry(BaseModel):
    log_id: str
    timestamp: str
    level: str
    category: str
    message: str
    metadata: Optional[Dict[str, Any]] = None

class Statistics(BaseModel):
    total_attacks: int
    blocked_attacks: int
    success_rate: float
    average_latency: float
    attack_types: Dict[str, int]
    defense_mechanisms: Dict[str, int]
    time_series: List[Dict[str, Any]]

class DefenseMechanism(BaseModel):
    id: str
    name: str
    description: str
    enabled: bool
    settings: Optional[Dict[str, Any]] = None
    stats: Optional[Dict[str, Any]] = None

class DefenseConfig(BaseModel):
    mechanisms: List[DefenseMechanism]
    global_settings: Optional[Dict[str, Any]] = None

class DefenseMechanismUpdate(BaseModel):
    enabled: Optional[bool] = None
    settings: Optional[Dict[str, Any]] = None

# Authentication (simplified for demo)
async def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    # In production, verify JWT token here
    token = credentials.credentials
    if token == "demo-token" or token.startswith("Bearer "):
        return True
    raise HTTPException(status_code=401, detail="Invalid authentication credentials")

async def verify_api_key(x_api_key: Optional[str] = Header(None)):
    # In production, verify API key here
    if x_api_key and (x_api_key == "demo-api-key" or x_api_key.startswith("key-")):
        return True
    # Allow requests without auth for demo purposes
    return True

# Helper functions
def create_log(level: str, category: str, message: str, metadata: Optional[Dict] = None):
    log_entry = {
        "log_id": str(uuid.uuid4()),
        "timestamp": datetime.now().isoformat(),
        "level": level,
        "category": category,
        "message": message,
        "metadata": metadata
    }
    logs_db.insert(0, log_entry)
    if len(logs_db) > 1000:
        logs_db.pop()
    return log_entry

# Set log function for attack_executor
set_log_function(create_log)

def update_statistics(attack_type: str, blocked: bool, latency: float):
    stats = statistics_db
    stats["total_attacks"] += 1
    if blocked:
        stats["blocked_attacks"] += 1
    
    stats["success_rate"] = (stats["blocked_attacks"] / stats["total_attacks"] * 100) if stats["total_attacks"] > 0 else 100.0
    
    # Update attack types
    stats["attack_types"][attack_type] = stats["attack_types"].get(attack_type, 0) + 1
    
    # Update defense mechanisms
    for defense in defense_status["active_defenses"]:
        stats["defense_mechanisms"][defense] = stats["defense_mechanisms"].get(defense, 0) + 1
    
    # Update average latency
    total_latency = stats["average_latency"] * (stats["total_attacks"] - 1) + latency
    stats["average_latency"] = total_latency / stats["total_attacks"]
    
    # Add to time series
    stats["time_series"].append({
        "timestamp": datetime.now().isoformat(),
        "attacks": 1,
        "blocked": 1 if blocked else 0,
        "latency": latency
    })
    
    # Keep last 100 points
    if len(stats["time_series"]) > 100:
        stats["time_series"] = stats["time_series"][-100:]

# Routes
@app.get("/")
async def root():
    return {
        "message": "AI Attack & Defense API",
        "version": "1.0.0",
        "status": "operational"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

# Authentication endpoints
@app.post("/auth/login")
async def login(username: str, password: str):
    # Simplified authentication for demo
    if username and password:
        return {"token": "demo-token", "expires_in": 3600}
    raise HTTPException(status_code=401, detail="Invalid credentials")

# Attack endpoints
@app.post("/api/attacks/simulate", response_model=AttackResponse)
async def simulate_attack(attack: AttackRequest, auth: bool = Depends(verify_api_key)):
    """Execute a real attack for research and demonstration purposes"""
    attack_id = str(uuid.uuid4())
    
    # Validate target URL for real attacks
    target_url = attack.target_url or os.getenv("DEFAULT_TARGET_URL", "")
    if not target_url and attack.attack_type in ['ddos', 'sql_injection', 'xss', 'brute_force', 'port_scan']:
        raise HTTPException(
            status_code=400,
            detail=f"Target URL is required for {attack.attack_type} attack. Please provide target_url or set DEFAULT_TARGET_URL environment variable."
        )
    
    estimated_duration = attack.duration
    
    attack_data = {
        "attack_id": attack_id,
        "status": "running",
        "message": f"Real attack started: {attack.attack_type}",
        "timestamp": datetime.now().isoformat(),
        "estimated_duration": estimated_duration,
        "attack_type": attack.attack_type,
        "intensity": attack.intensity,
        "duration": attack.duration,
        "target_url": target_url
    }
    
    attacks_db[attack_id] = attack_data
    
    create_log("INFO", "ATTACK", f"Real attack started: {attack.attack_type} on {target_url}", {
        "attack_id": attack_id,
        "intensity": attack.intensity,
        "target_url": target_url
    })
    
    # Execute real attack in background
    asyncio.create_task(process_attack(attack_id, attack))
    
    return AttackResponse(**attack_data)

async def process_attack(attack_id: str, attack: AttackRequest):
    """Process real attack execution in background"""
    start_time = time.time()
    attack_result = {}
    blocked = False
    latency = 0
    
    try:
        # Execute real attack based on type
        target_url = attack.target_url or os.getenv("DEFAULT_TARGET_URL", "")
        
        if not target_url and attack.attack_type in ['ddos', 'sql_injection', 'xss', 'brute_force', 'port_scan']:
            create_log("ERROR", "ATTACK", f"Target URL required for {attack.attack_type} attack", {
                "attack_id": attack_id
            })
            if attack_id in attacks_db:
                attacks_db[attack_id]["status"] = "failed"
                attacks_db[attack_id]["message"] = "Target URL is required"
            return
        
        # Execute real attack
        if attack.attack_type == 'ddos':
            attack_result = await attack_executor.execute_ddos(
                target_url, attack.intensity, attack.duration
            )
        elif attack.attack_type == 'sql_injection':
            attack_result = await attack_executor.execute_sql_injection(
                target_url, attack.intensity, attack.duration
            )
        elif attack.attack_type == 'xss':
            attack_result = await attack_executor.execute_xss(
                target_url, attack.intensity, attack.duration
            )
        elif attack.attack_type == 'brute_force':
            attack_result = await attack_executor.execute_brute_force(
                target_url, attack.intensity, attack.duration
            )
        elif attack.attack_type == 'port_scan':
            attack_result = await attack_executor.execute_port_scan(
                target_url, attack.intensity, attack.duration
            )
        else:
            # For other attack types, use simulation
            await asyncio.sleep(2)
            attack_result = {"simulated": True, "duration": attack.duration}
        
        latency = (time.time() - start_time) * 1000  # Convert to milliseconds
        
        # AI-powered analysis
        ai_analysis = await ai_analyzer.analyze_attack_pattern({
            "attack_type": attack.attack_type,
            "intensity": attack.intensity,
            "duration": attack.duration,
            "target_url": target_url,
            "parameters": attack.parameters or {},
            "result": attack_result
        })
        
        # Get active defenses
        active_defenses = defense_status.get("active_defenses", [])
        
        # AI decision on blocking
        block_decision = await ai_analyzer.should_block_attack({
            "attack_type": attack.attack_type,
            "intensity": attack.intensity,
            "duration": attack.duration,
            "target_url": target_url,
            "result": attack_result,
            "ai_analysis": ai_analysis
        }, active_defenses)
        
        blocked = block_decision.get("should_block", False)
        
        # Update defense status
        defense_status["total_attacks"] += 1
        if blocked:
            defense_status["blocked_attacks"] += 1
        defense_status["success_rate"] = (
            defense_status["blocked_attacks"] / defense_status["total_attacks"] * 100
            if defense_status["total_attacks"] > 0 else 100.0
        )
        defense_status["timestamp"] = datetime.now().isoformat()
        
        # Update individual defense mechanism stats
        for mechanism_id, mechanism in defense_mechanisms_db.items():
            if mechanism["enabled"]:
                if mechanism.get("stats"):
                    if blocked:
                        mechanism["stats"]["blocked"] = mechanism["stats"].get("blocked", 0) + 1
                    mechanism["stats"]["response_time"] = latency
                    # Update success rate for this mechanism
                    total_for_mech = mechanism["stats"].get("total", 0) + 1
                    mechanism["stats"]["total"] = total_for_mech
                    if total_for_mech > 0:
                        mechanism["stats"]["success_rate"] = (
                            mechanism["stats"].get("blocked", 0) / total_for_mech * 100
                        )
        
        # Update statistics
        update_statistics(attack.attack_type, blocked, latency)
        
        # Update attack status with results
        if attack_id in attacks_db:
            attacks_db[attack_id]["status"] = "completed"
            attacks_db[attack_id]["message"] = f"Attack {'blocked' if blocked else 'detected'} by AI analysis"
            attacks_db[attack_id]["result"] = attack_result
            attacks_db[attack_id]["ai_analysis"] = ai_analysis
            attacks_db[attack_id]["block_decision"] = block_decision
        
        create_log(
            "SUCCESS" if blocked else "WARNING",
            "DEFENSE",
            f"Attack {attack_id}: {'Blocked' if blocked else 'Detected'} (AI Confidence: {block_decision.get('confidence', 0):.2f})",
            {
                "attack_id": attack_id,
                "blocked": blocked,
                "latency": latency,
                "threat_level": ai_analysis.get("threat_level", "Unknown"),
                "confidence": block_decision.get("confidence", 0)
            }
        )
    
    except Exception as e:
        create_log("ERROR", "ATTACK", f"Attack {attack_id} failed: {str(e)}", {
            "attack_id": attack_id,
            "error": str(e)
        })
        if attack_id in attacks_db:
            attacks_db[attack_id]["status"] = "failed"
            attacks_db[attack_id]["message"] = f"Attack failed: {str(e)}"

@app.get("/api/attacks/history")
async def get_attack_history(limit: int = 100, auth: bool = Depends(verify_api_key)):
    """Get full attack history with all details"""
    attacks = list(attacks_db.values())
    # Sort by timestamp descending (most recent first)
    attacks.sort(key=lambda x: x.get('timestamp', ''), reverse=True)
    return attacks[:limit]

@app.get("/api/attacks/{attack_id}")
async def get_attack_status(attack_id: str, auth: bool = Depends(verify_api_key)):
    """Get attack status with full details"""
    if attack_id not in attacks_db:
        raise HTTPException(status_code=404, detail="Attack not found")
    # Return full attack data including result, ai_analysis, etc.
    return attacks_db[attack_id]

# Defense endpoints
@app.get("/api/defense/status", response_model=DefenseStatus)
async def get_defense_status(auth: bool = Depends(verify_api_key)):
    """Get current defense status"""
    return DefenseStatus(**defense_status)

@app.get("/api/defense/history", response_model=List[DefenseStatus])
async def get_defense_history(auth: bool = Depends(verify_api_key)):
    """Get defense history (simplified - returns current status)"""
    return [DefenseStatus(**defense_status)]

@app.get("/api/defense/config", response_model=DefenseConfig)
async def get_defense_config(auth: bool = Depends(verify_api_key)):
    """Get defense configuration with all mechanisms"""
    mechanisms = [DefenseMechanism(**mech) for mech in defense_mechanisms_db.values()]
    return DefenseConfig(mechanisms=mechanisms)

# Note: Parameterized routes must come after static routes
@app.get("/api/defense/mechanism/{mechanism_id}", response_model=DefenseMechanism)
async def get_defense_mechanism(mechanism_id: str, auth: bool = Depends(verify_api_key)):
    """Get specific defense mechanism configuration"""
    if mechanism_id not in defense_mechanisms_db:
        raise HTTPException(status_code=404, detail="Defense mechanism not found")
    return DefenseMechanism(**defense_mechanisms_db[mechanism_id])

@app.put("/api/defense/mechanism/{mechanism_id}", response_model=DefenseMechanism)
async def update_defense_mechanism(
    mechanism_id: str,
    update: DefenseMechanismUpdate,
    auth: bool = Depends(verify_api_key)
):
    """Update defense mechanism configuration"""
    if mechanism_id not in defense_mechanisms_db:
        raise HTTPException(status_code=404, detail="Defense mechanism not found")
    
    mechanism = defense_mechanisms_db[mechanism_id]
    
    if update.enabled is not None:
        mechanism["enabled"] = update.enabled
        # Update active_defenses list
        if update.enabled and mechanism["name"] not in defense_status["active_defenses"]:
            defense_status["active_defenses"].append(mechanism["name"])
        elif not update.enabled and mechanism["name"] in defense_status["active_defenses"]:
            defense_status["active_defenses"].remove(mechanism["name"])
    
    if update.settings:
        if mechanism.get("settings"):
            mechanism["settings"].update(update.settings)
        else:
            mechanism["settings"] = update.settings
    
    defense_status["timestamp"] = datetime.now().isoformat()
    
    create_log(
        "INFO",
        "DEFENSE",
        f"Defense mechanism {mechanism['name']} updated",
        {"mechanism_id": mechanism_id, "enabled": mechanism["enabled"]}
    )
    
    return DefenseMechanism(**mechanism)

@app.post("/api/defense/mechanism/{mechanism_id}/enable")
async def enable_defense_mechanism(mechanism_id: str, auth: bool = Depends(verify_api_key)):
    """Enable a defense mechanism"""
    if mechanism_id not in defense_mechanisms_db:
        raise HTTPException(status_code=404, detail="Defense mechanism not found")
    
    defense_mechanisms_db[mechanism_id]["enabled"] = True
    mechanism = defense_mechanisms_db[mechanism_id]
    
    if mechanism["name"] not in defense_status["active_defenses"]:
        defense_status["active_defenses"].append(mechanism["name"])
    
    create_log("SUCCESS", "DEFENSE", f"Defense mechanism {mechanism['name']} enabled")
    
    return {"message": f"Defense mechanism {mechanism['name']} enabled", "status": "success"}

@app.post("/api/defense/mechanism/{mechanism_id}/disable")
async def disable_defense_mechanism(mechanism_id: str, auth: bool = Depends(verify_api_key)):
    """Disable a defense mechanism"""
    if mechanism_id not in defense_mechanisms_db:
        raise HTTPException(status_code=404, detail="Defense mechanism not found")
    
    defense_mechanisms_db[mechanism_id]["enabled"] = False
    mechanism = defense_mechanisms_db[mechanism_id]
    
    if mechanism["name"] in defense_status["active_defenses"]:
        defense_status["active_defenses"].remove(mechanism["name"])
    
    create_log("WARNING", "DEFENSE", f"Defense mechanism {mechanism['name']} disabled")
    
    return {"message": f"Defense mechanism {mechanism['name']} disabled", "status": "success"}

# Logs endpoints
@app.get("/api/logs", response_model=List[LogEntry])
async def get_logs(
    limit: int = 100,
    level: Optional[str] = None,
    auth: bool = Depends(verify_api_key)
):
    """Get system logs"""
    filtered_logs = logs_db
    if level and level != "all":
        filtered_logs = [log for log in logs_db if log["level"] == level.upper()]
    return [LogEntry(**log) for log in filtered_logs[:limit]]

@app.get("/api/logs/stream")
async def stream_logs(token: Optional[str] = None):
    """Stream logs via Server-Sent Events (simplified)"""
    # In production, implement proper SSE streaming
    return {"message": "Use WebSocket or SSE for real-time logs"}

# Statistics endpoints
@app.get("/api/statistics", response_model=Statistics)
async def get_statistics(
    time_range: Optional[str] = "24h",
    auth: bool = Depends(verify_api_key)
):
    """Get system statistics"""
    return Statistics(**statistics_db)

# AI Analysis endpoints
@app.post("/api/ai/analyze")
async def analyze_attack_ai(
    attack_data: Dict[str, Any],
    auth: bool = Depends(verify_api_key)
):
    """Analyze attack pattern using AI"""
    try:
        analysis = await ai_analyzer.analyze_attack_pattern(attack_data)
        return analysis
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI analysis failed: {str(e)}")

@app.post("/api/ai/recommendations")
async def get_ai_recommendations(
    auth: bool = Depends(verify_api_key)
):
    """Get AI-powered defense recommendations"""
    try:
        # Get recent attack history
        recent_attacks = list(attacks_db.values())[-20:]  # Last 20 attacks
        recommendations = await ai_analyzer.generate_defense_recommendations(recent_attacks)
        return recommendations
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate recommendations: {str(e)}")

# Port Scanner endpoint
class PortScanRequest(BaseModel):
    target_url: str
    ports: Optional[List[int]] = None
    scan_type: Optional[str] = "common"  # common, all, custom

class PortScanResponse(BaseModel):
    scan_id: str
    target: str
    host: str
    open_ports: List[Dict[str, Any]]
    closed_ports: List[int]
    filtered_ports: List[int]
    total_scanned: int
    duration: float
    timestamp: str
    port_details: List[Dict[str, Any]]

@app.post("/api/scan/ports", response_model=PortScanResponse)
async def scan_ports(scan_request: PortScanRequest, auth: bool = Depends(verify_api_key)):
    """Scan ports on target server"""
    from urllib.parse import urlparse
    
    if not scan_request.target_url:
        raise HTTPException(status_code=400, detail="Target URL is required")
    
    scan_id = str(uuid.uuid4())
    parsed_url = urlparse(scan_request.target_url)
    host = parsed_url.netloc or parsed_url.path.split('/')[0]
    
    # Remove port if present
    if ':' in host:
        host = host.split(':')[0]
    
    # Determine ports to scan
    if scan_request.ports:
        ports_to_scan = scan_request.ports
    elif scan_request.scan_type == "all":
        ports_to_scan = list(range(1, 65536))  # All ports (will be limited)
    else:
        # Common ports
        ports_to_scan = [
            21, 22, 23, 25, 53, 80, 110, 111, 135, 139, 143, 443, 445, 
            993, 995, 1723, 3306, 3389, 5432, 5900, 8080, 8443, 8888, 9000
        ]
    
    # Limit scan to reasonable number
    if len(ports_to_scan) > 100:
        ports_to_scan = ports_to_scan[:100]
    
    start_time = time.time()
    open_ports = []
    closed_ports = []
    filtered_ports = []
    port_details = []
    
    create_log("INFO", "SCAN", f"Port scan started on {host}", {
        "scan_id": scan_id,
        "target": scan_request.target_url,
        "ports_count": len(ports_to_scan)
    })
    
    # Port service mapping
    port_services = {
        21: "FTP", 22: "SSH", 23: "Telnet", 25: "SMTP", 53: "DNS",
        80: "HTTP", 110: "POP3", 111: "RPC", 135: "MSRPC", 139: "NetBIOS",
        143: "IMAP", 443: "HTTPS", 445: "SMB", 993: "IMAPS", 995: "POP3S",
        1723: "PPTP", 3306: "MySQL", 3389: "RDP", 5432: "PostgreSQL",
        5900: "VNC", 8080: "HTTP-Proxy", 8443: "HTTPS-Alt", 8888: "HTTP-Alt", 9000: "SonarQube"
    }
    
    for port in ports_to_scan:
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(1)
            result = sock.connect_ex((host, port))
            
            service = port_services.get(port, "Unknown")
            
            if result == 0:
                # Port is open
                open_ports.append({
                    "port": port,
                    "service": service,
                    "status": "open"
                })
                port_details.append({
                    "port": port,
                    "service": service,
                    "status": "open",
                    "protocol": "TCP"
                })
            else:
                closed_ports.append(port)
                port_details.append({
                    "port": port,
                    "service": service,
                    "status": "closed",
                    "protocol": "TCP"
                })
            
            sock.close()
        except socket.gaierror:
            filtered_ports.append(port)
            port_details.append({
                "port": port,
                "service": port_services.get(port, "Unknown"),
                "status": "filtered",
                "protocol": "TCP"
            })
        except Exception:
            filtered_ports.append(port)
        
        # Small delay to avoid overwhelming
        await asyncio.sleep(0.05)
    
    duration = time.time() - start_time
    
    # AI analysis of scan results
    ai_analysis = await ai_analyzer.analyze_attack_pattern({
        "attack_type": "port_scan",
        "target_url": scan_request.target_url,
        "open_ports": len(open_ports),
        "ports": [p["port"] for p in open_ports]
    })
    
    create_log("SUCCESS", "SCAN", f"Port scan completed: {len(open_ports)} open ports found", {
        "scan_id": scan_id,
        "open_ports": len(open_ports),
        "duration": duration
    })
    
    return PortScanResponse(
        scan_id=scan_id,
        target=scan_request.target_url,
        host=host,
        open_ports=open_ports,
        closed_ports=closed_ports,
        filtered_ports=filtered_ports,
        total_scanned=len(ports_to_scan),
        duration=duration,
        timestamp=datetime.now().isoformat(),
        port_details=port_details
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

