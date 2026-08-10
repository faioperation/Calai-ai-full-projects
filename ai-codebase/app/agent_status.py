from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.business_store import get_business_config, save_business_config, load_all_business_configs
from app.vapi_client import set_phone_ringing_hook, clear_phone_ringing_hook, get_phone_number_details

router = APIRouter(prefix="/api", tags=["Agent Status Control"])


def _find_config_by_assistant_id(assistant_id: str):
    """Finds the business config that matches the given assistant_id.
    Returns (business_id, config) tuple or (None, None) if not found."""
    configs = load_all_business_configs()
    for b_id, cfg in configs.items():
        if cfg.get("assistant_id") == assistant_id:
            return b_id, cfg
    return None, None


class AgentStatusPayload(BaseModel):
    enabled: Optional[bool] = None
    status: Optional[bool] = None
    agent_status: Optional[bool] = None
    fallback_number: Optional[str] = None

    def get_status_value(self) -> bool:
        """Resolves status from any provided key name, defaulting to True."""
        if self.enabled is not None:
            return self.enabled
        if self.status is not None:
            return self.status
        if self.agent_status is not None:
            return self.agent_status
        return True


@router.post("/agent-status")
async def toggle_agent_status(assistant_id: str, payload: AgentStatusPayload):
    """
    Toggles the AI voice assistant ON (true) or OFF (false) using assistant_id.

    - ON (true): Clears Vapi hooks; AI agent handles calls normally.
    - OFF (false): Sets call.ringing hook on Vapi phone number to transfer
      incoming calls to the human fallback/manager number.
    """
    business_id, config = _find_config_by_assistant_id(assistant_id)
    if not config:
        raise HTTPException(status_code=404, detail=f"No business found with assistant_id '{assistant_id}'.")

    target_status = payload.get_status_value()
    phone_number_id = config.get("phone_number_id")
    fallback_number = payload.fallback_number or config.get("fallback_number")

    # Update state in business config
    config["agent_status"] = target_status
    if payload.fallback_number:
        config["fallback_number"] = payload.fallback_number
    save_business_config(business_id, config)

    vapi_result = None
    warning = None

    if not phone_number_id:
        warning = "No linked phone_number_id found for this business. Telephony hook will apply when phone is linked."
    else:
        try:
            if target_status:
                # Enable AI agent -> clear transfer hook
                vapi_result = clear_phone_ringing_hook(phone_number_id)
            else:
                # Disable AI agent -> set transfer hook
                if not fallback_number:
                    raise HTTPException(
                        status_code=400,
                        detail="Cannot set OFF status: No fallback_number found in config or request payload."
                    )
                vapi_result = set_phone_ringing_hook(phone_number_id, fallback_number)
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to patch Vapi hook: {str(e)}")

    return {
        "status": "success",
        "business_id": business_id,
        "assistant_id": assistant_id,
        "agent_status": target_status,
        "phone_number_id": phone_number_id,
        "fallback_number": fallback_number,
        "warning": warning,
        "vapi_response": vapi_result
    }


@router.get("/agent-status/{assistant_id}")
async def get_agent_status(assistant_id: str):
    """Retrieves current assistant status and telephony settings using assistant_id."""
    business_id, config = _find_config_by_assistant_id(assistant_id)
    if not config:
        raise HTTPException(status_code=404, detail=f"No business found with assistant_id '{assistant_id}'.")

    return {
        "business_id": business_id,
        "assistant_id": assistant_id,
        "agent_status": config.get("agent_status", True),
        "phone_number_id": config.get("phone_number_id"),
        "fallback_number": config.get("fallback_number")
    }


@router.get("/agent-status")
async def list_all_agent_statuses():
    """Lists status summary across all business tenants."""
    configs = load_all_business_configs()
    summary = {}
    for b_id, cfg in configs.items():
        summary[b_id] = {
            "assistant_id": cfg.get("assistant_id"),
            "agent_status": cfg.get("agent_status", True),
            "phone_number_id": cfg.get("phone_number_id"),
            "fallback_number": cfg.get("fallback_number")
        }
    return {"tenants": summary}
