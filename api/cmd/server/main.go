package main

import (
	"log"
	"net/http"
	"os"

	"github.com/josuegoyret/sumthing/api/internal/dictation"
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

	var dictator *dictation.Dictator
	if apiKey := os.Getenv("OPENAI_API_KEY"); apiKey != "" {
		dictator = dictation.New(apiKey)
	}

	log.Printf("listening on :%s, allowing %s, dictation %t", port, allowedOrigin, dictator != nil)
	log.Fatal(http.ListenAndServe(":"+port, httpapi.NewHandler(allowedOrigin, dictator)))
}
