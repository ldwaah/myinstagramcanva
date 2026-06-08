#!/usr/bin/env python3
"""Download video/reel posts from @khiagovisuals via public web API."""

import json
import os
import urllib.request

USERNAME = "khiagovisuals"
MAX_VIDEOS = 6
OUT_DIR = os.path.dirname(os.path.abspath(__file__))
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    "X-IG-App-ID": "936619743392459",
}


def fetch_profile(cursor=None):
    url = f"https://www.instagram.com/api/v1/users/web_profile_info/?username={USERNAME}"
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.load(resp)


def fetch_page(cursor):
    # GraphQL pagination for more posts
    variables = json.dumps({"id": "11904489687", "first": 24, "after": cursor})
    url = (
        "https://www.instagram.com/graphql/query/?"
        f"doc_id=7950224923793128298&variables={urllib.parse.quote(variables)}"
    )
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.load(resp)


def download(url, dest):
    req = urllib.request.Request(url, headers={"User-Agent": HEADERS["User-Agent"]})
    with urllib.request.urlopen(req, timeout=120) as resp:
        with open(dest, "wb") as f:
            f.write(resp.read())


def collect_videos(edges, seen, results):
    for edge in edges:
        node = edge["node"]
        code = node["shortcode"]
        if code in seen:
            continue
        seen.add(code)
        is_video = node.get("is_video") or node.get("product_type") == "clips"
        if not is_video or not node.get("video_url"):
            continue
        cap_edges = node.get("edge_media_to_caption", {}).get("edges", [])
        caption = cap_edges[0]["node"]["text"] if cap_edges else ""
        results.append((code, node["video_url"], caption))
        if len(results) >= MAX_VIDEOS:
            return True
    return False


def main():
    import urllib.parse

    data = fetch_profile()
    media = data["data"]["user"]["edge_owner_to_timeline_media"]
    videos = []
    seen = set()

    if collect_videos(media["edges"], seen, videos):
        pass
    else:
        cursor = media["page_info"]["end_cursor"]
        pages = 0
        while media["page_info"]["has_next_page"] and len(videos) < MAX_VIDEOS and pages < 5:
            pages += 1
            try:
                gql = fetch_page(cursor)
                user = gql["data"]["user"]
                timeline = user["edge_owner_to_timeline_media"]
                if collect_videos(timeline["edges"], seen, videos):
                    break
                if not timeline["page_info"]["has_next_page"]:
                    break
                cursor = timeline["page_info"]["end_cursor"]
            except Exception as e:
                print(f"Pagination stopped: {e}")
                break

    print(f"Downloading {len(videos)} video(s) to {OUT_DIR}\n")
    for code, url, caption in videos:
        dest = os.path.join(OUT_DIR, f"{code}.mp4")
        if os.path.exists(dest):
            print(f"Skip {code} (exists)")
            continue
        print(f"→ {code}: {caption[:50]}...")
        download(url, dest)
        size_mb = os.path.getsize(dest) / (1024 * 1024)
        print(f"  Saved {dest} ({size_mb:.1f} MB)\n")

    manifest = [
        {"id": c, "file": f"{c}.mp4", "caption": cap[:200]}
        for c, _, cap in videos
    ]
    with open(os.path.join(OUT_DIR, "manifest.json"), "w") as f:
        json.dump(manifest, f, indent=2)
    print("Done.")


if __name__ == "__main__":
    main()
