import os
import requests
import json
from dotenv import load_dotenv, find_dotenv

# Explicitly find and load the .env file from the root directory
load_dotenv(find_dotenv(), override=True)

VAPI_API_KEY = os.getenv("VAPI_API_KEY", "your-vapi-api-key")
VAPI_BASE_URL = "https://api.vapi.ai"
LLM_MODEL = os.getenv("LLM_MODEL", "gpt-5.4-mini-2026-03-17")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
VAPI_DEFAULT_TOOL_ID = os.getenv("VAPI_DEFAULT_TOOL_ID", "")

def get_vapi_server_url():
    url = os.getenv("VAPI_SERVER_URL", "").strip()
    print(f"DEBUG: Loaded VAPI_SERVER_URL = '{url}'")
    return url

HEADERS = {
    "Authorization": f"Bearer {VAPI_API_KEY}",
    "Content-Type": "application/json"
}

def create_assistant(business_id: str, system_prompt: str, business_name: str = "") -> dict:
    """
    Creates or updates an assistant on Vapi. If an assistant with the name
    already exists, it updates it in-place using PATCH so changes are published instantly.
    Uses business_name for customer-facing messages (firstMessage, endCall).
    """
    existing_id = None
    try:
        # Search for existing assistant with this name/business_id to prevent duplicates and auto-publish
        list_url = f"{VAPI_BASE_URL}/assistant"
        list_res = requests.get(list_url, headers=HEADERS)
        if list_res.status_code == 200:
            assistants = list_res.json()
            for ast in assistants:
                if ast.get("name") == business_id or ast.get("metadata", {}).get("business_id") == business_id:
                    existing_id = ast.get("id")
                    break
    except Exception as e:
        print(f"Warning: Failed to search for existing assistant: {e}")

    # Strictly use the tool ID configured in the .env for all agents
    tool_ids = []
    if VAPI_DEFAULT_TOOL_ID:
        tool_ids.append(VAPI_DEFAULT_TOOL_ID)

    vapi_server_url = get_vapi_server_url()

    # Use business_name for customer-facing messages, fall back to business_id
    display_name = business_name if business_name else business_id

    payload = {
        "name": business_id, # Exactly the name you provide
        "firstMessage": f"Hi, you're through to {display_name} and I'm their virtual assistant. Would you like to place an order?",
        "metadata": {
            "business_id": business_id
        },
        "backgroundSound": "off",
        "startSpeakingPlan": {
            "waitSeconds": 0.1
        },
        "model": {
            "provider": "openai",
            "model": LLM_MODEL,
            "messages": [
                {
                    "role": "system",
                    "content": system_prompt
                }
            ],
            "temperature": 0.4,
            "toolIds": tool_ids, # Links your dashboard-created tool inside model
            "tools": [
                {
                    "type": "endCall",
                    "messages": [
                        {
                            "type": "request-start",
                            "content": f"Thanks for calling {display_name}. Have a great day and enjoy your meal!"
                        }
                    ],
                    "function": {
                        "name": "endCall",
                        "description": "Ends the phone call. Invoke this tool immediately when the order is complete or the conversation naturally ends. Do NOT say goodbye yourself, just trigger this tool."
                    }
                }
            ]
        },
        "voice": {
            "model": "gpt-4o-mini-tts",
            "voiceId": "nova",
            "provider": "openai"
        },
        "transcriber": {
            "provider": "deepgram",
            "model": "nova-3",
            "language": "en-GB"
        },
        "analysisPlan": {
            "summaryPlan": {
                "enabled": True,
                "messages": [
                    {
                        "role": "system",
                        "content": "Provide a concise summary of the call. Include the customer's name, their mood, what they ordered, the total price of the order, payment method chosen, and if the order was successfully handled."
                    },
                    {
                        "role": "user",
                        "content": "Here is the transcript:\n\n{{transcript}}\n\n. Here is the ended reason of the call:\n\n{{endedReason}}\n\n"
                    }
                ]
            },
            "structuredDataPlan": {
                "schema": {
                    "type": "object",
                    "properties": {
                        "customer_confirmed": {"type": "boolean"},
                        "save_order_was_called": {"type": "boolean"},
                        "items": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "quantity": {"type": "string"},
                                    "unit_prize": {"type": "string"},
                                    "product_name": {"type": "string"}
                                },
                                "required": ["quantity", "unit_prize", "product_name"]
                            }
                        },
                        "total_price": {"type": "number"},
                        "order_status": {"type": "string", "enum": ["completed", "abandoned", "in_progress"]},
                        "customer_name": {"type": "string"},
                        "payment_method": {"type": "string", "enum": ["cash", "card", "unknown"]},
                        "delivery_type": {"type": "string", "enum": ["pickup", "delivery"]},
                        "delivery_address": {"type": "string"}
                    },
                    "required": ["customer_confirmed", "save_order_was_called", "items", "total_price", "order_status", "customer_name", "delivery_type", "delivery_address"]
                },
                "messages": [
                    {
                        "role": "system",
                        "content": "Extract the final order details for database logging.\n\n**ORDER STATUS RULES (CRITICAL)**:\n- Set order_status to 'completed' ONLY if ALL of the following are true: (1) the assistant read the full order summary aloud to the customer, (2) the assistant asked 'Is that all correct?' or similar, (3) the customer explicitly confirmed the order summary with 'yes', 'yeah', 'that\\'s correct' or similar affirmative response, (4) the assistant said 'your order has been confirmed' or similar confirmation phrase, AND (5) a total price was clearly stated by the assistant. If ANY of these conditions is missing, the order is NOT completed.\n- Set order_status to 'abandoned' if: the call was disconnected or hung up before the customer confirmed the summary, the endedReason indicates an unexpected end (e.g. 'customer-ended-call' without confirmation, 'assistant-error', 'silence-timed-out'), the customer cancelled the order, the customer said 'no' to the order summary and never re-confirmed, or save_order was never successfully called.\n- Set order_status to 'in_progress' only if the call ended mid-conversation while items were actively being discussed but no summary was attempted.\n- Set customer_confirmed to true ONLY if the customer explicitly verbally confirmed the final order summary in the transcript with a clear 'yes', 'yeah', 'correct', 'that\\'s right' or similar. Simply saying 'that\\'s it' (meaning done adding items) does NOT count as confirming the summary. If the call ended before this confirmation, set customer_confirmed to false.\n- Set save_order_was_called to true ONLY if the transcript shows save_order was successfully invoked and the assistant confirmed the order. If save_order was never called, or was rejected by the backend, set it to false.\n\n**TOTAL PRICE RULES**:\n- For total_price, output the final total price clearly stated by the assistant to the customer. If no total was stated or confirmed in the transcript, set total_price to 0.\n- Do NOT guess or calculate a total that was never spoken in the conversation.\n\n**ITEM EXTRACTION**:\n- For each item in 'items', extract 'product_name', 'quantity' (as a string), and 'unit_prize' (the price of ONE unit as a decimal string, e.g. '22.09', '24.10', '5.83').\n- For unit_prize, use this priority order:\n  1. FIRST: Look for individual item prices spoken in the transcript (e.g. 'at eight pounds fifty each', 'at ten pounds'). Convert spoken prices to decimal strings (e.g. 'eight pounds fifty' = '8.50').\n  2. FALLBACK: If a specific item price was NOT spoken but the total_price and all quantities are known, calculate unit prices that sum to the stated total. Use common UK restaurant pricing (whole numbers or .50/.95/.99 endings).\n  3. NEVER output 'unknown', '0.0', or '0' for unit_prize. You MUST always provide a realistic numeric decimal string.\n\nThe delivery_type MUST be exactly 'pickup' or 'delivery'. If delivery_type is 'delivery', extract the 'delivery_address' from the transcript. If it's 'pickup', set 'delivery_address' to 'N/A' or an empty string.\n\nJson Schema:\n{{schema}}\n\nOnly respond with the JSON."
                    },
                    {
                        "role": "user",
                        "content": "Here is the transcript:\n\n{{transcript}}\n\n. Here is the ended reason of the call:\n\n{{endedReason}}\n\n"
                    }
                ]
            },
            "successEvaluationPlan": {
                "enabled": True,
                "rubric": "PassFail"
            }
        }
    }
    
    if vapi_server_url:
        payload["server"] = {
            "url": vapi_server_url,
            "timeoutSeconds": 20
        }
    
    print(f"DEBUG PAYLOAD TO VAPI: {json.dumps(payload, indent=2)}")
    
    if existing_id:
        print(f"[SYNC] Assistant '{business_id}' already exists (ID: {existing_id}). Updating in-place...")
        url = f"{VAPI_BASE_URL}/assistant/{existing_id}"
        response = requests.patch(url, headers=HEADERS, json=payload)
    else:
        print(f"[NEW] Creating new assistant '{business_id}'...")
        url = f"{VAPI_BASE_URL}/assistant"
        response = requests.post(url, headers=HEADERS, json=payload)

    if response.status_code >= 400:
        # Return the actual error from Vapi so it shows in the browser
        error_msg = response.text
        print(f"DEBUG VAPI ERROR: {error_msg}")
        raise Exception(f"Vapi Error: {error_msg} | Payload sent: {json.dumps(payload)}")
    
    result = response.json()

    # Sync the save_order tool's server URL to match VAPI_SERVER_URL.
    # The dashboard-created tool has its own server.url which may point to
    # an old ngrok URL. This ensures it always uses the production endpoint.
    if vapi_server_url and VAPI_DEFAULT_TOOL_ID:
        try:
            tool_patch_url = f"{VAPI_BASE_URL}/tool/{VAPI_DEFAULT_TOOL_ID}"
            tool_patch_payload = {
                "server": {
                    "url": vapi_server_url,
                    "timeoutSeconds": 20
                },
                "function": {
                    "name": "save_order",
                    "description": "FINAL step: saves a COMPLETED order to the kitchen. ONLY call this function AFTER: (1) you have read the full order summary to the customer including all items, quantities and total price, (2) you asked 'Is that all correct?', (3) the customer responded with an explicit 'yes', 'yeah', 'correct', 'that is right', 'sure', or 'go ahead' confirming the summary, and (4) for delivery orders, the payment method has been confirmed as cash or card. If the customer said 'no', cancelled, hung up, or has not yet confirmed, DO NOT call this function. Calling this without genuine customer confirmation will result in an error and the order will be rejected.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "customer_confirmed": {
                                "type": "boolean",
                                "description": "MUST be true. Set to true ONLY when the customer has explicitly said 'yes', 'yeah', 'correct' or similar in response to the order summary. If the customer has NOT confirmed, do NOT call this function."
                            },
                            "confirmation_phrase": {
                                "type": "string",
                                "description": "The EXACT words the customer used to confirm the order summary (e.g., 'yes', 'yeah that's correct', 'yes please', 'go ahead'). This MUST be the customer's actual spoken words. If you cannot provide the customer's real confirmation words, do NOT call this function."
                            },
                            "order_summary_read": {
                                "type": "boolean",
                                "description": "MUST be true. Confirms that you read the complete order summary (all items, quantities, total price) aloud to the customer and asked 'Is that all correct?' before calling this function."
                            },
                            "customer_name": {"type": "string"},
                            "customer_email": {"type": "string"},
                            "order_items": {"type": "string", "description": "JSON string of order details"},
                            "total_price": {"type": "number"},
                            "payment_method": {"type": "string"},
                            "delivery_type": {"type": "string"},
                            "delivery_address": {"type": "string"},
                            "customer_phone": {"type": "string"}
                        },
                        "required": ["customer_confirmed", "confirmation_phrase", "order_summary_read", "order_items", "total_price"]
                    }
                }
            }
            tool_patch_res = requests.patch(tool_patch_url, headers=HEADERS, json=tool_patch_payload)
            if tool_patch_res.status_code < 400:
                print(f"[SYNC] save_order tool server URL updated to: {vapi_server_url}")
            else:
                print(f"Warning: Failed to update save_order tool server URL: {tool_patch_res.text}")
        except Exception as e:
            print(f"Warning: Failed to sync save_order tool server URL: {e}")

    return result


def link_telephony(assistant_id: str, twilio_number: str, manager_number: str) -> dict:
    """
    Links a Twilio phone number to the created Vapi assistant.
    If the phone number is already imported in Vapi, updates the assistant link via PATCH.
    Otherwise, imports it into Vapi via POST using Twilio credentials.
    """
    # Normalize phone numbers (strip spaces, dashes, parentheses)
    clean_twilio_number = twilio_number.strip().replace(" ", "").replace("-", "").replace("(", "").replace(")", "")
    if clean_twilio_number and not clean_twilio_number.startswith("+"):
        clean_twilio_number = "+" + clean_twilio_number

    clean_manager_number = manager_number.strip().replace(" ", "").replace("-", "").replace("(", "").replace(")", "")
    if clean_manager_number and not clean_manager_number.startswith("+"):
        clean_manager_number = "+" + clean_manager_number

    twilio_account_sid = os.getenv("TWILIO_ACCOUNT_SID", "").strip()
    twilio_auth_token = os.getenv("TWILIO_AUTH_TOKEN", "").strip()

    # Check if phone number is already registered in Vapi
    existing_phone_obj = None
    try:
        list_url = f"{VAPI_BASE_URL}/phone-number"
        list_res = requests.get(list_url, headers=HEADERS)
        if list_res.status_code == 200:
            for item in list_res.json():
                item_num = (item.get("number") or "").strip().replace(" ", "").replace("-", "")
                if item_num == clean_twilio_number or item.get("number") == twilio_number:
                    existing_phone_obj = item
                    break
    except Exception as e:
        print(f"Warning: Failed to fetch existing Vapi phone numbers: {e}")

    if existing_phone_obj:
        phone_id = existing_phone_obj["id"]
        print(f"[LINK] Phone number '{clean_twilio_number}' already exists in Vapi (ID: {phone_id}). Updating assistantId...")
        url = f"{VAPI_BASE_URL}/phone-number/{phone_id}"
        patch_payload = {
            "assistantId": assistant_id
        }
        if twilio_account_sid and twilio_auth_token:
            patch_payload["twilioAccountSid"] = twilio_account_sid
            patch_payload["twilioAuthToken"] = twilio_auth_token

        response = requests.patch(url, headers=HEADERS, json=patch_payload)
        if response.status_code >= 400:
            raise Exception(f"Vapi Error {response.status_code}: {response.text}")
        result_phone_data = response.json()
    else:
        print(f"[LINK] Importing new Twilio phone number '{clean_twilio_number}' to Vapi...")
        url = f"{VAPI_BASE_URL}/phone-number"
        payload = {
            "provider": "twilio",
            "number": clean_twilio_number,
            "assistantId": assistant_id,
            "twilioAccountSid": twilio_account_sid,
            "twilioAuthToken": twilio_auth_token,
            "name": f"Line for {assistant_id[:25]}"
        }
        response = requests.post(url, headers=HEADERS, json=payload)
        if response.status_code >= 400:
            error_text = response.text
            if "Number Not Found on Twilio" in error_text:
                sid_hint = twilio_account_sid[:6] + "..." if len(twilio_account_sid) > 6 else twilio_account_sid
                raise Exception(
                    f"Number Not Found on Twilio: The phone number '{clean_twilio_number}' was not found in your active Twilio account console (SID: {sid_hint}). "
                    f"Please check that this number is purchased under your Twilio account, or verify TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in .env."
                )
            raise Exception(f"Vapi Error {response.status_code}: {error_text}")
        result_phone_data = response.json()

    if clean_manager_number:
        # Fetch all global tools to avoid duplicates
        tool_url = f"{VAPI_BASE_URL}/tool"
        all_tools_res = requests.get(tool_url, headers=HEADERS)
        all_tools = all_tools_res.json() if all_tools_res.status_code == 200 else []
        
        # Find if a transfer tool for this manager number already exists
        existing_transfer_tools = [t for t in all_tools if t.get("type") == "transferCall"]
        tool_id = None
        
        for t in existing_transfer_tools:
            dests = t.get("destinations", [])
            if dests and dests[0].get("number") == manager_number:
                tool_id = t["id"]
                break
                
        # If not found, create it
        if not tool_id:
            tool_payload = {
                "type": "transferCall",
                "destinations": [
                    {
                        "type": "number",
                        "number": manager_number,
                        "message": "Please hold while I transfer you to the restaurant."
                    }
                ],
                "function": {
                    "name": "transferToManager",
                    "description": "Transfers the call to the restaurant immediately. Invoke this tool without asking why when: the customer asks to speak to a human, a person, or a manager; the customer makes a complaint; the customer reports a missing item or requests a refund; the customer is unhappy or frustrated; the customer has chosen card payment and the order has been saved."
                }
            }
            tool_res = requests.post(tool_url, headers=HEADERS, json=tool_payload)
            if tool_res.status_code >= 400:
                raise Exception(f"Vapi Tool Creation Error {tool_res.status_code}: {tool_res.text}")
            tool_id = tool_res.json().get("id")
        
        # Patch the assistant — clean all transferCall references, then add single correct one
        patch_assistant_url = f"{VAPI_BASE_URL}/assistant/{assistant_id}"
        get_res = requests.get(patch_assistant_url, headers=HEADERS)
        if get_res.status_code == 200:
            assistant_data = get_res.json()
            model_data = assistant_data.get("model", {})
            
            # Clean model.tools array (remove any inline transferCall tools)
            if "tools" in model_data:
                model_data["tools"] = [t for t in model_data["tools"] if t.get("type") != "transferCall"]
                
            # Clean model.toolIds — remove ALL transferCall tool IDs
            existing_tool_ids = model_data.get("toolIds", [])
            all_transfer_ids = [t["id"] for t in existing_transfer_tools]
            existing_tool_ids = [tid for tid in existing_tool_ids if tid not in all_transfer_ids]
            
            # Add our single desired tool_id
            existing_tool_ids.append(tool_id)
            model_data["toolIds"] = existing_tool_ids
            
            patch_payload = {"model": model_data}
            patch_res = requests.patch(patch_assistant_url, headers=HEADERS, json=patch_payload)
            if patch_res.status_code >= 400:
                raise Exception(f"Vapi Patch Error {patch_res.status_code}: {patch_res.text}")
            
    return result_phone_data

def unlink_telephony(phone_number_id: str) -> dict:
    """
    Unlinks and deletes a Twilio phone number from the Vapi account.
    """
    url = f"{VAPI_BASE_URL}/phone-number/{phone_number_id}"
    response = requests.delete(url, headers=HEADERS)
    response.raise_for_status()
    return response.json()


def set_phone_ringing_hook(phone_number_id: str, fallback_number: str) -> dict:
    """
    Patches a Vapi phone number with a call.ringing hook to unconditionally
    transfer incoming calls to the human fallback number before the AI speaks.
    Used when agent status is set to OFF (false).
    """
    url = f"{VAPI_BASE_URL}/phone-number/{phone_number_id}"
    payload = {
        "hooks": [
            {
                "on": "call.ringing",
                "do": [
                    {
                        "type": "transfer",
                        "destination": {
                            "type": "number",
                            "number": fallback_number
                        }
                    }
                ]
            }
        ]
    }
    response = requests.patch(url, headers=HEADERS, json=payload)
    if response.status_code >= 400:
        raise Exception(f"Vapi Hook Set Error ({response.status_code}): {response.text}")
    return response.json()


def clear_phone_ringing_hook(phone_number_id: str) -> dict:
    """
    Clears all hooks on a Vapi phone number, restoring normal AI agent call handling.
    Used when agent status is set to ON (true).
    """
    url = f"{VAPI_BASE_URL}/phone-number/{phone_number_id}"
    payload = {"hooks": []}
    response = requests.patch(url, headers=HEADERS, json=payload)
    if response.status_code >= 400:
        raise Exception(f"Vapi Hook Clear Error ({response.status_code}): {response.text}")
    return response.json()


def get_phone_number_details(phone_number_id: str) -> dict:
    """Fetches Vapi phone number configuration for inspection."""
    url = f"{VAPI_BASE_URL}/phone-number/{phone_number_id}"
    response = requests.get(url, headers=HEADERS)
    if response.status_code >= 400:
        raise Exception(f"Vapi Phone Fetch Error ({response.status_code}): {response.text}")
    return response.json()

