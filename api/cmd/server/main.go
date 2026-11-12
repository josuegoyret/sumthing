package main

import (
	"log"
	"net/http"
	"os"

	"github.com/josuegoyret/sumthing/api/internal/httpapi"
)

const (
	defaultPort          = "8080"
	defaultAllowedOrigin = "http://localhost:5173"
)

func envOr(name, fallback string) string {
	if value := os.Getenv(name); value != "" {
		return value
	}
	return fallback
}

func main() {
	port := envOr("PORT", defaultPort)
	allowedOrigin := envOr("ALLOWED_ORIGIN", defaultAllowedOrigin)

	log.Printf("listening on :%s, allowing %s", port, allowedOrigin)
	log.Fatal(http.ListenAndServe(":"+port, httpapi.NewHandler(allowedOrigin)))
}
