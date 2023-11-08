package main

import (
	"bytes"
	"fmt"
	"io/ioutil"
	"net/http"
	"os"
	"os/exec"
	"strings"

	"encoding/json"

	"bufio"

	"log"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

const domain string = "robotbox.es"

func readLines(path string) ([]string, error) {
	file, err := os.Open(path)
	if err != nil {
		return nil, err
	}
	defer file.Close()

	var lines []string
	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		lines = append(lines, scanner.Text())
	}
	return lines, scanner.Err()
}

// writeLines writes the lines to the given file.
func writeLines(lines []string, path string) error {
	file, err := os.Create(path)
	if err != nil {
		return err
	}
	defer file.Close()

	w := bufio.NewWriter(file)
	for _, line := range lines {
		fmt.Fprintln(w, line)
	}
	return w.Flush()
}

func updatePage(c echo.Context) error {
	name := c.QueryParam("name")
	token := c.QueryParam("token")
	//authmethod := c.QueryParam("authmethod")
	authprovider := c.QueryParam("authprovider")
	repo := c.QueryParam("repo")

	if strings.ContainsAny(name, `\/:*? "<>|&%. '#[]+=„“`) {
		return c.String(http.StatusBadRequest, "malformed page name")
	}

	httpposturl := "https://" + authprovider + "/api/i"
	fmt.Println("HTTP JSON POST URL:", httpposturl)

	var jsonData = []byte(`{
		"i": "` + token + `"
	}`)
	request, error := http.NewRequest("POST", httpposturl, bytes.NewBuffer(jsonData))
	request.Header.Set("Content-Type", "application/json; charset=UTF-8")

	client := &http.Client{}
	response, error := client.Do(request)
	if error != nil {
		panic(error)
	}
	defer response.Body.Close()

	//fmt.Println("response Status:", response.Status)
	//fmt.Println("response Headers:", response.Header)
	body, _ := ioutil.ReadAll(response.Body)
	//fmt.Println("response Body:", string(body))

	var user map[string]interface{}

	json.Unmarshal(body, &user)

	obtainedid := user["id"].(string)

	metafile := domain + "/" + name + ".txt"

	lines, err := readLines(metafile)
	if err != nil {
		//assume page has never been created before
		var towrite [2]string
		towrite[0] = authprovider
		towrite[1] = obtainedid
		//towrite[2] = repo

		if err := writeLines(towrite[:], metafile); err != nil {
			log.Fatalf("writeLines: %s", err)
		}
	} else {
		//actual auth, like 2 lines lmao
		if lines[0] != authprovider || lines[1] != obtainedid {
			return c.String(http.StatusForbidden, "non-matched auth")
		}
	}

	app := "./autobox.sh"

	cmd := exec.Command("/bin/bash", app, repo, name)
	stdout, err := cmd.Output()

	if err != nil {
		fmt.Println(err.Error())
		return c.String(http.StatusUnprocessableEntity, name)
	}

	// Print the output
	fmt.Println(string(stdout))

	return c.String(http.StatusOK, name)
}

func main() {
	// Echo instance
	e := echo.New()

	// Middleware
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())

	// Routes
	e.POST("/api/update", updatePage)

	// Start server
	e.Logger.Fatal(e.Start(":1323"))
}

// Handler
func hello(c echo.Context) error {
	return c.String(http.StatusOK, "Hello, World!")
}
