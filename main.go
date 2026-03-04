package main

import (
	"fmt"
	"io"
	"log"
	"net/http"
	"path/filepath"

	"groupiepersso/internal/core"
)
func proxyAPI(targetURL string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		resp, err := http.Get(targetURL)
		if err != nil {
			http.Error(w, "API unavailable", http.StatusServiceUnavailable)
			return
		}
		defer resp.Body.Close()
		for key, values := range resp.Header {
			for _, value := range values {
				w.Header().Add(key, value)
			}
		}
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(resp.StatusCode)
		io.Copy(w, resp.Body)
	}
}

func main() {
	cfg := core.LoadConfig()
	fs := http.FileServer(http.Dir(filepath.Join("web", "static")))
	http.Handle("/static/", http.StripPrefix("/static/", fs))
	http.HandleFunc("/api/audio-proxy", func(w http.ResponseWriter, r *http.Request) {
		url := r.URL.Query().Get("url")
		if url == "" {
			http.Error(w, "missing url", http.StatusBadRequest)
			return
		}
		req, err := http.NewRequest(http.MethodGet, url, nil)
		if err != nil {
			http.Error(w, "invalid url", http.StatusBadRequest)
			return
		}
		req.Header.Set("User-Agent", "Mozilla/5.0 (compatible; GroupieProxy/1.0)")
		resp, err := http.DefaultClient.Do(req)
		if err != nil {
			http.Error(w, "upstream error", http.StatusBadGateway)
			return
		}
		defer resp.Body.Close()
		if ct := resp.Header.Get("Content-Type"); ct != "" {
			w.Header().Set("Content-Type", ct)
		} else {
			w.Header().Set("Content-Type", "audio/mpeg")
		}
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.WriteHeader(resp.StatusCode)
		io.Copy(w, resp.Body)
	})
	http.HandleFunc("/search.html", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, filepath.Join("web", "templates", "search.html"))
	})

	http.HandleFunc("/geoloc.html", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, filepath.Join("web", "templates", "geoloc.html"))
	})

	http.HandleFunc("/favorites.html", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, filepath.Join("web", "templates", "favorites.html"))
	})

	http.HandleFunc("/login", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, filepath.Join("web", "templates", "login.html"))
	})
	http.HandleFunc("/api/artists-proxy", proxyAPI(fmt.Sprintf("%s/artists", cfg.GroupieTrackerAPI)))
	http.HandleFunc("/api/locations-proxy", proxyAPI(fmt.Sprintf("%s/locations", cfg.GroupieTrackerAPI)))
	http.HandleFunc("/api/dates-proxy", proxyAPI(fmt.Sprintf("%s/dates", cfg.GroupieTrackerAPI)))
	http.HandleFunc("/api/relation-proxy", proxyAPI(fmt.Sprintf("%s/relation", cfg.GroupieTrackerAPI)))
	http.HandleFunc("/api/relations-proxy", proxyAPI(fmt.Sprintf("%s/relation", cfg.GroupieTrackerAPI)))
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/" {
			http.NotFound(w, r)
			return
		}
		http.ServeFile(w, r, "index.html")
	})

	port := cfg.Port
	log.Printf("Starting server on :%s — open http://localhost:%s/", port, port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}


