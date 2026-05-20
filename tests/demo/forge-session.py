#!/usr/bin/env python3
"""Forge a Profit Builders Flask session cookie for demo recording.

Run with the trading-system venv (it has Flask + reads FLASK_SECRET_KEY from
/opt/trading-system/.env). Prints the cookie value to stdout — capture into
PB_SESSION_COOKIE. The secret is NEVER written here; this only signs a session
payload for a test customer so demos can view subscriber-gated surfaces.

Usage:
  /opt/trading-system/venv/bin/python3 forge-session.py --tier premium
  /opt/trading-system/venv/bin/python3 forge-session.py --tier heatmap
"""
import argparse, os, time
from dotenv import load_dotenv

load_dotenv("/opt/trading-system/.env", override=True)
from flask import Flask
from flask.sessions import SecureCookieSessionInterface

# Test/demo customers per tier (Stripe customer IDs — not secrets).
DEFAULT_CUSTOMER = {
    "premium": "cus_UCVihwWjefAwMG",
    "pro_bundle": "cus_Tp8eAGWRJ2N261",
    "heatmap": "cus_UY6K5ivmO5urTP",
    "lifetime": "",
}

ap = argparse.ArgumentParser()
ap.add_argument("--tier", default="premium")
ap.add_argument("--customer", default=None)
ap.add_argument("--email", default="demo@example.com")
args = ap.parse_args()

customer = args.customer or DEFAULT_CUSTOMER.get(args.tier, "cus_demo")
app = Flask(__name__)
app.secret_key = os.environ["FLASK_SECRET_KEY"]
serializer = SecureCookieSessionInterface().get_signing_serializer(app)
print(serializer.dumps({
    "subscriber_authenticated": True,
    "subscriber_login_time": time.time(),
    "subscriber_customer_id": customer,
    "subscriber_email": args.email,
    "subscriber_tier": args.tier,
}), end="")
