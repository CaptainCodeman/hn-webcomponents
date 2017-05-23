package app

import (
	"fmt"

	"encoding/json"

	"golang.org/x/net/context"
	"google.golang.org/appengine/urlfetch"
)

type (
	model struct {
		ID            int64  `json:"id"`
		Title         string `json:"title"`
		Points        int64  `json:"points"`
		User          string `json:"user"`
		Time          int64  `json:"time"`
		TimeAgo       string `json:"time_ago"`
		CommentsCount int64  `json:"comments_count"`
		Type          string `json:"type"`
		URL           string `json:"url"`
		Domain        string `json:"domain"`
	}
)

func getData(ctx context.Context, value string, page int) ([]*model, error) {
	url := fmt.Sprintf("https://node-hnapi.herokuapp.com/%s?page=%d", value, page)

	c := urlfetch.Client(ctx)
	resp, err := c.Get(url)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var data []*model
	dec := json.NewDecoder(resp.Body)
	if err := dec.Decode(&data); err != nil {
		return nil, err
	}

	return data, nil
}
