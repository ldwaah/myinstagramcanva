#!/usr/bin/env python3
"""Download photos from @khiagovisuals Instagram posts."""

import json
import os
import re
import urllib.request

PROFILE_URL = "https://www.instagram.com/api/v1/users/web_profile_info/?username=khiagovisuals"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    "X-IG-App-ID": "936619743392459",
}
OUT_DIR = os.path.dirname(os.path.abspath(__file__))
MAX_IMAGES = 10


def fetch_profile():
    req = urllib.request.Request(PROFILE_URL, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.load(resp)


def collect_images(node, images, skip_video_thumbs=True):
    code = node["shortcode"]
    is_video = node.get("is_video") or node.get("product_type") == "clips"
    typename = node.get("__typename", "")

    if typename == "GraphSidecar":
        for i, child in enumerate(node.get("edge_sidecar_to_children", {}).get("edges", [])):
            c = child["node"]
            if skip_video_thumbs and c.get("is_video"):
                continue
            url = c.get("display_url")
            if url:
                cap = c.get("accessibility_caption") or f"Khia Go Visuals — {code}"
                images.append({"url": url, "id": f"{code}_{i}", "caption": cap})
    elif node.get("display_url"):
        if skip_video_thumbs and is_video:
            return
        cap = node.get("accessibility_caption") or f"Khia Go Visuals — {code}"
        images.append({"url": node["display_url"], "id": code, "caption": cap})


def pick_varied(images, limit):
    """One image per post, spread across carousels for variety."""
    seen_posts = set()
    picked = []
    for img in images:
        post_id = img["id"].rsplit("_", 1)[0] if "_" in img["id"] else img["id"]
        if post_id in seen_posts:
            continue
        seen_posts.add(post_id)
        picked.append(img)
        if len(picked) >= limit:
            break
    # fill remaining if needed
    if len(picked) < limit:
        for img in images:
            if img not in picked:
                picked.append(img)
            if len(picked) >= limit:
                break
    return picked


def download(url, path):
    req = urllib.request.Request(url, headers={"User-Agent": HEADERS["User-Agent"]})
    with urllib.request.urlopen(req, timeout=120) as resp:
        data = resp.read()
    with open(path, "wb") as f:
        f.write(data)
    return len(data)


def main():
    data = fetch_profile()
    all_images = []
    for edge in data["data"]["user"]["edge_owner_to_timeline_media"]["edges"]:
        collect_images(edge["node"], all_images)

    selected = pick_varied(all_images, MAX_IMAGES)
    manifest = []

    for i, img in enumerate(selected, 1):
        filename = f"portfolio-{i:02d}.jpg"
        path = os.path.join(OUT_DIR, filename)
        print(f"Downloading {filename} ({img['id']})...")
        size = download(img["url"], path)
        alt = re.sub(r"\s+", " ", img["caption"]).strip()[:120]
        manifest.append({
            "file": filename,
            "instagram_id": img["id"],
            "alt": alt,
            "bytes": size,
        })
        print(f"  → {size // 1024} KB")

    manifest_path = os.path.join(OUT_DIR, "portfolio-manifest.json")
    with open(manifest_path, "w") as f:
        json.dump(manifest, f, indent=2)
    print(f"\nSaved {len(manifest)} images + manifest")


if __name__ == "__main__":
    main()
