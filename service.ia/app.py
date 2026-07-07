import json
import os

from typing import Literal

import requests

from dotenv import load_dotenv

from flask import Flask
from flask import jsonify
from flask import request

from flask_cors import CORS

from google import genai

from pydantic import BaseModel
from pydantic import Field
from pydantic import ValidationError


BASE_DIR = os.path.dirname(
    os.path.abspath(__file__)
)

load_dotenv(
    os.path.join(BASE_DIR, ".env"),
    override=True
)


GEMINI_API_KEY = (
    os.getenv("GEMINI_API_KEY")
    or ""
).strip()

GEMINI_MODEL = (
    os.getenv("GEMINI_MODEL")
    or "gemini-3.5-flash"
).strip()

SPRING_API = (
    os.getenv("SPRING_API")
    or "http://localhost:8081/api"
).rstrip("/")

AI_PORT = int(
    os.getenv("AI_PORT")
    or "5004"
)


if not GEMINI_API_KEY:
    raise RuntimeError(
        "GEMINI_API_KEY est absente du fichier .env"
    )


app = Flask(__name__)

CORS(
    app,
    resources={
        r"/api/*": {
            "origins": [
                "http://localhost:4200",
                "http://127.0.0.1:4200"
            ]
        }
    }
)


client = genai.Client(
    api_key=GEMINI_API_KEY
)


# =========================================================
# Exceptions
# =========================================================

class SpringApiError(Exception):

    def __init__(
        self,
        status_code: int,
        message: str
    ):
        super().__init__(message)

        self.status_code = status_code
        self.message = message


# =========================================================
# Pydantic models
# =========================================================

class CoverLetterResponse(BaseModel):

    subject: str = Field(
        description="Objet de la lettre ou de l'email."
    )

    greeting: str = Field(
        description="Formule de salutation."
    )

    introduction: str = Field(
        description="Introduction personnalisée."
    )

    body_paragraphs: list[str] = Field(
        description="Paragraphes principaux de la lettre."
    )

    closing: str = Field(
        description="Conclusion de la lettre."
    )

    signature_placeholder: str = Field(
        description="Emplacement de la signature."
    )

    full_letter: str = Field(
        description="Lettre complète prête à copier."
    )


class InterviewQuestion(BaseModel):

    question: str

    category: Literal[
        "TECHNICAL",
        "BEHAVIORAL",
        "COMPANY",
        "MOTIVATION",
        "EXPERIENCE"
    ]

    difficulty: Literal[
        "EASY",
        "MEDIUM",
        "HARD"
    ]

    why_asked: str

    answer_guidance: str

    example_answer: str


class InterviewPreparationResponse(BaseModel):

    introduction: str

    questions: list[InterviewQuestion]

    technical_topics: list[str]

    questions_to_ask_recruiter: list[str]

    preparation_checklist: list[str]

    final_advice: str


class MatchAnalysisResponse(BaseModel):

    score: int = Field(
        ge=0,
        le=100
    )

    compatibility_level: Literal[
        "LOW",
        "MEDIUM",
        "GOOD",
        "EXCELLENT"
    ]

    summary: str

    strengths: list[str]

    gaps: list[str]

    missing_keywords: list[str]

    cv_improvements: list[str]

    application_recommendations: list[str]

    disclaimer: str


# =========================================================
# Helpers
# =========================================================

def get_authorization_header() -> str:

    authorization = (
        request.headers.get("Authorization")
        or ""
    ).strip()

    if not authorization.startswith("Bearer "):
        raise SpringApiError(
            401,
            "Authentification requise."
        )

    return authorization


def spring_get(
    path: str,
    authorization: str
) -> dict:

    url = f"{SPRING_API}/{path.lstrip('/')}"

    try:
        response = requests.get(
            url,
            headers={
                "Authorization": authorization,
                "Accept": "application/json"
            },
            timeout=15
        )

    except requests.ConnectionError as exception:
        raise SpringApiError(
            503,
            "Impossible de contacter le backend Spring Boot."
        ) from exception

    except requests.Timeout as exception:
        raise SpringApiError(
            504,
            "Le backend Spring Boot ne répond pas."
        ) from exception

    if response.status_code >= 400:

        try:
            error_body = response.json()

            message = (
                error_body.get("message")
                or "Erreur du backend Spring Boot."
            )

        except ValueError:
            message = (
                "Erreur du backend Spring Boot."
            )

        raise SpringApiError(
            response.status_code,
            message
        )

    return response.json()


def get_application_context(
    application_id: int,
    authorization: str
) -> dict:

    application = spring_get(
        f"applications/{application_id}",
        authorization
    )

    job_offer_id = application.get(
        "jobOfferId"
    )

    if not job_offer_id:
        raise SpringApiError(
            400,
            "La candidature ne contient aucune offre d'emploi."
        )

    job_offer = spring_get(
        f"job-offers/{job_offer_id}",
        authorization
    )

    return {
        "application": application,
        "job_offer": job_offer
    }


def get_language_instruction(
    language: str
) -> str:

    instructions = {
        "fr": (
            "Réponds entièrement en français."
        ),

        "ar": (
            "أجب باللغة العربية الفصحى الواضحة."
        ),

        "en": (
            "Respond entirely in English."
        )
    }

    return instructions.get(
        language,
        instructions["fr"]
    )


def generate_structured_response(
    prompt: str,
    response_model: type[BaseModel]
) -> BaseModel:

    interaction = client.interactions.create(
        model=GEMINI_MODEL,
        input=prompt,
        generation_config={
            "thinking_level": "low"
        },
        response_format={
            "type": "text",
            "mime_type": "application/json",
            "schema":
                response_model.model_json_schema()
        }
    )

    if not interaction.output_text:
        raise RuntimeError(
            "Gemini n'a retourné aucune réponse."
        )

    return response_model.model_validate_json(
        interaction.output_text
    )


def read_json_body() -> dict:

    body = request.get_json(
        silent=True
    )

    if not isinstance(body, dict):
        raise SpringApiError(
            400,
            "Le body JSON est obligatoire."
        )

    return body


def read_application_id(
    body: dict
) -> int:

    application_id = body.get(
        "applicationId"
    )

    if application_id is None:
        raise SpringApiError(
            400,
            "applicationId est obligatoire."
        )

    try:
        parsed_id = int(
            application_id
        )

    except (
        TypeError,
        ValueError
    ) as exception:
        raise SpringApiError(
            400,
            "applicationId est invalide."
        ) from exception

    if parsed_id <= 0:
        raise SpringApiError(
            400,
            "applicationId est invalide."
        )

    return parsed_id


def clean_optional_text(
    value,
    max_length: int
) -> str:

    if value is None:
        return ""

    cleaned_value = str(
        value
    ).strip()

    return cleaned_value[:max_length]


# =========================================================
# Routes
# =========================================================

@app.get("/health")
def health():

    return jsonify({
        "status": "UP",
        "service": "CareerPilot AI",
        "model": GEMINI_MODEL,
        "springApi": SPRING_API
    })


@app.post("/api/ai/cover-letter")
def generate_cover_letter():

    body = read_json_body()

    authorization = (
        get_authorization_header()
    )

    application_id = (
        read_application_id(body)
    )

    language = (
        body.get("language")
        or "fr"
    ).lower()

    tone = (
        body.get("tone")
        or "professional"
    ).lower()

    candidate_summary = clean_optional_text(
        body.get("candidateSummary"),
        5000
    )

    context = get_application_context(
        application_id,
        authorization
    )

    prompt = f"""
Tu es un expert en recrutement et en rédaction
de lettres de motivation.

{get_language_instruction(language)}

Génère une lettre de motivation personnalisée,
professionnelle, naturelle et non générique.

Ton souhaité :
{tone}

Informations de la candidature :
{json.dumps(
    context["application"],
    ensure_ascii=False,
    indent=2
)}

Informations de l'offre :
{json.dumps(
    context["job_offer"],
    ensure_ascii=False,
    indent=2
)}

Résumé du candidat :
{candidate_summary or "Aucun résumé supplémentaire fourni."}

Règles :
- Ne pas inventer de diplôme, compétence ou expérience.
- Mettre en valeur uniquement les informations disponibles.
- Mentionner clairement le poste et l'entreprise.
- Éviter les phrases trop génériques.
- Produire une lettre prête à être copiée.
- La lettre doit avoir une longueur raisonnable.
- Utiliser un style humain et professionnel.
"""

    result = generate_structured_response(
        prompt,
        CoverLetterResponse
    )

    return jsonify(
        result.model_dump()
    )


@app.post("/api/ai/interview-preparation")
def prepare_interview():

    body = read_json_body()

    authorization = (
        get_authorization_header()
    )

    application_id = (
        read_application_id(body)
    )

    language = (
        body.get("language")
        or "fr"
    ).lower()

    question_count = body.get(
        "questionCount",
        8
    )

    try:
        question_count = int(
            question_count
        )

    except (
        TypeError,
        ValueError
    ):
        question_count = 8

    question_count = max(
        3,
        min(
            question_count,
            12
        )
    )

    candidate_summary = clean_optional_text(
        body.get("candidateSummary"),
        5000
    )

    context = get_application_context(
        application_id,
        authorization
    )

    prompt = f"""
Tu es un recruteur senior et un coach
spécialisé dans la préparation d'entretiens.

{get_language_instruction(language)}

Prépare le candidat pour cette candidature.

Nombre exact de questions :
{question_count}

Informations de la candidature :
{json.dumps(
    context["application"],
    ensure_ascii=False,
    indent=2
)}

Informations de l'offre :
{json.dumps(
    context["job_offer"],
    ensure_ascii=False,
    indent=2
)}

Résumé du candidat :
{candidate_summary or "Aucun résumé supplémentaire fourni."}

Règles :
- Générer des questions pertinentes pour l'offre.
- Mélanger questions techniques, comportementales,
  motivation et expérience.
- Fournir pour chaque question une stratégie
  de réponse claire.
- Les exemples de réponses ne doivent pas inventer
  d'expérience personnelle.
- Ajouter les sujets techniques à réviser.
- Ajouter des questions intelligentes à poser au recruteur.
- Donner une checklist pratique avant l'entretien.
"""

    result = generate_structured_response(
        prompt,
        InterviewPreparationResponse
    )

    return jsonify(
        result.model_dump()
    )


@app.post("/api/ai/match-analysis")
def analyze_cv_match():

    body = read_json_body()

    authorization = (
        get_authorization_header()
    )

    application_id = (
        read_application_id(body)
    )

    language = (
        body.get("language")
        or "fr"
    ).lower()

    cv_text = clean_optional_text(
        body.get("cvText"),
        30000
    )

    if len(cv_text) < 50:
        raise SpringApiError(
            400,
            "Le contenu du CV est trop court."
        )

    context = get_application_context(
        application_id,
        authorization
    )

    prompt = f"""
Tu es un expert ATS, recrutement et optimisation de CV.

{get_language_instruction(language)}

Compare le CV du candidat avec l'offre d'emploi.

Informations de la candidature :
{json.dumps(
    context["application"],
    ensure_ascii=False,
    indent=2
)}

Informations de l'offre :
{json.dumps(
    context["job_offer"],
    ensure_ascii=False,
    indent=2
)}

Contenu du CV :
----------------
{cv_text}
----------------

Règles :
- Attribuer un score réaliste entre 0 et 100.
- Ne pas valoriser une compétence absente du CV.
- Identifier clairement les forces.
- Identifier les écarts entre le CV et l'offre.
- Extraire les mots-clés importants absents du CV.
- Proposer des améliorations concrètes.
- Ne pas recommander de mentir.
- Le résultat reste une estimation informative.
"""

    result = generate_structured_response(
        prompt,
        MatchAnalysisResponse
    )

    return jsonify(
        result.model_dump()
    )


# =========================================================
# Error handlers
# =========================================================

@app.errorhandler(SpringApiError)
def handle_spring_api_error(
    exception: SpringApiError
):

    return jsonify({
        "status": exception.status_code,
        "message": exception.message
    }), exception.status_code


@app.errorhandler(ValidationError)
def handle_validation_error(
    exception: ValidationError
):

    return jsonify({
        "status": 502,
        "message":
            "La réponse générée par l'IA est invalide.",
        "details":
            exception.errors(
                include_url=False
            )
    }), 502


@app.errorhandler(Exception)
def handle_unexpected_error(
    exception: Exception
):

    app.logger.exception(
        "Erreur inattendue du service IA"
    )

    return jsonify({
        "status": 500,
        "message":
            "Impossible de générer la réponse IA.",
        "details": str(exception)
    }), 500


if __name__ == "__main__":

    app.run(
        host="0.0.0.0",
        port=AI_PORT,
        debug=True
    )