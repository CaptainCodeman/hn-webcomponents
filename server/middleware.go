package app

import (
	"fmt"
	"time"

	"net/http"

	"github.com/tdewolff/minify"
	"github.com/tdewolff/minify/css"
	"github.com/tdewolff/minify/html"
	"github.com/tdewolff/minify/js"
)

func minifier(next http.Handler) http.Handler {
	m := minify.New()
	m.AddFunc("text/html", html.Minify)
	m.AddFunc("text/css", css.Minify)
	m.AddFunc("text/javascript", js.Minify)
	return m.Middleware(next)
}

func httpCache(next http.Handler) http.Handler {
	seconds := 60
	fn := func(w http.ResponseWriter, r *http.Request) {
		now := time.Now().UTC()
		cacheSince := now.Format(http.TimeFormat)
		cacheUntil := now.Add(time.Duration(seconds) * time.Second).Format(http.TimeFormat)
		cacheControl := fmt.Sprintf("public, max-age=%d", seconds)
		head := w.Header()
		head.Set("Cache-control", cacheControl)
		head.Set("Pragma", "Public")
		head.Set("Last-Modified", cacheSince)
		head.Set("Expires", cacheUntil)
		next.ServeHTTP(w, r)
	}
	return http.HandlerFunc(fn)
}

func httpPush(next http.Handler) http.Handler {
	fn := func(w http.ResponseWriter, r *http.Request) {
		head := w.Header()
		head.Add("link", "</static/index.4ca7c4a39debdfacb113b32584d86fdaae83cea8.js>; rel=preload; as=script")
		next.ServeHTTP(w, r)
	}
	return http.HandlerFunc(fn)
}
