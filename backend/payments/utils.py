import base64
import requests
from datetime import datetime
from django.conf import settings


def get_mpesa_access_token():
    url = (
        "https://sandbox.safaricom.co.ke/oauth/v1/generate"
        "?grant_type=client_credentials"
    )

    response = requests.get(
        url,
        auth=(
            settings.MPESA_CONSUMER_KEY,
            settings.MPESA_CONSUMER_SECRET,
        ),
        timeout=30,
    )

    response.raise_for_status()
    return response.json()["access_token"]


def generate_mpesa_password(shortcode, passkey, timestamp):
    password_data = shortcode + passkey + timestamp

    return base64.b64encode(
        password_data.encode()
    ).decode()


def send_stk_push(
    phone_number,
    amount,
    account_reference,
    transaction_desc,
):
    access_token = get_mpesa_access_token()

    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")

    shortcode = str(settings.MPESA_SHORTCODE)
    passkey = settings.MPESA_PASSKEY

    password = generate_mpesa_password(
        shortcode,
        passkey,
        timestamp,
    )

    # Convert Kenyan phone numbers to 2547XXXXXXXX format.
    phone_number = (
        phone_number.strip()
        .replace("+", "")
        .replace(" ", "")
    )

    if phone_number.startswith("0"):
        phone_number = "254" + phone_number[1:]

    if not (
        phone_number.startswith("254")
        and len(phone_number) == 12
        and phone_number.isdigit()
    ):
        raise ValueError("Enter a valid Kenyan phone number.")

    url = (
        "https://sandbox.safaricom.co.ke/"
        "mpesa/stkpush/v1/processrequest"
    )

    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json",
    }

    payload = {
        "BusinessShortCode": shortcode,
        "Password": password,
        "Timestamp": timestamp,
        "TransactionType": "CustomerPayBillOnline",
        "Amount": int(amount),
        "PartyA": phone_number,
        "PartyB": shortcode,
        "PhoneNumber": phone_number,
        "CallBackURL": settings.MPESA_CALLBACK_URL,
        "AccountReference": account_reference,
        "TransactionDesc": transaction_desc,
    }

    response = requests.post(
            url,
            json=payload,
            headers=headers,
            timeout=30
        )

    print("MPESA STATUS:", response.status_code)
    print("MPESA RESPONSE:", response.text)

    response.raise_for_status()
    return response.json()

