import pytest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient

from app.main import app
from app.business_store import save_business_config, get_business_config

client = TestClient(app)

TEST_BUSINESS_ID = "test_pizzeria_status_001"
TEST_ASSISTANT_ID = "ast_test_12345"


@pytest.fixture(autouse=True)
def setup_test_business():
    """Sets up clean business config before each test."""
    initial_config = {
        "business_id": TEST_BUSINESS_ID,
        "assistant_id": TEST_ASSISTANT_ID,
        "phone_number_id": "num_vapi_67890",
        "fallback_number": "+447700900123",
        "agent_status": True
    }
    save_business_config(TEST_BUSINESS_ID, initial_config)
    yield


def test_get_status_defaults_to_true():
    """GET /api/agent-status/{assistant_id} returns agent_status true by default."""
    res = client.get(f"/api/agent-status/{TEST_ASSISTANT_ID}")
    assert res.status_code == 200
    data = res.json()
    assert data["assistant_id"] == TEST_ASSISTANT_ID
    assert data["business_id"] == TEST_BUSINESS_ID
    assert data["agent_status"] is True
    assert data["phone_number_id"] == "num_vapi_67890"
    assert data["fallback_number"] == "+447700900123"


def test_toggle_status_off_patches_vapi_hook():
    """POST /api/agent-status/{assistant_id} with enabled=False patches Vapi with call.ringing transfer hook."""
    with patch("app.agent_status.set_phone_ringing_hook") as mock_set_hook:
        mock_set_hook.return_value = {"id": "num_vapi_67890", "hooks": [{"on": "call.ringing"}]}

        res = client.post(
            f"/api/agent-status/{TEST_ASSISTANT_ID}",
            json={"enabled": False}
        )
        assert res.status_code == 200
        data = res.json()
        assert data["agent_status"] is False
        assert data["assistant_id"] == TEST_ASSISTANT_ID
        assert data["warning"] is None

        # Verify set_phone_ringing_hook was called with correct parameters
        mock_set_hook.assert_called_once_with("num_vapi_67890", "+447700900123")

        # Verify updated config in store
        cfg = get_business_config(TEST_BUSINESS_ID)
        assert cfg["agent_status"] is False


def test_toggle_status_on_clears_vapi_hook():
    """POST /api/agent-status/{assistant_id} with enabled=True patches Vapi to clear hooks."""
    # First set to False
    cfg = get_business_config(TEST_BUSINESS_ID)
    cfg["agent_status"] = False
    save_business_config(TEST_BUSINESS_ID, cfg)

    with patch("app.agent_status.clear_phone_ringing_hook") as mock_clear_hook:
        mock_clear_hook.return_value = {"id": "num_vapi_67890", "hooks": []}

        res = client.post(
            f"/api/agent-status/{TEST_ASSISTANT_ID}",
            json={"enabled": True}
        )
        assert res.status_code == 200
        data = res.json()
        assert data["agent_status"] is True
        assert data["assistant_id"] == TEST_ASSISTANT_ID

        # Verify clear_phone_ringing_hook was called
        mock_clear_hook.assert_called_once_with("num_vapi_67890")

        # Verify state in store is True
        cfg_updated = get_business_config(TEST_BUSINESS_ID)
        assert cfg_updated["agent_status"] is True


def test_flexible_payload_keys():
    """Verifies enabled, status, and agent_status keys in request payload all work."""
    with patch("app.agent_status.set_phone_ringing_hook") as mock_set_hook, \
         patch("app.agent_status.clear_phone_ringing_hook") as mock_clear_hook:
        mock_set_hook.return_value = {}
        mock_clear_hook.return_value = {}

        # Test using key "status"
        res1 = client.post(f"/api/agent-status/{TEST_ASSISTANT_ID}", json={"status": False})
        assert res1.status_code == 200
        assert res1.json()["agent_status"] is False

        # Test using key "agent_status"
        res2 = client.post(f"/api/agent-status/{TEST_ASSISTANT_ID}", json={"agent_status": True})
        assert res2.status_code == 200
        assert res2.json()["agent_status"] is True


def test_toggle_without_phone_id_saves_state_with_warning():
    """Toggling status for a business without linked phone_number_id succeeds with a warning."""
    no_phone_ast = "ast_no_phone_123"
    save_business_config("no_phone_biz", {"business_id": "no_phone_biz", "assistant_id": no_phone_ast, "agent_status": True})

    res = client.post(f"/api/agent-status/{no_phone_ast}", json={"enabled": False})
    assert res.status_code == 200
    data = res.json()
    assert data["agent_status"] is False
    assert "No linked phone_number_id found" in data["warning"]


def test_toggle_off_missing_fallback_number_raises_400():
    """Toggling OFF when fallback_number is missing raises HTTP 400."""
    no_fallback_ast = "ast_no_fallback_123"
    save_business_config("no_fallback_biz", {
        "business_id": "no_fallback_biz",
        "assistant_id": no_fallback_ast,
        "phone_number_id": "num_123",
        "agent_status": True
    })

    res = client.post(f"/api/agent-status/{no_fallback_ast}", json={"enabled": False})
    assert res.status_code == 400
    assert "No fallback_number found" in res.json()["detail"]


def test_telephony_link_persists_phone_id_and_fallback():
    """POST /api/telephony/link persists phone_number_id and fallback_number to business_configs."""
    link_biz = "test_link_biz"
    ast_id = "ast_link_999"
    save_business_config(link_biz, {"business_id": link_biz, "assistant_id": ast_id})

    mock_vapi_link_response = {
        "id": "num_vapi_new_555",
        "number": "+441234567890",
        "assistantId": ast_id
    }

    with patch("app.main.link_telephony", return_value=mock_vapi_link_response):
        res = client.post("/api/telephony/link", json={
            "assistant_id": ast_id,
            "twilio_number": "+441234567890",
            "manager_number": "+447999888777"
        })
        assert res.status_code == 200

        # Verify config was updated with phone_number_id and fallback_number
        cfg = get_business_config(link_biz)
        assert cfg["phone_number_id"] == "num_vapi_new_555"
        assert cfg["fallback_number"] == "+447999888777"
        assert cfg["agent_status"] is True


def test_list_all_agent_statuses():
    """GET /api/agent-status lists all tenant statuses."""
    res = client.get("/api/agent-status")
    assert res.status_code == 200
    data = res.json()
    assert "tenants" in data
    assert TEST_BUSINESS_ID in data["tenants"]


def test_create_agent_with_empty_or_string_special_offers_file():
    """Verifies that sending an empty string or leaving special_offers_file blank does not trigger 422 error."""
    with patch("app.main.create_assistant") as mock_create_ast, \
         patch("app.main.extract_text", return_value="Sample extracted text"):
        mock_create_ast.return_value = {"id": "ast_mock_123"}

        # Simulate Swagger UI sending empty string or omitting file for special_offers_file
        files = {
            "rules_file": ("rules.txt", b"Rules content", "text/plain"),
            "menu_file": ("menu.txt", b"Menu content", "text/plain"),
        }
        data = {
            "business_id": "test_swagger_biz",
            "special_offers_text": "",
            "special_offers_file": "",  # Empty string from Swagger UI
            "special_offers_enabled": "true"
        }

        res = client.post("/api/agents/create", data=data, files=files)
        assert res.status_code == 200
        assert res.json()["status"] == "success"
