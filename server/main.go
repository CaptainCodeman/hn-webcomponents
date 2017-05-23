package app

import (
	"bytes"
	"fmt"
	"strconv"
	"time"

	"net/http"

	"github.com/CloudyKit/jet"
	"github.com/patrickmn/go-cache"
	"google.golang.org/appengine"
)

type (
	listContext struct {
		Key  string
		Page int
		Data []*model
	}
)

var (
	views = jet.NewHTMLSet("./views")
	store = cache.New(5*time.Minute, 1*time.Minute)
)

func init() {
	lists := map[string]string{
		"top":  "news",
		"new":  "newest",
		"ask":  "ask",
		"show": "show",
		"jobs": "jobs",
	}

	m := http.NewServeMux()
	for k, v := range lists {
		m.Handle(fmt.Sprintf("/%s/", k), list(k, k, v))
	}
	m.Handle("/", list("", "top", "news"))
	m.HandleFunc("/about", about)
	m.HandleFunc("/index.html", index)

	http.Handle("/", httpPush(httpCache(minifier(m))))
}

func about(w http.ResponseWriter, r *http.Request) {
	var buf bytes.Buffer

	x, found := store.Get("about")
	if found {
		buf = *x.(*bytes.Buffer)
	} else {
		templateName := "about"
		t, err := views.GetTemplate(templateName)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		vars := make(jet.VarMap)
		if err = t.Execute(&buf, vars, nil); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		store.Set("about", &buf, cache.DefaultExpiration)
	}

	h := w.Header()
	h.Set("Content-Type", "text/html")

	w.Write(buf.Bytes())
}

func index(w http.ResponseWriter, r *http.Request) {
	var buf bytes.Buffer

	x, found := store.Get("index")
	if found {
		buf = *x.(*bytes.Buffer)
	} else {
		templateName := "index"
		t, err := views.GetTemplate(templateName)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		vars := make(jet.VarMap)
		if err = t.Execute(&buf, vars, nil); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		store.Set("index", &buf, cache.DefaultExpiration)
	}

	h := w.Header()
	h.Set("Content-Type", "text/html")

	w.Write(buf.Bytes())
}

func list(prefix, key, value string) http.Handler {
	pos := 1
	if len(prefix) > 0 {
		pos = len(prefix) + 2
	}

	fn := func(w http.ResponseWriter, r *http.Request) {
		page, _ := strconv.Atoi(r.URL.Path[pos:])
		if page == 0 {
			page = 1
		}

		var buf bytes.Buffer

		cacheKey := fmt.Sprintf("%s/%d", value, page)
		x, found := store.Get(cacheKey)

		if found {
			buf = *x.(*bytes.Buffer)
		} else {
			ctx := appengine.NewContext(r)
			data, err := getData(ctx, value, page)
			if err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}

			templateName := "list"
			t, err := views.GetTemplate(templateName)
			if err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}

			vars := make(jet.VarMap)
			model := listContext{
				Key:  key,
				Page: page,
				Data: data,
			}
			if err = t.Execute(&buf, vars, model); err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			store.Set(cacheKey, &buf, cache.DefaultExpiration)
		}

		h := w.Header()
		h.Set("Content-Type", "text/html")

		w.Write(buf.Bytes())
	}
	return http.HandlerFunc(fn)
}
