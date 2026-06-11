#!/usr/bin/env python3
# One-shot: scrape each event's cover image (Luma JSON-LD image[0], else og:image)
# and PATCH it onto the Directus events.cover_image field. Idempotent.
import json, re, urllib.request, sys, os

env = {}
with open('.env.local') as f:
    for line in f:
        line = line.strip()
        if '=' in line and not line.startswith('#'):
            k, v = line.split('=', 1)
            env[k] = v.strip().strip('"').strip("'")

DURL = (os.environ.get('DIRECTUS_URL_OVERRIDE') or env['DIRECTUS_URL']).rstrip('/')
TOKEN = os.environ.get('DIRECTUS_TOKEN_OVERRIDE') or env['DIRECTUS_ADMIN_TOKEN']
print('DIRECTUS_URL host:', re.sub(r'https?://([^/]+).*', r'\1', DURL))

EVENTS = [
    ("84163caa-77be-4760-8d49-0f3f95646fa5", "https://luma.com/q2h8oojf"),
    ("ba9e80e3-fcce-45ec-a23e-8ce7e24facef", "https://luma.com/50qa1rkf"),
    ("bcfcc085-1eea-42c8-8751-c7859094eca8", "https://luma.com/2agg7fyo"),
    ("6f2c831a-d32c-4a7b-a69a-c3a7f2b2740d", "https://luma.com/q1rfsjxk"),
    ("5192fdc1-d207-4227-931a-7f59d76ebbee", "https://luma.com/NebiusRoboticsAwards"),
    ("5b6682d9-813e-4172-890c-8eba251e6c86", "https://luma.com/PrimaMenteNebius"),
    ("9e50bfd1-7da7-4d63-86fa-a65b06fa896b", "https://nebius.com/events/robotour"),
    ("74850939-3b28-4a9e-9bb6-654f13ab039c", "https://luma.com/9y6eox9j"),
    ("d48dea91-2b02-464e-8e69-72fa4dda57c3", "https://luma.com/49k20jo8"),
    ("cb1e621d-bd80-4478-92b6-26aeb45401b3", "https://nebius.com/events/webinar-running-openclaw-on-nebius"),
    ("ba531821-07c2-4751-bf85-60035faa0f87", "https://nebius.com/events/webinar-practical-serverless-ai-for-developers"),
    ("9ec90a99-0ad4-43a3-99c6-532ab67f42f3", "https://nebius.com/events/ai-dna-ai-day-by-nebius-academy"),
    ("491a2399-66e5-4d9a-b979-e7ba06cc2214", "https://nebius.com/events/hannover-messe-2026"),
    ("75e50241-0f0a-443e-874b-ba65c41c572e", "https://nebius.com/events/webinar-aether-3-5"),
    ("35da8cdd-3881-4a88-91d9-a9b54b3fa81e", "https://luma.com/RoboTourHannover"),
    ("4c4ce46c-4129-4e95-95e5-e7a036750923", "https://nebius.com/events/ebc-robotics-and-physical-ai-hannover"),
    ("2b0ba8a6-11e7-43d3-ad6a-fd798b1dde71", "https://nebius.com/events/iclr-2026"),
    ("9d8be72d-ff85-4cce-84c3-065ae6f4af0f", "https://nebius.com/events/webinar-run-gpu-molecular-simulations-in-minutes"),
    ("a666a05a-fabe-47aa-ba79-8d459db56e73", "https://nebius.com/events/nebius-build-berlin"),
    ("a566d206-6a4f-4319-88dd-aefdf3286d7c", "https://nebius.com/events/langtalks-ai-engineering-conference-2026"),
    ("027780a9-73ae-468a-95c7-f03f7097fd8d", "https://nebius.com/events/webinar-fast-experiment-loops-for-robotics"),
    ("54d5d003-d141-4597-8d46-e5b8aeca496d", "https://luma.com/MayLADinner"),
    ("e4dba2ef-9347-4e69-bcbf-740d5f9611cb", "https://luma.com/paxjj7qo"),
    ("ab3030d0-661a-4f1e-a13c-feb6f602d0ca", "https://luma.com/sg126t3h"),
    ("722e007e-ebf0-4e9a-b5df-64aa56949cd2", "https://luma.com/paris-hack"),
    ("e581647b-45db-41ee-8212-c4ef7aac612c", "https://nebius.com/events/webinar-calculating-the-total-cost-of-a-gpu-cluster"),
    ("80f8c73e-6c65-41ad-b278-13f7c0db5cca", "https://luma.com/9xuza5he"),
    ("e4463137-afcd-4261-9b45-6644baa0100f", "https://luma.com/gkcqiq84"),
    ("8a20d119-ff37-4701-8ef0-bc779eda50af", "https://nebius.com/events/webinar-build-an-expert-agentic-slack-bot"),
    ("dfbedd59-c093-4656-92d7-e90063a69b4d", "https://luma.com/1rna5bdp"),
    ("94770d16-455b-41d4-9f84-f04b163e4bfe", "https://luma.com/bvvrlgam"),
    ("7b7903ae-3204-48bc-9f37-6bf75e06a508", "https://luma.com/bhfumnou"),
    ("36f12dd2-f23a-4c38-b703-90563ee88b47", "https://luma.com/fpxsdfhl"),
    ("5a77c545-7f2c-4618-b717-95c1552dc140", "https://nebius.com/events/applied-ai-conference-by-tech-europe-2026"),
    ("feab1f21-ae87-48d3-92ce-b4479c3d77d1", "https://luma.com/ma5bfzes"),
    ("7017ac07-7b6a-42cb-a959-15ebec3ad731", "https://luma.com/juded1wb"),
    ("82a2d204-b388-4403-835c-97428004fbf1", "https://www.nucleatebiohack.org/"),
    ("49d74a11-87ae-4cfb-ade8-1ea86d6fab14", "https://luma.com/niv7ff32"),
    ("ef8390e4-c872-4c18-b3b1-cc79e0f51969", "https://luma.com/place-holder-hack"),
    ("3b7b3cd3-feb9-4943-80fa-89ba16d5de22", "https://nebius.com/events/icra-2026"),
    ("e96f8d96-bb0b-425e-b334-644d8e750120", "https://luma.com/sbxje1du"),
    ("e87db161-64e5-4961-888b-5233252e43d0", "https://lu.ma/tavily-xxuj"),
    ("54b01ff3-3530-4bf6-b545-df672fe2400f", "https://luma.com/zemh10km"),
    ("cba85725-df03-418e-8bd1-1676409981fd", "https://luma.com/5gabjl8y"),
    ("76b4bc08-e693-4e99-ab9f-741b125811d2", "https://nebius.com/events/ai-rabbit-hole-2026"),
    ("8c722663-363d-47ef-a2af-a4438aba5430", "https://luma.com/rtsospm5"),
    ("8645fc13-1539-4096-8f8d-adc439cc607c", "https://nebius.com/events/nebius-inflection"),
    ("18734261-4b76-498f-89cb-607f3b7435d8", "https://nebius.com/events/ai-summit-london-2026"),
    ("d986ca9a-beea-4466-8e70-0969818a77e6", "https://luma.com/r16tprwv"),
    ("4344f435-7c78-4425-bb51-b1031eff9b76", "https://luma.com/munich-hackathon"),
    ("950f55db-8c96-41bf-91fe-1d106de6aafe", "https://luma.com/buildership"),
    ("28996431-db68-42aa-b67c-2e049fb8f555", "https://nebius.com/events/hlth-europe-2026"),
    ("44b9950c-420b-4999-8ade-e8be4b1458ad", "https://lu.ma/gvv4cv5l"),
    ("be3d48fe-fd6b-48fe-ba93-7ce1a3d6f345", "https://luma.com/breakfastNYC"),
    ("68fbd14e-fa7b-4b10-a400-d76a9e7b9549", "https://luma.com/59of1vpe"),
    ("0a7d6eff-4a03-4733-a432-e7de3b6ccccb", "https://nebius.com/events/mlcon-munich-2026"),
]

UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36"

def fetch(url):
    try:
        req = urllib.request.Request(url, headers={"User-Agent": UA})
        with urllib.request.urlopen(req, timeout=25) as r:
            return r.read().decode("utf-8", "ignore")
    except Exception:
        return ""

def extract(html, url):
    is_luma = "luma.com" in url or "lu.ma" in url
    if is_luma:
        m = re.search(r'"image":\["([^"]+)"', html)
        if m:
            return m.group(1)
    for pat in (r'<meta[^>]+property=["\']og:image["\'][^>]+content=["\']([^"\']+)["\']',
                r'<meta[^>]+content=["\']([^"\']+)["\'][^>]+property=["\']og:image["\']'):
        m = re.search(pat, html)
        if m:
            return m.group(1)
    return None

def resize_luma(u):
    # Square 1920 cover -> 16:9 ~800px landscape for the card.
    if u and "lumacdn.com/cdn-cgi/image/" in u:
        u = re.sub(r"width=\d+,height=\d+", "width=800,height=450", u)
    return u

def patch(eid, cover):
    body = json.dumps({"cover_image": cover}).encode()
    req = urllib.request.Request(f"{DURL}/items/events/{eid}", data=body, method="PATCH",
        headers={"Authorization": f"Bearer {TOKEN}", "Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=20) as r:
            r.read()
        return True
    except Exception as e:
        return f"{e}"

ok, fails = 0, []
for eid, url in EVENTS:
    html = fetch(url)
    img = resize_luma(extract(html, url)) if html else None
    if img:
        res = patch(eid, img)
        if res is True:
            ok += 1
        else:
            fails.append((url, "patch:" + res))
    else:
        fails.append((url, "no-image"))

print(f"UPDATED {ok}/{len(EVENTS)}")
for u, why in fails:
    print("  SKIP", why, u)
