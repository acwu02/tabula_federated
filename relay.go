package main

import (
	"encoding/json"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/joho/godotenv"
)

func init() {
	err := godotenv.Load()
	if err != nil {
		log.Fatalf("Error loading .env file")
	}
}

var port string
var startNodePort string
var endNodePort string

type RelayResponse struct {
	Message string `json:"message"`
}

func relayNode(port int) {
	portStr := strconv.Itoa(port)
	log.Printf("Relaying to port %s", portStr)
	resp, err := http.Get("http://localhost:" + portStr + "/relay")
	if err != nil {
		log.Printf("Error relaying to port %s", portStr)
		log.Printf("Error: %v", err)
		return
	}
	defer resp.Body.Close()

	respBody, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		log.Printf("Error reading response body from port %s", portStr)
		log.Printf("Error: %v", err)
		return
	}

	log.Printf("Response from port %s: %s", portStr, string(respBody))
}

func relayHandler(w http.ResponseWriter, r *http.Request) {

	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	startNodePort = os.Getenv("START_NODE_PORT")
	endNodePort = os.Getenv("END_NODE_PORT")

	response := RelayResponse{Message: "Starting relay from " + startNodePort + " to " + endNodePort}

	startNodePort, err := strconv.Atoi(startNodePort)
	if err != nil {
		log.Fatalf("Invalid START_NODE_PORT: %v", err)
	}
	endNodePort, err := strconv.Atoi(endNodePort)
	if err != nil {
		log.Fatalf("Invalid END_NODE_PORT: %v", err)
	}

	for port := startNodePort; port <= endNodePort; port++ {
		go relayNode(port)
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)

}

func main() {
	port = os.Getenv("RELAY_PORT")
	log.Printf("Starting relay server on port %s", port)
	http.HandleFunc("/relay", relayHandler)

	go func() {
		time.Sleep(1 * time.Second) // Give the server a moment to start
		resp, err := http.Get("http://localhost:" + port + "/relay")
		if err != nil {
			log.Fatalf("Error calling relayHandler: %v", err)
		}
		defer resp.Body.Close()
	}()

	http.ListenAndServe(":"+port, nil)
}
