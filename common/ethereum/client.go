package ethereum

import (
	"context"
	"errors"
	"fmt"
	"webapi_erc20/common/config"
	"webapi_erc20/common/utils"

	"github.com/ethereum/go-ethereum/ethclient"
)

// type EthClient struct {
// 	NodeUrl []string
// }

// var instance *EthClient

// func GetInstance() *EthClient {
// 	if instance == nil {
// 		instance = &EthClient{
// 			NodeUrl: config.GetConfig().Config.Node.Url,
// 		}
// 	}
// 	return instance
// }

func getClient(ctx context.Context) (*ethclient.Client, error) {
	return dialNode(func(url string) (*ethclient.Client, error) {
		return ethclient.DialContext(ctx, url)
	})
}

func GetClientNoCtx() (*ethclient.Client, error) {
	return dialNode(ethclient.Dial)
}

// 依序嘗試每個節點, 回傳第一個可用的 client
// 注意: 節點清單為空或全部不可用時, 一律回傳 error, 不可回傳 nil client
func dialNode(dial func(url string) (*ethclient.Client, error)) (*ethclient.Client, error) {
	nodeUrl := config.GetConfig().Config.Node.Url
	if len(nodeUrl) == 0 {
		return nil, errors.New("node.url is empty, please check config.yaml (node: url)")
	}

	var lastErr error
	for _, url := range nodeUrl {
		client, err := dial(url)
		if err != nil {
			lastErr = fmt.Errorf("dial node error: %w", err)
			continue
		}

		if ping(client) {
			return client, nil
		}

		client.Close()
		lastErr = errors.New("node ping failed")
	}

	return nil, fmt.Errorf("no available node: %w", lastErr)
}

func ping(client *ethclient.Client) bool {
	ctx, cancel := context.WithTimeout(context.Background(), utils.Time30S)
	defer cancel()

	_, err := GetBlockNumberLatest(ctx, client)
	if err != nil {
		return false
	}

	return true
}
