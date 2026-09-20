#!/usr/bin/env python3
"""Local preview server that serves HTML/JSON as UTF-8.

python3 -m http.server omits the charset for text/html, which mangles the
Japanese copy baked into index.html. Use this instead:

    python3 scripts/serve.py [port]
"""
import functools
import http.server
import os
import sys


class Handler(http.server.SimpleHTTPRequestHandler):
    def guess_type(self, path):
        ctype = super().guess_type(path)
        if ctype in ("text/html", "application/json", "text/css", "text/javascript"):
            return ctype + "; charset=utf-8"
        return ctype


def main():
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    handler = functools.partial(Handler, directory=root)
    with http.server.ThreadingHTTPServer(("", port), handler) as httpd:
        print(f"http://localhost:{port}/")
        httpd.serve_forever()


if __name__ == "__main__":
    main()
