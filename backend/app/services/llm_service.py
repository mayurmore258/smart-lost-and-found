import base64
import json
import logging
import re
from pathlib import Path
from typing import Any, Dict, List, Optional
import httpx
from pydantic import BaseModel

from app.config import settings

logger = logging.getLogger(__name__)


class LLMReasoningResult(BaseModel):
    assessment: str  # 'potential_match', 'uncertain', 'no_match'
    reasons: List[str]
    verification_question: str
    provider: str
    model: str


def encode_image_to_base64(image_path: Path) -> Optional[str]:
    """Read an image from disk and return its base64 data URI string."""
    if not image_path.exists():
        return None
    try:
        suffix = image_path.suffix.lower().lstrip(".")
        mime = f"image/{suffix}" if suffix != "jpg" else "image/jpeg"
        with open(image_path, "rb") as f:
            b64_data = base64.b64encode(f.read()).decode("utf-8")
        return f"data:{mime};base64,{b64_data}"
    except Exception as e:
        logger.error(f"Failed to encode image at {image_path}: {e}")
        return None


def parse_json_response(raw_text: Optional[str]) -> Dict[str, Any]:
    """Extract and parse JSON object from raw LLM output text safely."""
    if not raw_text or not isinstance(raw_text, str) or not raw_text.strip():
        return {}

    # Strip <think>...</think> reasoning tags if emitted by reasoning models
    cleaned = re.sub(r"<think>.*?</think>", "", raw_text, flags=re.DOTALL).strip()
    if not cleaned:
        cleaned = raw_text.strip()

    # 1. Look for markdown code fence json ```json { ... } ```
    match = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", cleaned, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(1))
        except Exception:
            pass

    # 2. Look for any balanced or outermost JSON object {...}
    match = re.search(r"(\{.*\})", cleaned, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(1))
        except Exception:
            pass

    # 3. Direct JSON parse
    try:
        return json.loads(cleaned)
    except Exception:
        pass

    # 4. Fallback heuristic extraction if model answered in natural language text
    lower = cleaned.lower()
    if "potential_match" in lower or ("potential" in lower and "match" in lower and "no match" not in lower and "not a match" not in lower):
        assessment = "potential_match"
    elif "uncertain" in lower or "unclear" in lower or "verification" in lower or "verify" in lower:
        assessment = "uncertain"
    elif "no_match" in lower or "no match" in lower:
        assessment = "no_match"
    else:
        assessment = "uncertain"

    # Extract reasons
    lines = [line.strip("-* \t") for line in cleaned.splitlines() if line.strip("-* \t")]
    reasons = [line for line in lines if len(line) > 10][:4]
    if not reasons:
        reasons = [cleaned[:300]] if cleaned else ["Visual and contextual comparison evaluated by AI."]

    # Extract question if present
    question = "Can you describe any distinctive mark, damage, or accessory on the item?"
    for line in lines:
        if "?" in line and len(line) > 15:
            question = line.strip()
            break

    return {
        "assessment": assessment,
        "reasons": reasons,
        "verification_question": question,
    }


class BaseLLMProvider:
    name: str
    api_key: str
    vision_models: List[str] = []
    text_models: List[str] = []

    def is_configured(self) -> bool:
        return bool(self.api_key and self.api_key.strip())

    def get_models(self, require_vision: bool) -> List[str]:
        if require_vision:
            return self.vision_models
        # For text reasoning, text models followed by vision models as backup
        return self.text_models or self.vision_models

    def supports_vision(self) -> bool:
        return len(self.vision_models) > 0

    async def call_model(
        self,
        model: str,
        prompt: str,
        image_path: Optional[Path] = None,
    ) -> LLMReasoningResult:
        raise NotImplementedError


# ============================================================
# 1. GROQ PROVIDER
# ============================================================
class GroqProvider(BaseLLMProvider):
    name = "Groq"
    # Groq decommissioned Llama 3.2 vision preview models; currently no vision model is available on standard tier.
    # Kept as skipped for vision tasks and preserved for text reasoning fallback.
    vision_models: List[str] = []
    text_models = ["llama-3.3-70b-versatile", "llama-3.1-8b-instant"]

    def __init__(self, api_key: str):
        self.api_key = api_key
        self.api_url = "https://api.groq.com/openai/v1/chat/completions"

    async def call_model(
        self,
        model: str,
        prompt: str,
        image_path: Optional[Path] = None,
    ) -> LLMReasoningResult:
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

        user_content: List[Dict[str, Any]] = [{"type": "text", "text": prompt}]

        if image_path and image_path.exists() and model in self.vision_models:
            b64_url = encode_image_to_base64(image_path)
            if b64_url:
                user_content.append({"type": "image_url", "image_url": {"url": b64_url}})

        payload = {
            "model": model,
            "messages": [
                {
                    "role": "system",
                    "content": "You are an expert AI lost-and-found investigator. Return strictly valid JSON.",
                },
                {"role": "user", "content": user_content if len(user_content) > 1 else prompt},
            ],
            "response_format": {"type": "json_object"},
            "temperature": 0.2,
        }

        async with httpx.AsyncClient(timeout=25.0) as client:
            resp = await client.post(self.api_url, headers=headers, json=payload)
            resp.raise_for_status()
            data = resp.json()
            raw_text = data["choices"][0]["message"]["content"]
            parsed = parse_json_response(raw_text)

            return LLMReasoningResult(
                assessment=parsed.get("assessment", "uncertain"),
                reasons=parsed.get("reasons", ["Visual/contextual similarity evaluated by Groq"]),
                verification_question=parsed.get("verification_question", "Can you describe any unique mark on this item?"),
                provider=self.name,
                model=model,
            )


# ============================================================
# 2. COHERE PROVIDER
# ============================================================
class CohereProvider(BaseLLMProvider):
    name = "Cohere"
    # Cohere standard chat API does not support vision
    vision_models = []
    text_models = ["command-r-plus", "command-r", "command-light"]

    def __init__(self, api_key: str):
        self.api_key = api_key
        self.api_url = "https://api.cohere.com/v2/chat"

    async def call_model(
        self,
        model: str,
        prompt: str,
        image_path: Optional[Path] = None,
    ) -> LLMReasoningResult:
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

        payload = {
            "model": model,
            "messages": [
                {
                    "role": "user",
                    "content": prompt + "\n\nIMPORTANT: Return strictly valid JSON containing keys: 'assessment', 'reasons', 'verification_question'.",
                }
            ],
            "response_format": {"type": "json_object"},
            "temperature": 0.2,
        }

        async with httpx.AsyncClient(timeout=25.0) as client:
            resp = await client.post(self.api_url, headers=headers, json=payload)
            resp.raise_for_status()
            data = resp.json()
            raw_text = data["message"]["content"][0]["text"]
            parsed = parse_json_response(raw_text)

            return LLMReasoningResult(
                assessment=parsed.get("assessment", "uncertain"),
                reasons=parsed.get("reasons", ["Contextual comparison evaluated by Cohere"]),
                verification_question=parsed.get("verification_question", "Please describe any specific markings on your item."),
                provider=self.name,
                model=model,
            )


# ============================================================
# 3. SAMBANOVA PROVIDER
# ============================================================
class SambaNovaProvider(BaseLLMProvider):
    name = "SambaNova"
    # No vision model currently available on this API tier; kept as skipped for vision tasks and preserved for text reasoning.
    vision_models: List[str] = []
    text_models = ["Meta-Llama-3.1-70B-Instruct", "Meta-Llama-3.1-8B-Instruct"]

    def __init__(self, api_key: str):
        self.api_key = api_key
        self.api_url = "https://api.sambanova.ai/v1/chat/completions"

    async def call_model(
        self,
        model: str,
        prompt: str,
        image_path: Optional[Path] = None,
    ) -> LLMReasoningResult:
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

        user_content: List[Dict[str, Any]] = [{"type": "text", "text": prompt}]

        if image_path and image_path.exists() and model in self.vision_models:
            b64_url = encode_image_to_base64(image_path)
            if b64_url:
                user_content.append({"type": "image_url", "image_url": {"url": b64_url}})

        payload = {
            "model": model,
            "messages": [
                {
                    "role": "system",
                    "content": "You are an expert AI lost-and-found investigator. Return strictly valid JSON.",
                },
                {"role": "user", "content": user_content if len(user_content) > 1 else prompt},
            ],
            "response_format": {"type": "json_object"},
            "temperature": 0.2,
        }

        async with httpx.AsyncClient(timeout=25.0) as client:
            resp = await client.post(self.api_url, headers=headers, json=payload)
            resp.raise_for_status()
            data = resp.json()
            raw_text = data["choices"][0]["message"]["content"]
            parsed = parse_json_response(raw_text)

            return LLMReasoningResult(
                assessment=parsed.get("assessment", "uncertain"),
                reasons=parsed.get("reasons", ["Visual/contextual similarity evaluated by SambaNova"]),
                verification_question=parsed.get("verification_question", "Can you confirm a unique detail of the item?"),
                provider=self.name,
                model=model,
            )


# ============================================================
# 4. OPENROUTER PROVIDER
# ============================================================
class OpenRouterProvider(BaseLLMProvider):
    name = "OpenRouter"
    # Strictly openrouter/free as instructed
    vision_models = ["openrouter/free"]
    text_models = ["openrouter/free"]

    def __init__(self, api_key: str):
        self.api_key = api_key
        self.api_url = "https://openrouter.ai/api/v1/chat/completions"

    async def call_model(
        self,
        model: str,
        prompt: str,
        image_path: Optional[Path] = None,
    ) -> LLMReasoningResult:
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://smart-lost-and-found.local",
            "X-Title": "Smart AI Lost and Found",
        }

        user_content: List[Dict[str, Any]] = [{"type": "text", "text": prompt}]

        if image_path and image_path.exists():
            b64_url = encode_image_to_base64(image_path)
            if b64_url:
                user_content.append({"type": "image_url", "image_url": {"url": b64_url}})

        payload = {
            "model": model,  # openrouter/free
            "messages": [
                {
                    "role": "system",
                    "content": "You are an expert AI lost-and-found investigator. Return strictly valid JSON.",
                },
                {"role": "user", "content": user_content if len(user_content) > 1 else prompt},
            ],
            "temperature": 0.2,
        }

        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(self.api_url, headers=headers, json=payload)
            resp.raise_for_status()
            data = resp.json()
            choice = data.get("choices", [{}])[0]
            message = choice.get("message", {})
            raw_text = message.get("content") or message.get("reasoning") or ""
            if isinstance(raw_text, list):
                raw_text = "".join(
                    part.get("text", "") if isinstance(part, dict) else str(part)
                    for part in raw_text
                )
            parsed = parse_json_response(raw_text)

            return LLMReasoningResult(
                assessment=parsed.get("assessment", "uncertain"),
                reasons=parsed.get("reasons", ["Evaluated via OpenRouter free model router"]),
                verification_question=parsed.get("verification_question", "Can you identify any distinctive feature of the item?"),
                provider=self.name,
                model=model,
            )


# ============================================================
# 5. GEMINI PROVIDER
# ============================================================
class GeminiProvider(BaseLLMProvider):
    name = "Gemini"
    vision_models = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-2.5-pro", "gemini-1.5-flash-latest"]
    text_models = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-2.5-pro"]

    def __init__(self, api_key: str):
        self.api_key = api_key

    async def call_model(
        self,
        model: str,
        prompt: str,
        image_path: Optional[Path] = None,
    ) -> LLMReasoningResult:
        headers = {
            "x-goog-api-key": self.api_key,
            "Content-Type": "application/json",
        }
        api_url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"

        parts: List[Dict[str, Any]] = [{"text": prompt}]

        if image_path and image_path.exists():
            try:
                suffix = image_path.suffix.lower().lstrip(".")
                mime = f"image/{suffix}" if suffix != "jpg" else "image/jpeg"
                with open(image_path, "rb") as f:
                    raw_b64 = base64.b64encode(f.read()).decode("utf-8")
                parts.append({"inline_data": {"mime_type": mime, "data": raw_b64}})
            except Exception as e:
                logger.error(f"Error encoding image for Gemini: {e}")

        payload = {
            "contents": [{"parts": parts}],
            "generationConfig": {
                "response_mime_type": "application/json",
                "temperature": 0.2,
            },
        }

        async with httpx.AsyncClient(timeout=25.0) as client:
            resp = await client.post(api_url, headers=headers, json=payload)
            if resp.status_code == 404:
                # Try v1 endpoint as fallback for stable production models
                alt_url = f"https://generativelanguage.googleapis.com/v1/models/{model}:generateContent"
                alt_resp = await client.post(alt_url, headers=headers, json=payload)
                if alt_resp.status_code == 200:
                    resp = alt_resp
                else:
                    resp.raise_for_status()
            else:
                resp.raise_for_status()

            data = resp.json()
            raw_text = data["candidates"][0]["content"]["parts"][0]["text"]
            parsed = parse_json_response(raw_text)

            return LLMReasoningResult(
                assessment=parsed.get("assessment", "uncertain"),
                reasons=parsed.get("reasons", ["Visual and contextual reasoning evaluated by Gemini"]),
                verification_question=parsed.get("verification_question", "Can you describe a specific hidden detail or mark?"),
                provider=self.name,
                model=model,
            )


# ============================================================
# UNIFIED LLM SERVICE WITH TWO-LEVEL FALLBACK
# ============================================================
class LLMService:
    def __init__(self):
        self._init_providers()

    def _init_providers(self):
        # Strict order: Groq -> Cohere -> SambaNova -> OpenRouter -> Gemini
        self.providers: List[BaseLLMProvider] = [
            GroqProvider(settings.GROQ_API_KEY),
            CohereProvider(settings.COHERE_API_KEY),
            SambaNovaProvider(settings.SAMBANOVA_API_KEY),
            OpenRouterProvider(settings.OPENROUTER_API_KEY),
            GeminiProvider(settings.GEMINI_API_KEY),
        ]

    def build_reasoning_prompt(
        self,
        lost_data: Dict[str, Any],
        found_data: Dict[str, Any],
        similarity: float,
    ) -> str:
        return f"""You are an advanced AI Lost and Found Investigator.

TASK:
Analyze whether the LOST item and the FOUND item candidate are the same physical item.
You are given metadata and a visual CLIP cosine similarity score.
Remember: Visual similarity is EVIDENCE, NOT proof. You must examine contextual facts carefully.

LOST ITEM REPORT:
- Category: {lost_data.get('category')}
- Description: {lost_data.get('description')}
- Color: {lost_data.get('color')}
- Brand: {lost_data.get('brand') or 'Not specified'}
- Location: {lost_data.get('location')}
- Date/Time: {lost_data.get('date_time')}

FOUND ITEM CANDIDATE:
- Category: {found_data.get('category')}
- Description: {found_data.get('description')}
- Color: {found_data.get('color')}
- Brand: {found_data.get('brand') or 'Not specified'}
- Location: {found_data.get('location')}
- Date/Time: {found_data.get('date_time')}

CLIP VISUAL SIMILARITY SCORE: {similarity:.4f} (scale 0.0 to 1.0)

EVALUATION CRITERIA:
1. Appearance, color, shape, and silhouette
2. Brand, logos, labels
3. Patterns, texture, materials
4. Accessories, attachments, stickers, keychains
5. Distinctive marks, scratches, visible wear/damage
6. Plausibility of location and date/time correlation

INSTRUCTIONS:
Return a JSON object with:
1. "assessment": exactly one of "potential_match", "uncertain", "no_match"
2. "reasons": a list of concise strings detailing the matching and mismatching points
3. "verification_question": a non-obvious question about a distinctive detail that only the true owner would know, without giving away private information.
"""

    async def evaluate_candidate(
        self,
        lost_data: Dict[str, Any],
        found_data: Dict[str, Any],
        similarity: float,
        found_image_path: Optional[Path] = None,
        require_vision: bool = False,
    ) -> LLMReasoningResult:
        """
        Evaluates a candidate using two-level fallback across providers.
        Level 1: try compatible configured free models within current provider.
        Level 2: if all fail, move to next provider in strict order:
                 Groq -> Cohere -> SambaNova -> OpenRouter -> Gemini.
        STOP immediately after first successful response!
        """
        # If mock mode is explicitly enabled or no API keys are present (safe local testing mode)
        has_any_key = any(p.is_configured() for p in self.providers)
        if settings.MOCK_AI_SERVICES or not has_any_key:
            return self._generate_mock_reasoning(lost_data, found_data, similarity)

        prompt = self.build_reasoning_prompt(lost_data, found_data, similarity)

        # Iterate providers in strict required order
        for provider in self.providers:
            if not provider.is_configured():
                continue

            if require_vision and not provider.supports_vision():
                logger.info(f"Skipping provider {provider.name} because task requires vision reasoning.")
                continue

            models = provider.get_models(require_vision=require_vision)
            if not models:
                continue

            # LEVEL 1 FALLBACK: iterate compatible models inside this provider
            for model in models:
                try:
                    logger.info(f"Trying provider={provider.name} model={model}...")
                    result = await provider.call_model(
                        model=model,
                        prompt=prompt,
                        image_path=found_image_path,
                    )
                    # STOP IMMEDIATELY after first success to preserve free quota
                    logger.info(f"Successfully obtained reasoning from {provider.name} ({model}).")
                    return result

                except httpx.HTTPStatusError as e:
                    status_code = e.response.status_code
                    logger.warning(f"{provider.name} ({model}) HTTP error {status_code}: {e.response.text}")
                    if status_code == 401:
                        # Bad key / unauthorized -> skip entire provider
                        logger.warning(f"Invalid key for {provider.name}. Skipping provider.")
                        break
                    elif status_code == 404:
                        # Model unavailable -> try next model in current provider
                        logger.info(f"Model {model} unavailable for {provider.name}. Trying next model...")
                        continue
                    elif status_code == 429:
                        # Rate limit -> move to next model or next provider
                        logger.warning(f"Rate limited on {provider.name} ({model}). Moving on.")
                        continue
                    else:
                        continue

                except httpx.TimeoutException:
                    logger.warning(f"Timeout on {provider.name} ({model}). Trying next fallback...")
                    continue

                except Exception as e:
                    logger.warning(f"Unexpected error with {provider.name} ({model}): {e}. Fallback continues.")
                    continue

        # LEVEL 2 FALLBACK exhausted: if all real providers failed or threw errors,
        # return a safe controlled application-level result instead of crashing the matching workflow
        logger.error("All configured LLM providers failed or exhausted. Providing controlled fallback reasoning.")
        return self._generate_mock_reasoning(lost_data, found_data, similarity, fallback_notice=True)

    def _generate_mock_reasoning(
        self,
        lost_data: Dict[str, Any],
        found_data: Dict[str, Any],
        similarity: float,
        fallback_notice: bool = False,
    ) -> LLMReasoningResult:
        """
        Deterministic, safe reasoning output for testing/offline or fallback scenarios.
        No real API calls or quotas are consumed.
        """
        category_match = lost_data.get("category", "").lower() == found_data.get("category", "").lower()
        color_match = lost_data.get("color", "").lower() in found_data.get("color", "").lower() or \
                      found_data.get("color", "").lower() in lost_data.get("color", "").lower()

        reasons = []
        if similarity >= 0.70:
            reasons.append(f"High visual similarity ({similarity:.2f}) observed in shape, geometry, and color profile.")
        elif similarity >= 0.50:
            reasons.append(f"Moderate visual similarity ({similarity:.2f}) with consistent general profile.")
        else:
            reasons.append(f"Low visual similarity ({similarity:.2f}) indicates probable difference.")

        if category_match:
            reasons.append(f"Category matches: '{lost_data.get('category')}'.")
        else:
            reasons.append(f"Category differs: lost is '{lost_data.get('category')}', found is '{found_data.get('category')}'.")

        if color_match:
            reasons.append(f"Primary color '{lost_data.get('color')}' matches candidate color.")
        else:
            reasons.append(f"Color discrepancy noted: '{lost_data.get('color')}' vs '{found_data.get('color')}'.")

        # Determine assessment
        if similarity >= 0.75 and category_match:
            assessment = "potential_match"
            question = f"What specific detail or brand marking is present on this {lost_data.get('category', 'item')}?"
        elif similarity >= 0.45 and (category_match or color_match):
            assessment = "uncertain"
            question = f"Can you describe any distinctive scratch, sticker, or accessory attached to your {lost_data.get('category', 'item')}?"
        else:
            assessment = "no_match"
            question = "Can you confirm the item serial number or brand?"

        provider_tag = "SafeMockReasoner" if not fallback_notice else "ControlledFallbackEngine"
        return LLMReasoningResult(
            assessment=assessment,
            reasons=reasons,
            verification_question=question,
            provider=provider_tag,
            model="deterministic-heuristic-v1",
        )


llm_service = LLMService()
